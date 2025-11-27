import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createInterface } from "node:readline/promises";
import {
  chromium,
  type BrowserContext,
  type Page,
  type Request,
  type Response,
} from "playwright";
import dotenv from "dotenv";

const AMAZON_READER_URL = "https://read.amazon.com/";
const RENDERER_ENDPOINT = "/renderer/render";
const STILL_READING_ENDPOINT = "/service/mobile/reader/stillReading";
const ANNOTATIONS_ENDPOINT = "/service/mobile/reader/getAnnotations";
const DEVICE_TOKEN_ENDPOINT = "/service/web/register/getDeviceToken";
const COOKIE_NAMES = ["ubid-main", "at-main", "x-main", "session-id"] as const;
const DEFAULT_TLS_URL = "http://localhost:8080";
const DEFAULT_TLS_KEY = "my-auth-key-1";
const LEGACY_TLS_URLS = ["https://your-tls-server.example.com"];
const LEGACY_TLS_KEYS = ["replace-with-api-key"];

type CaptureState = {
  deviceToken?: string;
  deviceSessionToken?: string;
  renderingToken?: string;
  rendererRevision?: string;
  guid?: string;
  asin?: string;
  startingPosition?: string;
  kindleSessionId?: string;
  adpSessionToken?: string;
};

async function main(): Promise<void> {
  const headless =
    process.env.HEADLESS === "true" || process.env.CI === "true";
  console.log(`Launching Chromium (headless=${headless})...`);
  const browser = await chromium.launch({
    headless,
    args: [...CHROMIUM_PRIVACY_ARGS],
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();
  const capture: CaptureState = {};
  const stopTracking = trackNetwork(page, capture);

  try {
    await page.goto(AMAZON_READER_URL, { waitUntil: "domcontentloaded" });
    console.log("");
    console.log("A browser window should now be visible.");
    console.log(
      "1. Sign into your Amazon account (SMS 2FA is supported via the UI)."
    );
    console.log(
      "2. Open any Kindle book so the reader loads, then flip a page to trigger rendering requests."
    );
    console.log(
      "3. Once you see the page content, return here and press ENTER. Leave the browser window open."
    );
    console.log("");

    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    await rl.question("Press ENTER only after the book reader is fully loaded.");
    rl.close();

    const cookies = await collectCookies(context);
    const envPath = path.resolve(process.cwd(), ".env");
    const existingEnv = await readEnvFile(envPath);

    const tlsServerUrl =
      !existingEnv.TLS_SERVER_URL ||
      LEGACY_TLS_URLS.includes(existingEnv.TLS_SERVER_URL)
        ? DEFAULT_TLS_URL
        : existingEnv.TLS_SERVER_URL;
    const tlsServerApiKey =
      !existingEnv.TLS_SERVER_API_KEY ||
      LEGACY_TLS_KEYS.includes(existingEnv.TLS_SERVER_API_KEY)
        ? DEFAULT_TLS_KEY
        : existingEnv.TLS_SERVER_API_KEY;

    const envUpdates: Record<string, string | undefined> = {
      COOKIES: cookies,
      DEVICE_TOKEN: capture.deviceToken,
      GUID: capture.guid,
      RENDERING_TOKEN: capture.renderingToken,
      RENDERER_REVISION: capture.rendererRevision,
      KINDLE_SESSION_ID: capture.kindleSessionId,
      ADP_SESSION_TOKEN: capture.adpSessionToken ?? capture.deviceSessionToken,
      DEVICE_SESSION_TOKEN: capture.deviceSessionToken,
      TEST_ASIN: capture.asin,
      TEST_POSITION: capture.startingPosition,
    };

    if (
      !existingEnv.TLS_SERVER_URL ||
      LEGACY_TLS_URLS.includes(existingEnv.TLS_SERVER_URL)
    ) {
      envUpdates.TLS_SERVER_URL = tlsServerUrl;
    }
    if (
      !existingEnv.TLS_SERVER_API_KEY ||
      LEGACY_TLS_KEYS.includes(existingEnv.TLS_SERVER_API_KEY)
    ) {
      envUpdates.TLS_SERVER_API_KEY = tlsServerApiKey;
    }

    envUpdates.KINDLE_CONFIG_JSON = JSON.stringify({
      cookies,
      deviceToken: capture.deviceToken ?? "",
      guid: capture.guid ?? "",
      renderingToken: capture.renderingToken ?? "",
      rendererRevision: capture.rendererRevision ?? "",
      tlsServer: {
        url: tlsServerUrl,
        apiKey: tlsServerApiKey,
      },
    });

    const finalEnv = { ...existingEnv };
    for (const [key, value] of Object.entries(envUpdates)) {
      if (value === undefined) {
        continue;
      }
      finalEnv[key] = value;
    }

    await writeEnvFile(envPath, finalEnv);

    console.log("");
    console.log(`Updated ${envPath}`);

    reportMissingFields(capture);
  } finally {
    stopTracking();
    await browser.close();
  }
}

function trackNetwork(page: Page, state: CaptureState): () => void {
  const onRequest = async (request: Request): Promise<void> => {
    const url = tryCreateUrl(request.url());
    if (!url || !url.hostname.endsWith("amazon.com")) {
      return;
    }

    if (url.pathname.includes(RENDERER_ENDPOINT)) {
      record(
        state,
        "rendererRevision",
        url.searchParams.get("revision") ??
          url.searchParams.get("rId") ??
          url.searchParams.get("rid")
      );
      recordGuid(state, url.searchParams.get("guid"));
      record(state, "asin", url.searchParams.get("asin"));
      record(state, "startingPosition", url.searchParams.get("startingPosition"));

      const headers = await request.allHeaders();
      record(state, "renderingToken", headers["x-amz-rendering-token"]);
    }

    if (
      url.pathname.includes(STILL_READING_ENDPOINT) ||
      url.pathname.includes(ANNOTATIONS_ENDPOINT)
    ) {
      const headers = await request.allHeaders();
      record(state, "adpSessionToken", headers["x-adp-session-token"]);
      record(state, "kindleSessionId", headers["x-amzn-sessionid"]);
      recordGuid(state, url.searchParams.get("guid"));

      const body = safeJsonParse<Record<string, unknown>>(request.postData());
      if (body) {
        recordGuid(state, readPossibleKey(body, ["guid", "readerGuid"]));
        record(state, "kindleSessionId", readPossibleKey(body, ["kindleSessionId", "sessionId"]));
      }
    }

    if (url.pathname.includes(DEVICE_TOKEN_ENDPOINT)) {
      record(state, "deviceToken", url.searchParams.get("serialNumber"));
    }
  };

  const onResponse = async (response: Response): Promise<void> => {
    const url = tryCreateUrl(response.url());
    if (!url || !url.hostname.endsWith("amazon.com")) {
      return;
    }

    if (url.pathname.includes(DEVICE_TOKEN_ENDPOINT)) {
      const data = await parseResponseJson(response);
      if (data && typeof data === "object") {
        record(
          state,
          "deviceToken",
          readPossibleKey(data as Record<string, unknown>, ["deviceToken", "serialNumber"])
        );
        const deviceSessionToken = readPossibleKey(
          data as Record<string, unknown>,
          ["deviceSessionToken"]
        );
        record(state, "deviceSessionToken", deviceSessionToken);
        record(state, "adpSessionToken", deviceSessionToken);
      }
    }

    if (url.pathname.includes(STILL_READING_ENDPOINT)) {
      const headers = response.headers();
      const adpTokenFromResponse =
        headers["x-adp-session-token"] ?? headers["X-Adp-Session-Token"];
      record(state, "adpSessionToken", adpTokenFromResponse);
      if (!state.guid) {
        const data = await parseResponseJson(response);
        if (data && typeof data === "object") {
          recordGuid(
            state,
            readPossibleKey(data as Record<string, unknown>, ["guid", "readerGuid"])
          );
        }
      }
    }
  };

  page.on("request", onRequest);
  page.on("response", onResponse);

  return () => {
    page.off("request", onRequest);
    page.off("response", onResponse);
  };
}

async function collectCookies(context: BrowserContext): Promise<string> {
  const cookies = await context.cookies(AMAZON_READER_URL);
  const map = new Map<string, string>();
  for (const cookie of cookies) {
    if (COOKIE_NAMES.includes(cookie.name as (typeof COOKIE_NAMES)[number])) {
      map.set(cookie.name, cookie.value);
    }
  }

  const missing = COOKIE_NAMES.filter((name) => !map.has(name));
  if (missing.length > 0) {
    throw new Error(
      `Unable to find the required cookies (${missing.join(
        ", "
      )}). Verify that you are logged into https://read.amazon.com and try again.`
    );
  }

  return COOKIE_NAMES.map(
    (name) => `${name}=${map.get(name) ?? ""}`
  ).join("; ");
}

async function readEnvFile(filePath: string): Promise<Record<string, string>> {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return dotenv.parse(content);
  } catch (error) {
    if (isEnoent(error)) {
      return {};
    }
    throw error;
  }
}

async function writeEnvFile(
  filePath: string,
  values: Record<string, string>
): Promise<void> {
  const content =
    Object.entries(values)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n") + "\n";
  await fs.writeFile(filePath, content, "utf8");
}

function record<K extends keyof CaptureState>(
  state: CaptureState,
  key: K,
  value?: string | null
): void {
  if (!value || state[key]) {
    return;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return;
  }
  state[key] = trimmed;
  console.log(`[capture] ${key}: ${trimmed}`);
}

function recordGuid(state: CaptureState, raw?: string | null): void {
  const normalized = normalizeGuid(raw);
  if (!normalized) {
    return;
  }
  record(state, "guid", normalized);
}

function normalizeGuid(value?: string | null): string | undefined {
  if (!value) {
    return;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return;
  }
  const segments = trimmed.split(",");
  const candidate = segments[segments.length - 1]?.trim();
  if (!candidate) {
    return;
  }
  const match = candidate.match(/CR![A-Z0-9]+/);
  if (match?.[0]) {
    return match[0];
  }
  return candidate;
}

function readPossibleKey(
  body: Record<string, unknown>,
  keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = body[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
}

function tryCreateUrl(target: string): URL | undefined {
  try {
    return new URL(target);
  } catch {
    return undefined;
  }
}

function safeJsonParse<T>(value: string | null | undefined): T | undefined {
  if (!value) {
    return;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return;
  }
}

async function parseResponseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function isEnoent(error: unknown): error is NodeJS.ErrnoException {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}

function reportMissingFields(state: CaptureState): void {
  const required: Array<keyof CaptureState> = [
    "deviceToken",
    "rendererRevision",
    "renderingToken",
    "guid",
  ];
  const missing = required.filter((key) => !state[key]);
  if (missing.length === 0) {
    console.log("Captured renderer + GUID metadata successfully.");
  } else {
    console.warn(
      `Missing some renderer metadata (${missing.join(
        ", "
      )}). Try refreshing the reader tab and flipping a page to trigger the requests.`
    );
  }

  if (!state.adpSessionToken) {
    console.warn(
      "Missing x-adp-session-token. Open a book and ensure the page fully loads to capture stillReading traffic."
    );
  }
}

const CHROMIUM_PRIVACY_ARGS = [
  "--disable-bluetooth",
  "--disable-bluetooth-scanning",
  "--disable-features=Bluetooth,EnableBLEAdvertising",
  "--use-fake-device-for-media-stream",
  "--use-fake-ui-for-media-stream",
] as const;

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

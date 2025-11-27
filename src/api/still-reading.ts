import { randomUUID } from "node:crypto";

import { HttpClient } from "../http-client.js";
import { buildStillReadingUrl } from "../urls.js";

export type StillReadingOptions = {
  asin: string;
  position: string;
  guid?: string;
  kindleSessionId?: string;
  timezoneOffsetMinutes?: number;
};

export type StillReadingResult = {
  success: boolean;
  status: number;
};

/** Notifies Amazon that the user is still reading at the given position. */
export async function postStillReading(
  client: HttpClient,
  options: StillReadingOptions
): Promise<StillReadingResult> {
  const guid = options.guid ?? client.getGuid();
  const adpSessionToken = client.getAdpSessionId();

  if (!guid) {
    throw new Error("guid is required for stillReading");
  }
  if (!adpSessionToken) {
    throw new Error("ADP session token unavailable; reauthenticate");
  }

  const kindleSessionId = options.kindleSessionId ?? randomUUID();
  const timezoneOffset =
    options.timezoneOffsetMinutes ?? new Date().getTimezoneOffset();

  const url = buildStillReadingUrl(
    options.asin,
    guid,
    options.position,
    kindleSessionId,
    timezoneOffset
  );

  const response = await client.request(url, {
    headers: {
      "x-adp-session-token": adpSessionToken,
      referer: `https://read.amazon.com/?asin=${options.asin}`,
    },
  });

  const success = response.status >= 200 && response.status < 300;
  return { success, status: response.status };
}

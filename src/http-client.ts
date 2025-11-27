import {
  TLSClientRequestPayload,
  TLSClientResponseData,
} from "./tls-client-api.js";

export const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36";

const JSONP_REGEX = /\(({.*})\)/;

/**
 * HTTPClient for doing http requests
 * Can be initialized with a custom CycleTLSClient
 */
export class HttpClient {
  private sessionId?: string;
  private adpSessionId?: string;
  private guid?: string;
  private renderingToken?: string;
  private rendererRevision?: string;

  constructor(
    private readonly cookies: KindleRequiredCookies,
    private readonly clientOptions: TlsClientConfig
  ) {}

  private async _request(
    url: string,
    payload?: Partial<TLSClientRequestPayload>
  ): Promise<Response> {
    const headers: Record<string, string> = {
      Cookie: this.serializeCookies(),
      "Accept-Language": "en-US,en;q=0.9,ko-KR;q=0.8,ko;q=0.7",
      "User-Agent": USER_AGENT,
      ...payload?.headers,
    };

    if (this.sessionId) {
      headers["x-amzn-sessionid"] = this.sessionId;
    }

    if (this.adpSessionId) {
      headers["x-adp-session-token"] = this.adpSessionId;
    }

    const tlsPayload: TLSClientRequestPayload = {
      tlsClientIdentifier: "chrome_112",
      requestUrl: url,
      requestMethod: payload?.requestMethod ?? "GET",
      withDebug: true,
      headers,
    };

    if (payload?.requestBody) {
      tlsPayload.requestBody = payload.requestBody;
    }
    if (payload?.isByteResponse) {
      tlsPayload.isByteResponse = payload.isByteResponse;
    }

    return fetch(`${this.clientOptions.url}/api/forward`, {
      method: "POST",
      body: JSON.stringify(tlsPayload, null, 2),
      headers: {
        "x-api-key": this.clientOptions.apiKey,
      },
    });
  }

  public async request(
    url: string,
    payload?: Partial<TLSClientRequestPayload>
  ): Promise<TLSClientResponseData> {
    const response = await this._request(url, payload);
    const json = await response.json();
    return json as TLSClientResponseData;
  }

  parseJsonpResponse<T>(response: TLSClientResponseData): T | undefined {
    const content = response.body.match(JSONP_REGEX)?.[1];
    if (!content) {
      return;
    }

    return JSON.parse(content);
  }

  updateSession(id: string): void {
    this.sessionId = id;
  }

  getSessionId(): string | undefined {
    return this.sessionId;
  }

  updateAdpSession(id: string): void {
    this.adpSessionId = id;
  }

  getAdpSessionId(): string | undefined {
    return this.adpSessionId;
  }

  updateGuid(id: string): void {
    this.guid = id;
  }

  getGuid(): string | undefined {
    return this.guid;
  }

  updateRenderingToken(token: string): void {
    this.renderingToken = token;
  }

  getRenderingToken(): string | undefined {
    return this.renderingToken;
  }

  updateRendererRevision(revision: string): void {
    this.rendererRevision = revision;
  }

  getRendererRevision(): string | undefined {
    return this.rendererRevision;
  }

  extractSetCookies(response: TLSClientResponseData): Record<string, string> {
    return response.cookies;
  }

  serializeCookies(): string {
    return Object.entries(this.cookies)
      .map(
        ([key, value]) =>
          `${key.replace(/[A-Z]/g, (v) => `-${v.toLowerCase()}`)}=${value}`
      )
      .join("; ")
      .trim();
  }
}

export type KindleRequiredCookies = {
  ubidMain: string;
  atMain: string;
  sessionId: string;
  xMain: string;
};

export type TlsClientConfig = {
  url: string;
  apiKey: string;
};

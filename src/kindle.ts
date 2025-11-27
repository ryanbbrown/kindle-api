import {
  fetchLibrary,
  fetchBookDetails,
  fetchFullBookDetails,
} from "./api/library.js";
import { fetchRenderChunk, type RenderChunkOptions } from "./api/render.js";
import { postStillReading, type StillReadingOptions, type StillReadingResult } from "./api/still-reading.js";
import {
  type KindleRequiredCookies,
  HttpClient,
  type TlsClientConfig,
} from "./http-client.js";
import {
  type KindleBook,
  type KindleBookLightDetails,
  type KindleBookDetails,
} from "./models/book.js";
import { type Filter, type Query } from "./models/query-filter.js";
import { buildDeviceTokenUrl } from "./urls.js";

export type KindleConfiguration = {
  /**
   * Cookie string copied from your browser or exact
   * requried cookies
   */
  cookies: KindleRequiredCookies | string;
  deviceToken: string;
  /** Reader GUID captured from render/stillReading requests. */
  guid?: string;
  /** x-amz-rendering-token header value for renderer requests. */
  renderingToken?: string;
  /** Renderer revision (rId param) for renderer requests. */
  rendererRevision?: string;
  // Optional
  clientVersion?: string;
  tlsServer: TlsClientConfig;

  /**
   * Factory that creates or returns a custom instance of http client.
   */
  clientFactory?: (
    cookies: KindleRequiredCookies,
    clientOptions: TlsClientConfig
  ) => HttpClient;
};

export type KindleOptions = {
  config: KindleConfiguration;
  sessionId: string;
};

export type KindleFromCookieOptions = {
  cookieString: string;
  deviceToken: string;
};

export class Kindle {
  /**
   * The default list of books fetched when setting up {@link Kindle}
   *
   * We need to hit up the books endpoint to get necessary cookies
   * so we save the initial response here just to make sure the
   * user doesn't have to run the same request twice for no reason
   */
  readonly defaultBooks: KindleBook[];
  readonly #client: HttpClient;

  constructor(
    private options: KindleOptions,
    client: HttpClient,
    prePopulatedBooks?: KindleBook[]
  ) {
    this.defaultBooks = prePopulatedBooks ?? [];
    this.#client = client;
  }

  static async fromConfig(config: KindleConfiguration): Promise<Kindle> {
    const cookies =
      typeof config.cookies === "string"
        ? Kindle.deserializeCookies(config.cookies)
        : config.cookies;
    const client =
      config.clientFactory?.(cookies, config.tlsServer) ??
      new HttpClient(cookies, config.tlsServer);

    const { sessionId, books } = await fetchLibrary(client);
    client.updateSession(sessionId);

    const deviceInfo = await Kindle.fetchDeviceToken(client, config.deviceToken);
    client.updateAdpSession(deviceInfo.deviceSessionToken);

    if (config.guid) {
      client.updateGuid(config.guid);
    }
    if (config.renderingToken) {
      client.updateRenderingToken(config.renderingToken);
    }
    if (config.rendererRevision) {
      client.updateRendererRevision(config.rendererRevision);
    }

    return new this(
      {
        config: {
          ...config,
          cookies,
        },
        sessionId,
      },
      client,
      books
    );
  }

  static async fetchDeviceToken(
    client: HttpClient,
    token: string
  ): Promise<KindleDeviceInfo> {
    const url = buildDeviceTokenUrl(token);
    const response = await client.request(url);
    return JSON.parse(response.body) as KindleDeviceInfo;
  }

  static deserializeCookies(cookies: string): KindleRequiredCookies {
    const values = cookies
      .split(";")
      .map((v) => v.split("="))
      .reduce((acc, [key, value]) => {
        acc[decodeURIComponent(key.trim())] = decodeURIComponent(value.trim());
        return acc;
      }, {} as Record<string, string>);

    return {
      atMain: values["at-main"],
      sessionId: values["session-id"],
      ubidMain: values["ubid-main"],
      xMain: values["x-main"],
    };
  }

  /** Fetches the user's Kindle library. */
  async books(args?: {
    query?: Query;
    filter?: Filter;
  }): Promise<KindleBook[]> {
    const result = await fetchLibrary(this.#client, args);
    this.options.sessionId = result.sessionId;
    return result.books;
  }

  /** Fetches basic details about a book. */
  async bookDetails(book: KindleBook): Promise<KindleBookLightDetails> {
    return fetchBookDetails(this.#client, book);
  }

  /** Fetches full details about a book including reading progress percentage. */
  async fullBookDetails(
    book: KindleBook,
    partialDetails?: KindleBookLightDetails
  ): Promise<KindleBookDetails> {
    return fetchFullBookDetails(this.#client, book, partialDetails);
  }

  /** Downloads a renderer chunk as a tar archive. */
  async renderChunk(options: RenderChunkOptions): Promise<Buffer> {
    return fetchRenderChunk(this.#client, options);
  }

  /** Notifies Amazon that the user is still reading at the given position. */
  async stillReading(options: StillReadingOptions): Promise<StillReadingResult> {
    return postStillReading(this.#client, options);
  }
}

export interface KindleDeviceInfo {
  clientHashId: string;
  deviceName: string;
  deviceSessionToken: string;
  eid: string;
}

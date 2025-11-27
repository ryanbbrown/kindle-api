// Main class
export { Kindle, type KindleConfiguration, type KindleOptions, type KindleDeviceInfo } from "./kindle.js";

// Models
export type {
  KindleBook,
  KindleBookDetails,
  KindleBookData,
  KindleBookLightDetails,
  KindleAuthor,
} from "./models/book.js";
export type {
  KindleOwnedBookMetadataResponse,
  KindleBookMetadataResponse,
} from "./models/book-metadata.js";
export type { Query, Filter } from "./models/query-filter.js";

// HTTP client
export {
  HttpClient,
  type KindleRequiredCookies,
  type TlsClientConfig,
} from "./http-client.js";
export type {
  TLSClientRequestPayload,
  TLSClientResponseData,
} from "./tls-client-api.js";

// URL utilities
export {
  DEVICE_TOKEN_URL,
  BOOKS_URL,
  RENDERER_URL,
  STILL_READING_URL,
  START_READING_URL,
  buildDeviceTokenUrl,
  buildRendererUrl,
  buildStillReadingUrl,
  buildStartReadingUrl,
  type RendererUrlArgs,
} from "./urls.js";

// API types
export type { RenderChunkOptions } from "./api/render.js";
export type { StillReadingOptions, StillReadingResult } from "./api/still-reading.js";

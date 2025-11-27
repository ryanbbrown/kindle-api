/** Kindle API URL constants and builders. */
export declare const DEVICE_TOKEN_URL = "https://read.amazon.com/service/web/register/getDeviceToken";
export declare const BOOKS_URL = "https://read.amazon.com/kindle-library/search?query=&libraryType=BOOKS&sortType=recency&querySize=50";
export declare const RENDERER_URL = "https://read.amazon.com/renderer/render";
export declare const STILL_READING_URL = "https://read.amazon.com/service/mobile/reader/stillReading";
export declare const START_READING_URL = "https://read.amazon.com/service/mobile/reader/startReading";
export type RendererUrlArgs = {
    asin: string;
    startingPosition: number | string;
    numPages?: number | string;
    skipPages?: number | string;
    rendererRevision: string;
};
/** Builds the device token URL for the given token. */
export declare function buildDeviceTokenUrl(token: string): string;
/** Builds the Kindle renderer URL for the requested ASIN and config. */
export declare function buildRendererUrl(args: RendererUrlArgs): string;
/** Builds the stillReading URL for updating reading position. */
export declare function buildStillReadingUrl(asin: string, guid: string, position: string, kindleSessionId: string, timezoneOffset: number): string;
/** Builds the startReading URL for fetching book details. */
export declare function buildStartReadingUrl(asin: string, clientVersion: string): string;

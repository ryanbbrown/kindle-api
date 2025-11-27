/** Kindle API URL constants and builders. */
export const DEVICE_TOKEN_URL = "https://read.amazon.com/service/web/register/getDeviceToken";
export const BOOKS_URL = "https://read.amazon.com/kindle-library/search?query=&libraryType=BOOKS&sortType=recency&querySize=50";
export const RENDERER_URL = "https://read.amazon.com/renderer/render";
export const STILL_READING_URL = "https://read.amazon.com/service/mobile/reader/stillReading";
export const START_READING_URL = "https://read.amazon.com/service/mobile/reader/startReading";
/** Builds the device token URL for the given token. */
export function buildDeviceTokenUrl(token) {
    const params = new URLSearchParams({
        serialNumber: token,
        deviceType: token,
    });
    return `${DEVICE_TOKEN_URL}?${params.toString()}`;
}
/** Builds the Kindle renderer URL for the requested ASIN and config. */
export function buildRendererUrl(args) {
    const params = new URLSearchParams({
        version: "3.0",
        asin: args.asin,
        contentType: "FullBook",
        revision: args.rendererRevision,
        fontFamily: "Bookerly",
        fontSize: "8.91",
        lineHeight: "1.4",
        dpi: "160",
        height: "784",
        width: "886",
        marginBottom: "0",
        marginLeft: "9",
        marginRight: "9",
        marginTop: "0",
        maxNumberColumns: "2",
        theme: "dark",
        locationMap: "false",
        packageType: "TAR",
        encryptionVersion: "NONE",
        numPage: String(args.numPages ?? 5),
        skipPageCount: String(args.skipPages ?? 0),
        startingPosition: String(args.startingPosition),
        bundleImages: "false",
    });
    return `${RENDERER_URL}?${params.toString()}`;
}
/** Builds the stillReading URL for updating reading position. */
export function buildStillReadingUrl(asin, guid, position, kindleSessionId, timezoneOffset) {
    const params = `?asin=${encodeURIComponent(asin)}` +
        `&guid=${guid}` +
        `&kindleSessionId=${encodeURIComponent(kindleSessionId)}` +
        `&lastPageRead=${encodeURIComponent(position)}` +
        `&positionType=YJBinary` +
        `&localTimeOffset=${encodeURIComponent(String(-timezoneOffset))}` +
        `&clientVersion=20000100`;
    return `${STILL_READING_URL}${params}`;
}
/** Builds the startReading URL for fetching book details. */
export function buildStartReadingUrl(asin, clientVersion) {
    const params = new URLSearchParams({ asin, clientVersion });
    return `${START_READING_URL}?${params.toString()}`;
}

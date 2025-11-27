"use strict";
/** Kindle API URL constants and builders. */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildStartReadingUrl = exports.buildStillReadingUrl = exports.buildRendererUrl = exports.buildDeviceTokenUrl = exports.START_READING_URL = exports.STILL_READING_URL = exports.RENDERER_URL = exports.BOOKS_URL = exports.DEVICE_TOKEN_URL = void 0;
exports.DEVICE_TOKEN_URL = "https://read.amazon.com/service/web/register/getDeviceToken";
exports.BOOKS_URL = "https://read.amazon.com/kindle-library/search?query=&libraryType=BOOKS&sortType=recency&querySize=50";
exports.RENDERER_URL = "https://read.amazon.com/renderer/render";
exports.STILL_READING_URL = "https://read.amazon.com/service/mobile/reader/stillReading";
exports.START_READING_URL = "https://read.amazon.com/service/mobile/reader/startReading";
/** Builds the device token URL for the given token. */
function buildDeviceTokenUrl(token) {
    const params = new URLSearchParams({
        serialNumber: token,
        deviceType: token,
    });
    return `${exports.DEVICE_TOKEN_URL}?${params.toString()}`;
}
exports.buildDeviceTokenUrl = buildDeviceTokenUrl;
/** Builds the Kindle renderer URL for the requested ASIN and config. */
function buildRendererUrl(args) {
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
    return `${exports.RENDERER_URL}?${params.toString()}`;
}
exports.buildRendererUrl = buildRendererUrl;
/** Builds the stillReading URL for updating reading position. */
function buildStillReadingUrl(asin, guid, position, kindleSessionId, timezoneOffset) {
    const params = `?asin=${encodeURIComponent(asin)}` +
        `&guid=${guid}` +
        `&kindleSessionId=${encodeURIComponent(kindleSessionId)}` +
        `&lastPageRead=${encodeURIComponent(position)}` +
        `&positionType=YJBinary` +
        `&localTimeOffset=${encodeURIComponent(String(-timezoneOffset))}` +
        `&clientVersion=20000100`;
    return `${exports.STILL_READING_URL}${params}`;
}
exports.buildStillReadingUrl = buildStillReadingUrl;
/** Builds the startReading URL for fetching book details. */
function buildStartReadingUrl(asin, clientVersion) {
    const params = new URLSearchParams({ asin, clientVersion });
    return `${exports.START_READING_URL}?${params.toString()}`;
}
exports.buildStartReadingUrl = buildStartReadingUrl;

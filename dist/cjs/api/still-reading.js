"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postStillReading = void 0;
const node_crypto_1 = require("node:crypto");
const urls_js_1 = require("../urls.js");
/** Notifies Amazon that the user is still reading at the given position. */
async function postStillReading(client, options) {
    const guid = options.guid ?? client.getGuid();
    const adpSessionToken = client.getAdpSessionId();
    if (!guid) {
        throw new Error("guid is required for stillReading");
    }
    if (!adpSessionToken) {
        throw new Error("ADP session token unavailable; reauthenticate");
    }
    const kindleSessionId = options.kindleSessionId ?? (0, node_crypto_1.randomUUID)();
    const timezoneOffset = options.timezoneOffsetMinutes ?? new Date().getTimezoneOffset();
    const url = (0, urls_js_1.buildStillReadingUrl)(options.asin, guid, options.position, kindleSessionId, timezoneOffset);
    const response = await client.request(url, {
        headers: {
            "x-adp-session-token": adpSessionToken,
            referer: `https://read.amazon.com/?asin=${options.asin}`,
        },
    });
    const success = response.status >= 200 && response.status < 300;
    return { success, status: response.status };
}
exports.postStillReading = postStillReading;

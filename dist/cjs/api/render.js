"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchRenderChunk = void 0;
const urls_js_1 = require("../urls.js");
/** Downloads a renderer chunk as a tar archive. */
async function fetchRenderChunk(client, options) {
    const revision = options.rendererRevision ?? client.getRendererRevision();
    const token = options.renderingToken ?? client.getRenderingToken();
    if (!revision) {
        throw new Error("rendererRevision is required for renderChunk");
    }
    if (!token) {
        throw new Error("renderingToken is required for renderChunk");
    }
    const url = (0, urls_js_1.buildRendererUrl)({
        asin: options.asin,
        startingPosition: options.startingPosition,
        numPages: options.numPages,
        skipPages: options.skipPages,
        rendererRevision: revision,
    });
    const response = await client.request(url, {
        headers: { "x-amz-rendering-token": token },
        isByteResponse: true,
    });
    if (response.status !== 200) {
        const bodySample = String(response.body).slice(0, 500);
        throw new Error(`Renderer request failed: status=${response.status} body=${bodySample}`);
    }
    return coerceToBuffer(response.body);
}
exports.fetchRenderChunk = fetchRenderChunk;
/** Converts a TLS client response body into a Buffer. */
function coerceToBuffer(body) {
    if (Buffer.isBuffer(body)) {
        return body;
    }
    if (typeof body === "string") {
        if (body.startsWith("data:")) {
            const commaIndex = body.indexOf(",");
            if (commaIndex === -1) {
                throw new Error("Malformed data URI response");
            }
            return Buffer.from(body.slice(commaIndex + 1), "base64");
        }
        const sample = body.slice(0, 100);
        if (/^[A-Za-z0-9+/]+=*$/.test(sample)) {
            return Buffer.from(body, "base64");
        }
        return Buffer.from(body, "binary");
    }
    throw new Error("Unexpected response body type");
}

var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Kindle_client;
import { fetchLibrary, fetchBookDetails, fetchFullBookDetails, } from "./api/library.js";
import { fetchRenderChunk } from "./api/render.js";
import { postStillReading } from "./api/still-reading.js";
import { HttpClient, } from "./http-client.js";
import { buildDeviceTokenUrl } from "./urls.js";
export class Kindle {
    constructor(options, client, prePopulatedBooks) {
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: options
        });
        /**
         * The default list of books fetched when setting up {@link Kindle}
         *
         * We need to hit up the books endpoint to get necessary cookies
         * so we save the initial response here just to make sure the
         * user doesn't have to run the same request twice for no reason
         */
        Object.defineProperty(this, "defaultBooks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        _Kindle_client.set(this, void 0);
        this.defaultBooks = prePopulatedBooks ?? [];
        __classPrivateFieldSet(this, _Kindle_client, client, "f");
    }
    static async fromConfig(config) {
        const cookies = typeof config.cookies === "string"
            ? Kindle.deserializeCookies(config.cookies)
            : config.cookies;
        const client = config.clientFactory?.(cookies, config.tlsServer) ??
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
        return new this({
            config: {
                ...config,
                cookies,
            },
            sessionId,
        }, client, books);
    }
    static async fetchDeviceToken(client, token) {
        const url = buildDeviceTokenUrl(token);
        const response = await client.request(url);
        return JSON.parse(response.body);
    }
    static deserializeCookies(cookies) {
        const values = cookies
            .split(";")
            .map((v) => v.split("="))
            .reduce((acc, [key, value]) => {
            acc[decodeURIComponent(key.trim())] = decodeURIComponent(value.trim());
            return acc;
        }, {});
        return {
            atMain: values["at-main"],
            sessionId: values["session-id"],
            ubidMain: values["ubid-main"],
            xMain: values["x-main"],
        };
    }
    /** Fetches the user's Kindle library. */
    async books(args) {
        const result = await fetchLibrary(__classPrivateFieldGet(this, _Kindle_client, "f"), args);
        this.options.sessionId = result.sessionId;
        return result.books;
    }
    /** Fetches basic details about a book. */
    async bookDetails(book) {
        return fetchBookDetails(__classPrivateFieldGet(this, _Kindle_client, "f"), book);
    }
    /** Fetches full details about a book including reading progress percentage. */
    async fullBookDetails(book, partialDetails) {
        return fetchFullBookDetails(__classPrivateFieldGet(this, _Kindle_client, "f"), book, partialDetails);
    }
    /** Downloads a renderer chunk as a tar archive. */
    async renderChunk(options) {
        return fetchRenderChunk(__classPrivateFieldGet(this, _Kindle_client, "f"), options);
    }
    /** Notifies Amazon that the user is still reading at the given position. */
    async stillReading(options) {
        return postStillReading(__classPrivateFieldGet(this, _Kindle_client, "f"), options);
    }
}
_Kindle_client = new WeakMap();

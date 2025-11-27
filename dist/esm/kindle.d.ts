/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
import { type RenderChunkOptions } from "./api/render.js";
import { type StillReadingOptions, type StillReadingResult } from "./api/still-reading.js";
import { type KindleRequiredCookies, HttpClient, type TlsClientConfig } from "./http-client.js";
import { type KindleBook, type KindleBookLightDetails, type KindleBookDetails } from "./models/book.js";
import { type Filter, type Query } from "./models/query-filter.js";
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
    clientVersion?: string;
    tlsServer: TlsClientConfig;
    /**
     * Factory that creates or returns a custom instance of http client.
     */
    clientFactory?: (cookies: KindleRequiredCookies, clientOptions: TlsClientConfig) => HttpClient;
};
export type KindleOptions = {
    config: KindleConfiguration;
    sessionId: string;
};
export type KindleFromCookieOptions = {
    cookieString: string;
    deviceToken: string;
};
export declare class Kindle {
    #private;
    private options;
    /**
     * The default list of books fetched when setting up {@link Kindle}
     *
     * We need to hit up the books endpoint to get necessary cookies
     * so we save the initial response here just to make sure the
     * user doesn't have to run the same request twice for no reason
     */
    readonly defaultBooks: KindleBook[];
    constructor(options: KindleOptions, client: HttpClient, prePopulatedBooks?: KindleBook[]);
    static fromConfig(config: KindleConfiguration): Promise<Kindle>;
    static fetchDeviceToken(client: HttpClient, token: string): Promise<KindleDeviceInfo>;
    static deserializeCookies(cookies: string): KindleRequiredCookies;
    /** Fetches the user's Kindle library. */
    books(args?: {
        query?: Query;
        filter?: Filter;
    }): Promise<KindleBook[]>;
    /** Fetches basic details about a book. */
    bookDetails(book: KindleBook): Promise<KindleBookLightDetails>;
    /** Fetches full details about a book including reading progress percentage. */
    fullBookDetails(book: KindleBook, partialDetails?: KindleBookLightDetails): Promise<KindleBookDetails>;
    /** Downloads a renderer chunk as a tar archive. */
    renderChunk(options: RenderChunkOptions): Promise<Buffer>;
    /** Notifies Amazon that the user is still reading at the given position. */
    stillReading(options: StillReadingOptions): Promise<StillReadingResult>;
}
export interface KindleDeviceInfo {
    clientHashId: string;
    deviceName: string;
    deviceSessionToken: string;
    eid: string;
}

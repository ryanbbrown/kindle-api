/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
import { HttpClient } from "../http-client.js";
export type RenderChunkOptions = {
    asin: string;
    startingPosition: string | number;
    numPages?: number | string;
    skipPages?: number | string;
    rendererRevision?: string;
    renderingToken?: string;
};
/** Downloads a renderer chunk as a tar archive. */
export declare function fetchRenderChunk(client: HttpClient, options: RenderChunkOptions): Promise<Buffer>;

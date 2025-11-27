/** Renderer URL building and render option normalization. */
export type RendererConfigInput = {
    startingPosition: number | string;
    numPages?: number | string;
    skipPages?: number | string;
};
export type RendererConfig = {
    startingPosition: string;
    numPage: string;
    skipPageCount: string;
};
export type RendererArgs = {
    asin: string;
    startingPosition: string;
    numPage: string;
    skipPageCount: string;
    rendererRevision: string;
};
/** Converts renderer options into the exact string fields the renderer expects. */
export declare function normalizeRenderOptions(input: RendererConfigInput): RendererConfig;
/** Builds the Kindle renderer URL for the requested ASIN and config. */
export declare function buildRendererUrl(args: RendererArgs): string;

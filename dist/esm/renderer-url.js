/** Renderer URL building and render option normalization. */
/** Converts renderer options into the exact string fields the renderer expects. */
export function normalizeRenderOptions(input) {
    return {
        startingPosition: String(input.startingPosition),
        numPage: input.numPages !== undefined ? String(input.numPages) : "5",
        skipPageCount: input.skipPages !== undefined ? String(input.skipPages) : "0",
    };
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
        numPage: args.numPage,
        skipPageCount: args.skipPageCount,
        startingPosition: args.startingPosition,
        bundleImages: "false",
    });
    return `https://read.amazon.com/renderer/render?${params.toString()}`;
}

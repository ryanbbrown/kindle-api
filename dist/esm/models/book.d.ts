/** Book-related types and data models. */
export interface KindleAuthor {
    /**
     * A first name also includes (if applicable)
     * both given and middle names
     */
    firstName: string;
    lastName: string;
}
export interface KindleBookData {
    title: string;
    asin: string;
    authors: string[];
    mangaOrComicAsin: boolean;
    resourceType: "EBOOK" | "EBOOK_SAMPLE" | (string & {});
    originType: string;
    percentageRead: number;
    productUrl: string;
    webReaderUrl: string;
}
export interface KindleBookLightDetails {
    title: string;
    bookType: "owned" | "sample" | "unknown";
    mangaOrComicAsin: boolean;
    formatVersion: string;
    progress: {
        reportedOnDevice: string;
        position: number;
        syncDate: Date;
    };
    asin: string;
    originType: string;
    authors: KindleAuthor[];
    /** @deprecated use {@link KindleBookLightDetails#coverUrl} */
    productUrl: string;
    /**
     * Heavily compressed image url of the book cover, use {@link KindleBookLightDetails#largeCoverUrl} for a better quality
     */
    coverUrl: string;
    largeCoverUrl: string;
    webReaderUrl: string;
    srl: number;
    metadataUrl: string;
}
export interface KindleBookDetails extends KindleBookLightDetails {
    publisher?: string;
    releaseDate: string;
    startPosition: number;
    endPosition: number;
    percentageRead: number;
}
export declare class KindleBook {
    readonly title: string;
    readonly authors: KindleAuthor[];
    readonly imageUrl: string;
    readonly asin: string;
    readonly originType: string;
    readonly productUrl: string;
    readonly mangaOrComicAsin: boolean;
    readonly webReaderUrl: string;
    readonly resourceType: string;
    constructor(options: KindleBookData);
}
/** Parses the Kindle API's author format into structured author objects. */
export declare function normalizeAuthors(rawAuthors: string[]): KindleAuthor[];
/** Converts a book cover URL to a larger image version. */
export declare function toLargeImageUrl(url: string): string;

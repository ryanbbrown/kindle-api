/** Book-related types and data models. */
export class KindleBook {
    constructor(options) {
        Object.defineProperty(this, "title", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "authors", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "imageUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "asin", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "originType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "productUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "mangaOrComicAsin", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "webReaderUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "resourceType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.title = options.title;
        this.authors = normalizeAuthors(options.authors);
        this.imageUrl = options.productUrl;
        this.asin = options.asin;
        this.originType = options.originType;
        this.resourceType = options.resourceType;
        this.mangaOrComicAsin = options.mangaOrComicAsin;
        this.webReaderUrl = options.webReaderUrl;
        this.productUrl = options.productUrl;
    }
}
/** Parses the Kindle API's author format into structured author objects. */
export function normalizeAuthors(rawAuthors) {
    if (rawAuthors.length === 0) {
        return [];
    }
    const [rawAuthor] = rawAuthors;
    // Kindle API truly has the most cursed authors data structure of all time
    return Array.from(new Set(rawAuthor.split(":").filter(Boolean)), (name) => {
        const [lastName, firstName] = name
            .split(",")
            .map((elems) => elems.trim());
        // sometimes an author only has one name like "Maddox"
        if (!firstName) {
            return {
                firstName: lastName,
                lastName: "",
            };
        }
        return {
            firstName,
            lastName,
        };
    });
}
/** Converts a book cover URL to a larger image version. */
export function toLargeImageUrl(url) {
    return url.replace(/\._SY\d+_\./g, ".");
}

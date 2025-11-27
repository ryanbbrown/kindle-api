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
  /* this is always 0 */
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

export class KindleBook {
  public readonly title: string;
  public readonly authors: KindleAuthor[];
  public readonly imageUrl: string;
  public readonly asin: string;
  public readonly originType: string;
  public readonly productUrl: string;
  public readonly mangaOrComicAsin: boolean;
  public readonly webReaderUrl: string;
  public readonly resourceType: string;

  constructor(options: KindleBookData) {
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
export function normalizeAuthors(rawAuthors: string[]): KindleAuthor[] {
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
export function toLargeImageUrl(url: string): string {
  return url.replace(/\._SY\d+_\./g, ".");
}

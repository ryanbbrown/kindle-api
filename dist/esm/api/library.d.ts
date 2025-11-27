import { HttpClient } from "../http-client.js";
import { KindleBook, KindleBookLightDetails, KindleBookDetails } from "../models/book.js";
import { Query, Filter } from "../models/query-filter.js";
/** Fetches books from the Kindle library with pagination support. */
export declare function fetchLibrary(client: HttpClient, args?: {
    query?: Query;
    filter?: Filter;
}): Promise<{
    books: KindleBook[];
    sessionId: string;
}>;
/** Fetches basic details about a book. */
export declare function fetchBookDetails(client: HttpClient, book: KindleBook, options?: {
    clientVersion?: string;
}): Promise<KindleBookLightDetails>;
/** Fetches full details about a book including reading progress percentage. */
export declare function fetchFullBookDetails(client: HttpClient, book: KindleBook, partialDetails?: KindleBookLightDetails): Promise<KindleBookDetails>;

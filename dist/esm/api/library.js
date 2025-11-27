import { KindleBook, toLargeImageUrl, } from "../models/book.js";
import { BOOKS_URL, buildStartReadingUrl } from "../urls.js";
const DEFAULT_CLIENT_VERSION = "2000010";
const DEFAULT_SORT_TYPE = "acquisition_desc";
const DEFAULT_QUERY_SIZE = 50;
/** Fetches a page of books from the Kindle library. */
async function fetchBooksPage(client, url) {
    const resp = await client.request(url);
    const newCookies = client.extractSetCookies(resp);
    const sessionId = newCookies["session-id"];
    const body = JSON.parse(resp.body);
    return {
        books: body.itemsList.map((book) => new KindleBook(book)),
        sessionId,
        paginationToken: body.paginationToken,
    };
}
/** Fetches books from the Kindle library with pagination support. */
export async function fetchLibrary(client, args) {
    const query = {
        sortType: DEFAULT_SORT_TYPE,
        ...args?.query,
    };
    const filter = {
        querySize: DEFAULT_QUERY_SIZE,
        fetchAllPages: false,
        ...args?.filter,
    };
    let allBooks = [];
    let latestSessionId;
    do {
        const url = buildLibraryUrl(query, filter);
        const { books, sessionId, paginationToken } = await fetchBooksPage(client, url);
        latestSessionId = sessionId;
        allBooks = [...allBooks, ...books];
        filter.paginationToken = paginationToken;
    } while (filter.paginationToken !== undefined &&
        filter.fetchAllPages === true);
    return {
        books: allBooks,
        sessionId: latestSessionId,
    };
}
/** Builds a library URL with query and filter params. */
function buildLibraryUrl(query, filter) {
    const url = new URL(BOOKS_URL);
    const searchParams = {
        ...query,
        ...filter,
    };
    for (const [key, value] of Object.entries(searchParams)) {
        if (key === "fetchAllPages") {
            continue; // pagination handling is internal only and not part of the kindle api
        }
        if (value !== undefined) {
            url.searchParams.set(key, value.toString());
        }
        else {
            url.searchParams.delete(key);
        }
    }
    return url.toString();
}
/** Fetches basic details about a book. */
export async function fetchBookDetails(client, book, options) {
    const version = options?.clientVersion ?? DEFAULT_CLIENT_VERSION;
    const url = buildStartReadingUrl(book.asin, version);
    const response = await client.request(url);
    const info = JSON.parse(response.body);
    return {
        title: book.title,
        asin: book.asin,
        authors: book.authors,
        bookType: info.isSample ? "sample" : info.isOwned ? "owned" : "unknown",
        formatVersion: info.formatVersion,
        mangaOrComicAsin: book.mangaOrComicAsin,
        originType: book.originType,
        productUrl: book.productUrl,
        coverUrl: book.productUrl,
        largeCoverUrl: toLargeImageUrl(book.productUrl),
        metadataUrl: info.metadataUrl,
        progress: {
            reportedOnDevice: info.lastPageReadData.deviceName,
            position: info.lastPageReadData.position,
            syncDate: new Date(info.lastPageReadData.syncTime),
        },
        webReaderUrl: book.webReaderUrl,
        srl: info.srl,
    };
}
/** Fetches full details about a book including reading progress percentage. */
export async function fetchFullBookDetails(client, book, partialDetails) {
    const info = partialDetails ?? (await fetchBookDetails(client, book));
    const response = await client.request(info.metadataUrl);
    const meta = client.parseJsonpResponse(response);
    if (!meta) {
        throw Error("Something went wrong fetching book metadata");
    }
    const roughDecimal = ((meta.startPosition ?? 0) + info.progress.position) / meta.endPosition;
    // rounding 0.996 to 1
    const percentageRead = Number(roughDecimal.toFixed(3)) * 100;
    return {
        ...info,
        percentageRead,
        releaseDate: meta.releaseDate,
        startPosition: meta.startPosition,
        endPosition: meta.endPosition,
        publisher: meta.publisher,
    };
}

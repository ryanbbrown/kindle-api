import { HttpClient } from "../http-client.js";
export type StillReadingOptions = {
    asin: string;
    position: string;
    guid?: string;
    kindleSessionId?: string;
    timezoneOffsetMinutes?: number;
};
export type StillReadingResult = {
    success: boolean;
    status: number;
};
/** Notifies Amazon that the user is still reading at the given position. */
export declare function postStillReading(client: HttpClient, options: StillReadingOptions): Promise<StillReadingResult>;

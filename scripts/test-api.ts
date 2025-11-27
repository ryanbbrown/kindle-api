#!/usr/bin/env npx ts-node
/** CLI script for testing Kindle API endpoints. */
import { Kindle, type KindleConfiguration } from "../src/kindle.js";

const COMMANDS = ["books", "book-details", "full-book-details", "render", "still-reading"] as const;
type Command = (typeof COMMANDS)[number];

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);

  if (!command || !COMMANDS.includes(command as Command)) {
    console.error(`Usage: test-api <command> [options]

Commands:
  books                         Fetch library (first page)
  book-details --asin <ASIN>    Fetch basic book details
  full-book-details --asin <ASIN>  Fetch full book details with progress
  render --asin <ASIN> [--position <pos>] [--pages <n>]  Download renderer chunk
  still-reading --asin <ASIN> --position <pos>  Post reading progress`);
    process.exit(1);
  }

  const opts = parseArgs(args);
  const kindle = await Kindle.fromConfig(loadConfig());

  switch (command as Command) {
    case "books": {
      const books = kindle.defaultBooks;
      console.log(JSON.stringify(books, null, 2));
      break;
    }
    case "book-details": {
      const book = kindle.defaultBooks.find((b) => b.asin === opts.asin);
      if (!book) throw new Error(`Book ${opts.asin} not found in library`);
      const details = await kindle.bookDetails(book);
      console.log(JSON.stringify(details, null, 2));
      break;
    }
    case "full-book-details": {
      const book = kindle.defaultBooks.find((b) => b.asin === opts.asin);
      if (!book) throw new Error(`Book ${opts.asin} not found in library`);
      const details = await kindle.fullBookDetails(book);
      console.log(JSON.stringify(details, null, 2));
      break;
    }
    case "render": {
      if (!opts.asin) throw new Error("--asin required");
      const buffer = await kindle.renderChunk({
        asin: opts.asin,
        startingPosition: opts.position ?? "0",
        numPages: opts.pages ? Number(opts.pages) : 5,
      });
      const outPath = `${opts.asin}-chunk.tar`;
      await import("node:fs/promises").then((fs) => fs.writeFile(outPath, buffer));
      console.log(JSON.stringify({ wrote: outPath, bytes: buffer.length }));
      break;
    }
    case "still-reading": {
      if (!opts.asin || !opts.position) throw new Error("--asin and --position required");
      const result = await kindle.stillReading({ asin: opts.asin, position: opts.position });
      console.log(JSON.stringify(result, null, 2));
      break;
    }
  }
}

/** Parses --key value pairs from args. */
function parseArgs(args: string[]): Record<string, string> {
  const opts: Record<string, string> = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace(/^--/, "");
    const value = args[i + 1];
    if (key && value) opts[key] = value;
  }
  return opts;
}

/** Loads KindleConfiguration from environment variables. */
function loadConfig(): KindleConfiguration {
  const cookies = process.env.COOKIES;
  const deviceToken = process.env.DEVICE_TOKEN;
  if (!cookies || !deviceToken) {
    console.error("Set COOKIES and DEVICE_TOKEN environment variables");
    process.exit(1);
  }
  return {
    cookies,
    deviceToken,
    guid: process.env.GUID,
    renderingToken: process.env.RENDERING_TOKEN,
    rendererRevision: process.env.RENDERER_REVISION,
    tlsServer: {
      url: process.env.TLS_SERVER_URL ?? "http://localhost:8080",
      apiKey: process.env.TLS_SERVER_API_KEY ?? "my-auth-key-1",
    },
  };
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

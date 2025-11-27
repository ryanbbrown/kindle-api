import "dotenv/config";
import { Kindle } from "../src/kindle.js";

function env(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

async function main(): Promise<void> {
  const kindle = await Kindle.fromConfig({
    cookies: env("COOKIES"),
    deviceToken: env("DEVICE_TOKEN"),
    tlsServer: {
      url: env("TLS_SERVER_URL"),
      apiKey: env("TLS_SERVER_API_KEY"),
    },
  });

  console.log(`Fetched ${kindle.defaultBooks.length} books.`);
  if (kindle.defaultBooks[0]) {
    const { title, asin } = kindle.defaultBooks[0];
    console.log(`First book: ${title} (${asin})`);
  }
}

main().catch((error) => {
  console.error("Example run failed:", error);
  process.exitCode = 1;
});

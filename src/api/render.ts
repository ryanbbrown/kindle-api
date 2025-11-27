import { HttpClient } from "../http-client.js";
import { buildRendererUrl } from "../urls.js";

export type RenderChunkOptions = {
  asin: string;
  startingPosition: string | number;
  numPages?: number | string;
  skipPages?: number | string;
  rendererRevision?: string;
  renderingToken?: string;
};

/** Downloads a renderer chunk as a tar archive. */
export async function fetchRenderChunk(
  client: HttpClient,
  options: RenderChunkOptions
): Promise<Buffer> {
  const revision =
    options.rendererRevision ?? client.getRendererRevision();
  const token = options.renderingToken ?? client.getRenderingToken();

  if (!revision) {
    throw new Error("rendererRevision is required for renderChunk");
  }
  if (!token) {
    throw new Error("renderingToken is required for renderChunk");
  }

  const url = buildRendererUrl({
    asin: options.asin,
    startingPosition: options.startingPosition,
    numPages: options.numPages,
    skipPages: options.skipPages,
    rendererRevision: revision,
  });

  const response = await client.request(url, {
    headers: { "x-amz-rendering-token": token },
    isByteResponse: true,
  });

  if (response.status !== 200) {
    const bodySample = String(response.body).slice(0, 500);
    throw new Error(
      `Renderer request failed: status=${response.status} body=${bodySample}`
    );
  }

  return coerceToBuffer(response.body);
}

/** Converts a TLS client response body into a Buffer. */
function coerceToBuffer(body: unknown): Buffer {
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (typeof body === "string") {
    if (body.startsWith("data:")) {
      const commaIndex = body.indexOf(",");
      if (commaIndex === -1) {
        throw new Error("Malformed data URI response");
      }
      return Buffer.from(body.slice(commaIndex + 1), "base64");
    }
    const sample = body.slice(0, 100);
    if (/^[A-Za-z0-9+/]+=*$/.test(sample)) {
      return Buffer.from(body, "base64");
    }
    return Buffer.from(body, "binary");
  }
  throw new Error("Unexpected response body type");
}

import { normalizeAuthors, toLargeImageUrl } from "./book.js";
import { describe, it, expect } from "vitest";

describe("Normalization of amazon's clown world author format", () => {
  it("standard author format", () => {
    expect(normalizeAuthors(["Thorensen, Olan:"])).toStrictEqual([
      { firstName: "Olan", lastName: "Thorensen" },
    ]);
  });

  it("authors with one name", () => {
    expect(normalizeAuthors(["Maddox:"])).toStrictEqual([
      { firstName: "Maddox", lastName: "" },
    ]);
  });

  it("authors with one name but repeated twice", () => {
    expect(normalizeAuthors(["Maddox:Maddox"])).toStrictEqual([
      { firstName: "Maddox", lastName: "" },
    ]);
  });
});

describe("Getting large images from urls", () => {
  it("gets large image from small image", () => {
    expect(
      toLargeImageUrl(
        "https://m.media-amazon.com/images/I/41v+reLJm4L._SY346_.jpg"
      )
    ).toBe("https://m.media-amazon.com/images/I/41v+reLJm4L.jpg");
  });
});

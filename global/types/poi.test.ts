import { describe, expect, it } from "vitest";
import { formatTypeName, getCategoryForType } from "./poi";

describe("getCategoryForType", () => {
  it("maps a known type to its category", () => {
    expect(getCategoryForType("restaurant")).toBe("Food & Drink");
    expect(getCategoryForType("pharmacy")).toBe("Health");
    expect(getCategoryForType("school")).toBe("Education");
  });

  it("returns 'Other' for an unknown type", () => {
    expect(getCategoryForType("unicorn_stable")).toBe("Other");
    expect(getCategoryForType("")).toBe("Other");
  });
});

describe("formatTypeName", () => {
  it("title-cases a single word", () => {
    expect(formatTypeName("restaurant")).toBe("Restaurant");
  });

  it("splits on underscores and title-cases each word", () => {
    expect(formatTypeName("fast_food")).toBe("Fast Food");
    expect(formatTypeName("place_of_worship")).toBe("Place Of Worship");
  });

  it("handles an empty string", () => {
    expect(formatTypeName("")).toBe("");
  });
});

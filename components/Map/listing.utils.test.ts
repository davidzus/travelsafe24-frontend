import { describe, expect, it } from "vitest";
import type { Listing } from "@/global/types/listings";
import {
  buildPopupHtml,
  createClusterIcon,
  createListingMarker,
} from "./listing.utils";

function makeListing(overrides: Partial<Listing> = {}): Listing {
  return {
    id: "1",
    url: "https://example.com/listing/1",
    title: "Nice Flat",
    priceEuro: 1200,
    rooms: 3,
    sizeSqm: 75,
    locationText: "Altona, Hamburg",
    district: "Altona",
    thumbnailUrl: null,
    postedAt: null,
    lat: 53.55,
    lng: 9.93,
    scrapedAt: "2026-01-01T00:00:00Z",
    source: "kleinanzeigen",
    ...overrides,
  };
}

describe("buildPopupHtml", () => {
  it("renders title, formatted price and meta", () => {
    const html = buildPopupHtml(makeListing());
    expect(html).toContain("Nice Flat");
    expect(html).toContain("1.200 €");
    expect(html).toContain("3 Zimmer");
    expect(html).toContain("75 m²");
  });

  it("shows a placeholder when price is null", () => {
    const html = buildPopupHtml(makeListing({ priceEuro: null }));
    expect(html).toContain("Preis n.a.");
  });

  it("escapes HTML in the title to prevent injection", () => {
    const html = buildPopupHtml(
      makeListing({ title: '<img src=x onerror="alert(1)">' }),
    );
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img src=x");
  });

  it("omits the thumbnail markup when there is no thumbnail", () => {
    const html = buildPopupHtml(makeListing({ thumbnailUrl: null }));
    expect(html).not.toContain("<img");
  });

  it("includes an escaped thumbnail when present", () => {
    const html = buildPopupHtml(
      makeListing({ thumbnailUrl: "https://img.example.com/a.jpg" }),
    );
    expect(html).toContain("https://img.example.com/a.jpg");
  });

  it("omits the meta line when rooms and size are null", () => {
    const html = buildPopupHtml(
      makeListing({ rooms: null, sizeSqm: null }),
    );
    expect(html).not.toContain("Zimmer");
    expect(html).not.toContain("m²");
  });
});

describe("createClusterIcon", () => {
  it("uses the small size for small clusters", () => {
    const icon = createClusterIcon(5);
    expect(icon.options.iconSize).toEqual([36, 36]);
    expect(typeof icon.options.html === "string" && icon.options.html).toContain(
      "5",
    );
  });

  it("uses the medium size for mid-range clusters", () => {
    expect(createClusterIcon(25).options.iconSize).toEqual([44, 44]);
  });

  it("uses the large size for big clusters", () => {
    expect(createClusterIcon(120).options.iconSize).toEqual([52, 52]);
  });
});

describe("createListingMarker", () => {
  it("places the marker at the listing coordinates", () => {
    const marker = createListingMarker(makeListing({ lat: 53.55, lng: 9.93 }));
    const { lat, lng } = marker.getLatLng();
    expect(lat).toBeCloseTo(53.55);
    expect(lng).toBeCloseTo(9.93);
  });

  it("binds a popup to the marker", () => {
    const marker = createListingMarker(makeListing());
    expect(marker.getPopup()).toBeTruthy();
  });
});

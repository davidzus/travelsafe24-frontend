export type ListingSource = "kleinanzeigen";

export interface Listing {
  id: string;
  url: string;
  title: string;
  priceEuro: number | null;
  rooms: number | null;
  sizeSqm: number | null;
  locationText: string;
  district: string | null;
  thumbnailUrl: string | null;
  postedAt: string | null;
  lat: number;
  lng: number;
  scrapedAt: string;
  source: ListingSource;
}

export interface ListingsFile {
  generatedAt: string;
  city: string;
  count: number;
  listings: Listing[];
}

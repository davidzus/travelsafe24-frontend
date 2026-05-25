export type ListingSource = "kleinanzeigen";

export interface RawCard {
  id: string;
  url: string;
  title: string;
  priceText: string;
  locationText: string;
  tags: string[];
  thumbnailUrl: string | null;
  postedAt: string | null;
}

export interface CleanedListing {
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
}

export interface Listing extends CleanedListing {
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

export interface CleaningStats {
  total: number;
  withPrice: number;
  withRooms: number;
  withSize: number;
  withDistrict: number;
  unknownDistricts: string[];
}

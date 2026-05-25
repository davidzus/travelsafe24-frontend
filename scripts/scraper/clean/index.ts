import type { CleanedListing, CleaningStats, RawCard } from "../types";
import { extractPrice } from "./price";
import { extractRooms } from "./rooms";
import { extractSize } from "./size";
import { extractDistrict } from "./district";

export function cleanCard(card: RawCard): {
  cleaned: CleanedListing;
  unknownDistrict: string | null;
} {
  const { district, unknown } = extractDistrict(card);
  const cleaned: CleanedListing = {
    id: card.id,
    url: card.url,
    title: card.title,
    priceEuro: extractPrice(card.priceText),
    rooms: extractRooms(card),
    sizeSqm: extractSize(card),
    locationText: card.locationText,
    district,
    thumbnailUrl: card.thumbnailUrl,
    postedAt: card.postedAt,
  };
  return { cleaned, unknownDistrict: unknown };
}

export function cleanBatch(cards: RawCard[]): {
  cleaned: CleanedListing[];
  stats: CleaningStats;
} {
  const cleaned: CleanedListing[] = [];
  const unknownDistricts = new Set<string>();

  for (const card of cards) {
    const result = cleanCard(card);
    cleaned.push(result.cleaned);
    if (result.unknownDistrict) unknownDistricts.add(result.unknownDistrict);
  }

  const stats: CleaningStats = {
    total: cleaned.length,
    withPrice: cleaned.filter((c) => c.priceEuro !== null).length,
    withRooms: cleaned.filter((c) => c.rooms !== null).length,
    withSize: cleaned.filter((c) => c.sizeSqm !== null).length,
    withDistrict: cleaned.filter((c) => c.district !== null).length,
    unknownDistricts: [...unknownDistricts],
  };

  return { cleaned, stats };
}

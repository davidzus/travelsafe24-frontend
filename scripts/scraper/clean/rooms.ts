import type { RawCard } from "../types";

const ROOM_REGEX =
  /(\d+(?:[,.]\d+)?)\s*[-\s]?\s*(?:Z(?:immer|i\.?)|ZKB[B]?|ZKB[B]?)/i;

export function extractRooms(card: RawCard): number | null {
  const sources = [...card.tags, card.title];
  for (const source of sources) {
    if (!source) continue;
    const match = source.match(ROOM_REGEX);
    if (match) {
      const value = parseFloat(match[1].replace(",", "."));
      if (value > 0 && value < 20) return value;
    }
  }
  return null;
}

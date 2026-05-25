import type { RawCard } from "../types";

const SIZE_REGEX = /(\d+(?:[,.]\d+)?)\s*m²/i;

export function extractSize(card: RawCard): number | null {
  const sources = [...card.tags, card.title];
  for (const source of sources) {
    if (!source) continue;
    const match = source.match(SIZE_REGEX);
    if (match) {
      const value = parseFloat(match[1].replace(",", "."));
      if (value > 5 && value < 1000) return value;
    }
  }
  return null;
}

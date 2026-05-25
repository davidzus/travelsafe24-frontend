import boundariesData from "@/global/boundaries/hamburg/hamburgStadtteile.json";
import type { RawCard } from "../types";

interface BoundaryFeature {
  properties: { Stadtteil: string };
}

const VALID_DISTRICTS: ReadonlySet<string> = new Set(
  (boundariesData as { features: BoundaryFeature[] }).features.map(
    (f) => f.properties.Stadtteil,
  ),
);

const DISTRICT_ALIASES: ReadonlyMap<string, string> = new Map([
  ["St. Georg", "St.Georg"],
  ["Neugraben", "Neugraben-Fischbek"],
  ["Altona", "Altona-Altstadt"],
  ["Altstadt", "Hamburg-Altstadt"],
  ["Barmbek", "Barmbek-Süd"],
]);

const LOCATION_REGEX = /^\d{5}\s+(?:Hamburg[-\s]+)?(.+?)\s*$/;

function normalizeDistrictName(raw: string): string {
  return raw
    .replace(/[​-‍﻿]/g, "")
    .replace(/\s*\([^)]*\)\s*$/, "")
    .trim();
}

export function extractDistrict(card: RawCard): {
  district: string | null;
  unknown: string | null;
} {
  const cleanedLocation = card.locationText.replace(/[​-‍﻿]/g, "");
  const match = cleanedLocation.match(LOCATION_REGEX);
  if (!match) return { district: null, unknown: null };

  const raw = normalizeDistrictName(match[1]);
  const reconciled = DISTRICT_ALIASES.get(raw) ?? raw;

  if (VALID_DISTRICTS.has(reconciled)) {
    return { district: reconciled, unknown: null };
  }
  return { district: null, unknown: raw };
}

export function getValidDistricts(): ReadonlySet<string> {
  return VALID_DISTRICTS;
}

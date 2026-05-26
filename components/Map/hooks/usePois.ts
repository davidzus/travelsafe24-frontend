"use client";

import { useEffect, useState } from "react";
import { fetchPoisByType } from "@/components/Map/api";
import type { Poi } from "@/global/types/poi";

interface UsePoisResult {
  pois: Poi[];
  isLoading: boolean;
}

const EMPTY_POIS: Poi[] = [];
const EMPTY_TYPES: Set<string> = new Set();

function dedupeById(batches: Poi[][]): Poi[] {
  const seen = new Set<number>();
  const merged: Poi[] = [];
  batches.flat().forEach((p) => {
    if (seen.has(p.id)) return;
    seen.add(p.id);
    merged.push(p);
  });
  return merged;
}

export function usePois(selectedTypes: Set<string>): UsePoisResult {
  const [pois, setPois] = useState<Poi[]>(EMPTY_POIS);
  const [resolvedTypes, setResolvedTypes] = useState<Set<string>>(EMPTY_TYPES);

  useEffect(() => {
    if (selectedTypes.size === 0) return;

    const controller = new AbortController();
    const requestedTypes = selectedTypes;

    Promise.all(
      Array.from(requestedTypes).map((type) =>
        fetchPoisByType(type, controller.signal),
      ),
    )
      .then((batches) => {
        setPois(dedupeById(batches));
        setResolvedTypes(requestedTypes);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Failed to fetch POIs:", err);
        }
      });

    return () => controller.abort();
  }, [selectedTypes]);

  const visiblePois = selectedTypes.size === 0 ? EMPTY_POIS : pois;
  const isLoading =
    selectedTypes.size > 0 && resolvedTypes !== selectedTypes;

  return { pois: visiblePois, isLoading };
}

"use client";

import { useEffect, useState } from "react";
import { fetchPoiTypes } from "@/components/Map/api";
import type { PoiType } from "@/global/types/poi";

export function usePoiTypes(): PoiType[] {
  const [poiTypes, setPoiTypes] = useState<PoiType[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetchPoiTypes(controller.signal)
      .then(setPoiTypes)
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Failed to fetch POI types:", err);
        }
      });
    return () => controller.abort();
  }, []);

  return poiTypes;
}

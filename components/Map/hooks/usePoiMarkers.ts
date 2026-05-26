"use client";

import { MutableRefObject, useEffect, useRef } from "react";
import L from "leaflet";
import {
  CATEGORY_COLORS,
  Poi,
  formatTypeName,
  getCategoryForType,
} from "@/global/types/poi";

interface UsePoiMarkersOptions {
  mapRef: MutableRefObject<L.Map | null>;
  rendererRef: MutableRefObject<L.Canvas | null>;
  isMapReady: boolean;
  pois: Poi[];
}

function buildPoiTooltipHtml(poi: Poi): string {
  return `<div class="poi-tooltip-inner">
    <div class="poi-tooltip-name">${poi.name || "(unnamed)"}</div>
    <div class="poi-tooltip-type">${formatTypeName(poi.type)}</div>
  </div>`;
}

export function usePoiMarkers({
  mapRef,
  rendererRef,
  isMapReady,
  pois,
}: UsePoiMarkersOptions): void {
  const poiLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!isMapReady || !map) return;

    if (!poiLayerRef.current) {
      poiLayerRef.current = L.layerGroup().addTo(map);
    }
    poiLayerRef.current.clearLayers();

    pois.forEach((poi) => {
      const category = getCategoryForType(poi.type);
      const color = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Other;

      const marker = L.circleMarker([poi.latitude, poi.longitude], {
        radius: 5,
        fillColor: color,
        color: "#ffffff",
        weight: 1.5,
        fillOpacity: 0.95,
        renderer: rendererRef.current ?? undefined,
      });

      marker.bindTooltip(buildPoiTooltipHtml(poi), {
        direction: "top",
        offset: [0, -4],
        className: "poi-tooltip",
      });

      poiLayerRef.current?.addLayer(marker);
    });
  }, [pois, isMapReady, mapRef, rendererRef]);
}

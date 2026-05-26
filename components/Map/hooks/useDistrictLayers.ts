"use client";

import { MutableRefObject, useEffect, useRef } from "react";
import L from "leaflet";
import boundariesData from "@/global/boundaries/hamburg/hamburgStadtteile.json";
import {
  DistrictFeature,
  DistrictFeatureCollection,
} from "@/global/types/boundaries";
import { EvaluationResponse } from "@/global/types/evaluation";
import {
  getDistrictStyle,
  getMatchingScore,
} from "@/components/Map/map.utils";

const boundaries = boundariesData as DistrictFeatureCollection;

export type SelectedDistrictLayer = L.Layer & { feature: DistrictFeature };

interface UseDistrictLayersOptions {
  mapRef: MutableRefObject<L.Map | null>;
  isMapReady: boolean;
  results: EvaluationResponse | null;
  onSelect: (layer: SelectedDistrictLayer) => void;
}

function buildTooltipHtml(name: string, score: number | null): string {
  return `<div class="district-tooltip-inner">
    <div class="district-tooltip-name">${name}</div>
    <div class="district-tooltip-score">Match: <strong>${score}</strong></div>
  </div>`;
}

export function useDistrictLayers({
  mapRef,
  isMapReady,
  results,
  onSelect,
}: UseDistrictLayersOptions): void {
  const onSelectRef = useRef(onSelect);
  const highlightedLayerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!isMapReady || !map || !results) return;

    const addedLayers: L.GeoJSON[] = [];

    boundaries.features.forEach((stadtteil: DistrictFeature) => {
      const name = stadtteil.properties.Stadtteil;

      const layer = L.geoJSON(stadtteil as unknown as GeoJSON.Feature, {
        style: getDistrictStyle(name, results),
        onEachFeature: (_feature, featureLayer) => {
          const path = featureLayer as L.Path;
          const score = getMatchingScore(name, results);

          featureLayer.bindTooltip(buildTooltipHtml(name, score), {
            sticky: true,
            direction: "top",
            offset: [0, -8],
            opacity: 1,
            className: "district-tooltip",
          });

          featureLayer.on("mouseover", () => {
            if (
              highlightedLayerRef.current &&
              highlightedLayerRef.current !== layer
            ) {
              highlightedLayerRef.current.resetStyle();
            }
            path.setStyle({
              weight: 3,
              color: "#ffffff",
              fillOpacity: 0.85,
            });
            path.bringToFront();
            highlightedLayerRef.current = layer;
          });

          featureLayer.on("mouseout", () => {
            if (highlightedLayerRef.current === layer) {
              layer.resetStyle();
              highlightedLayerRef.current = null;
            }
          });

          featureLayer.on("click", () => {
            onSelectRef.current(featureLayer as SelectedDistrictLayer);
            map.fitBounds((featureLayer as L.Polygon).getBounds(), {
              padding: [80, 80],
              maxZoom: 14,
              animate: true,
            });
          });
        },
      });

      layer.addTo(map);
      addedLayers.push(layer);
    });

    return () => {
      addedLayers.forEach((layer) => layer.remove());
      highlightedLayerRef.current = null;
    };
  }, [mapRef, isMapReady, results]);
}

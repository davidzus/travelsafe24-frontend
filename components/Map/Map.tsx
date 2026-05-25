"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import {
  DistrictFeature,
  DistrictFeatureCollection,
} from "@/global/types/boundaries";
import { EvaluationResponse } from "@/global/types/evaluation";
import DistrictInfoContainer from "@/components/Map/DistrictInfoContainer";
import PoiFilter from "@/components/Map/PoiFilter";
import boundariesData from "@/global/boundaries/hamburg/hamburgStadtteile.json";
import { useRouter } from "next/navigation";
import {
  DEFAULT_ZOOM,
  HAMBURG_CENTER,
  TILE_ATTRIBUTION,
  TILE_URL,
} from "@/global/constants/map.constants";
import { getDistrictStyle, getMatchingScore } from "@/components/Map/map.utils";
import {
  CATEGORY_COLORS,
  Poi,
  PoiType,
  formatTypeName,
  getCategoryForType,
} from "@/global/types/poi";
import { useListings } from "@/components/Map/useListings";
import { createListingMarker, createClusterIcon } from "@/components/Map/listing.utils";

const boundaries = boundariesData as DistrictFeatureCollection;

type SelectedLayer = L.Layer & { feature: DistrictFeature };

export default function Map() {
  const router = useRouter();
  const mapRef = useRef<L.Map | null>(null);
  const highlightedLayerRef = useRef<L.GeoJSON | null>(null);
  const poiLayerRef = useRef<L.LayerGroup | null>(null);
  const poiRendererRef = useRef<L.Canvas | null>(null);
  const pinLayerRef = useRef<L.MarkerClusterGroup | null>(null);

  const [selectedLayer, setSelectedLayer] = useState<SelectedLayer | null>(
      null,
  );
  const [results, setResults] = useState<EvaluationResponse>(
      {} as EvaluationResponse,
  );
  const [isMapReady, setIsMapReady] = useState(false);

  const [poiTypes, setPoiTypes] = useState<PoiType[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [pois, setPois] = useState<Poi[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoadingPois, setIsLoadingPois] = useState(false);

  const selectedDistrict =
      selectedLayer?.feature?.properties?.Stadtteil ?? null;
  const { listings } = useListings(selectedDistrict);

  useEffect(() => {
    const rawResults = sessionStorage.getItem("onboarding");
    if (!rawResults) {
      router.replace("/onboarding");
      return;
    }
    try {
      const parsed = JSON.parse(rawResults) as EvaluationResponse;
      setResults(parsed);
    } catch (err) {
      console.error(err);
      router.replace("/onboarding");
    }
  }, [router]);

  useEffect(() => {
    fetch("http://localhost:8080/api/poi-types")
        .then((r) => r.json())
        .then((data: PoiType[]) => setPoiTypes(data))
        .catch((err) => console.error("Failed to fetch POI types:", err));
  }, []);

  useEffect(() => {
    if (mapRef.current) return;
    if (Object.keys(results).length === 0) return;

    const map = L.map("map", {
      zoomControl: false,
      attributionControl: true,
    }).setView(HAMBURG_CENTER, DEFAULT_ZOOM);
    mapRef.current = map;
    poiRendererRef.current = L.canvas({ padding: 0.5 });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer(TILE_URL, {
      maxZoom: 19,
      attribution: TILE_ATTRIBUTION,
    }).addTo(map);

    boundaries.features.forEach((stadtteil: DistrictFeature) => {
      const name = stadtteil.properties.Stadtteil;

      const layer = L.geoJSON(stadtteil as unknown as GeoJSON.Feature, {
        style: getDistrictStyle(name, results),
        onEachFeature: (_feature, featureLayer) => {
          const path = featureLayer as L.Path;
          const score = getMatchingScore(name, results);

          featureLayer.bindTooltip(
              `<div class="district-tooltip-inner">
               <div class="district-tooltip-name">${name}</div>
               <div class="district-tooltip-score">Match: <strong>${score}</strong></div>
             </div>`,
              {
                sticky: true,
                direction: "top",
                offset: [0, -8],
                opacity: 1,
                className: "district-tooltip",
              },
          );

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
            setSelectedLayer(featureLayer as SelectedLayer);
            map.fitBounds((featureLayer as L.Polygon).getBounds(), {
              padding: [80, 80],
              maxZoom: 14,
              animate: true,
            });
          });
        },
      });

      layer.addTo(map);
    });

    setIsMapReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
      poiLayerRef.current = null;
      poiRendererRef.current = null;
      pinLayerRef.current = null;
      setIsMapReady(false);
    };
  }, [results]);

  useEffect(() => {
    if (selectedTypes.size === 0) {
      setPois([]);
      return;
    }

    const controller = new AbortController();
    setIsLoadingPois(true);

    Promise.all(
        Array.from(selectedTypes).map((type) =>
            fetch(`http://localhost:8080/api/pois?type=${encodeURIComponent(type)}`, {
              signal: controller.signal,
            }).then((r) => r.json() as Promise<Poi[]>),
        ),
    )
        .then((batches) => {
          const seen = new Set<number>();
          const merged: Poi[] = [];
          batches.flat().forEach((p) => {
            if (seen.has(p.id)) return;
            seen.add(p.id);
            merged.push(p);
          });
          setPois(merged);
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.error("Failed to fetch POIs:", err);
          }
        })
        .finally(() => setIsLoadingPois(false));

    return () => controller.abort();
  }, [selectedTypes]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current) return;

    if (!poiLayerRef.current) {
      poiLayerRef.current = L.layerGroup().addTo(mapRef.current);
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
        renderer: poiRendererRef.current ?? undefined,
      });

      marker.bindTooltip(
          `<div class="poi-tooltip-inner">
           <div class="poi-tooltip-name">${poi.name || "(unnamed)"}</div>
           <div class="poi-tooltip-type">${formatTypeName(poi.type)}</div>
         </div>`,
          {
            direction: "top",
            offset: [0, -4],
            className: "poi-tooltip",
          },
      );

      poiLayerRef.current?.addLayer(marker);
    });
  }, [pois, isMapReady]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (pinLayerRef.current) {
      pinLayerRef.current.remove();
      pinLayerRef.current = null;
    }

    if (listings.length === 0) return;

    const group = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 50,
      disableClusteringAtZoom: 17,
      iconCreateFunction: (cluster) =>
        createClusterIcon(cluster.getChildCount()),
    });
    listings.forEach((listing) => {
      group.addLayer(createListingMarker(listing));
    });
    group.addTo(map);
    pinLayerRef.current = group;

    return () => {
      if (pinLayerRef.current) {
        pinLayerRef.current.remove();
        pinLayerRef.current = null;
      }
    };
  }, [listings]);

  const districtName = selectedLayer?.feature?.properties?.Stadtteil ?? "";
  const districtPois = pois.filter((p) => p.district === districtName);

  return (
      <div className="relative h-[calc(100dvh-4rem)] w-full overflow-hidden bg-slate-900">
        <div className="absolute inset-0" id="map" />

        {!isMapReady && (
            <div className="absolute inset-0 z-500 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/15 border-t-white" />
                <p className="text-sm text-white/60">Loading Hamburg…</p>
              </div>
            </div>
        )}

        <div className="pointer-events-none absolute top-4 left-4 z-400 flex flex-col items-start gap-2">
          <div className="pointer-events-auto rounded-2xl bg-white/95 px-4 py-3 shadow-xl ring-1 ring-black/5 backdrop-blur-md">
            <h1 className="text-sm font-semibold tracking-tight text-slate-900">
              Hamburg District Match
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">
              Hover a district · click for details
            </p>
          </div>

          <button
              onClick={() => setIsFilterOpen(true)}
              className="pointer-events-auto flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-slate-700 shadow-xl ring-1 ring-black/5 backdrop-blur-md transition hover:bg-white hover:text-slate-900"
          >
            <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
            >
              <path d="M3 6h18M6 12h12M10 18h4" />
            </svg>
            <span>POI Filter</span>
            {selectedTypes.size > 0 && (
                <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">
              {selectedTypes.size}
            </span>
            )}
            {isLoadingPois && (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
            )}
          </button>
        </div>

        <PoiFilter
            poiTypes={poiTypes}
            selectedTypes={selectedTypes}
            onChange={setSelectedTypes}
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            isLoading={isLoadingPois}
        />

        <div className="pointer-events-none absolute bottom-6 left-4 z-400">
          <div className="pointer-events-auto rounded-2xl bg-white/95 p-3 shadow-xl ring-1 ring-black/5 backdrop-blur-md">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
              Match score
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-slate-500">Low</span>
              <div
                  className="h-2 w-36 rounded-full"
                  style={{
                    background:
                        "linear-gradient(to right, #ef4444, #f59e0b, #eab308, #84cc16, #22c55e)",
                  }}
              />
              <span className="text-[10px] font-medium text-slate-500">High</span>
            </div>
          </div>
        </div>

        <div
            className={`absolute top-4 right-4 z-400 transition-all duration-300 ease-out ${
                selectedLayer
                    ? "translate-x-0 opacity-100"
                    : "pointer-events-none translate-x-6 opacity-0"
            }`}
        >
          {selectedLayer && (
              <DistrictInfoContainer
                  districtName={districtName}
                  matchingScore={getMatchingScore(districtName, results)}
                  onClose={() => setSelectedLayer(null)}
                  results={results}
                  pois={districtPois}
              />
          )}
        </div>
      </div>
  );
}

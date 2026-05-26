"use client";

import { useCallback, useState } from "react";
import "leaflet";
import "leaflet.markercluster";

import PoiFilter from "@/components/Map/PoiFilter";
import MapControls from "@/components/Map/MapControls";
import MapLegend from "@/components/Map/MapLegend";
import MapLoadingOverlay from "@/components/Map/MapLoadingOverlay";
import DistrictInfoPanel from "@/components/Map/DistrictInfoPanel";

import { getMatchingScore } from "@/components/Map/map.utils";
import { useOnboardingResults } from "@/components/Map/hooks/useOnboardingResults";
import { usePoiTypes } from "@/components/Map/hooks/usePoiTypes";
import { usePois } from "@/components/Map/hooks/usePois";
import { useLeafletMap } from "@/components/Map/hooks/useLeafletMap";
import {
  SelectedDistrictLayer,
  useDistrictLayers,
} from "@/components/Map/hooks/useDistrictLayers";
import { usePoiMarkers } from "@/components/Map/hooks/usePoiMarkers";
import { useListingMarkers } from "@/components/Map/hooks/useListingMarkers";
import { useListings } from "@/components/Map/useListings";

const MAP_CONTAINER_ID = "map";

export default function Map() {
  const results = useOnboardingResults();
  const poiTypes = usePoiTypes();

  const [selectedLayer, setSelectedLayer] =
    useState<SelectedDistrictLayer | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { pois, isLoading: isLoadingPois } = usePois(selectedTypes);

  const selectedDistrict =
    selectedLayer?.feature?.properties?.Stadtteil ?? null;
  const { listings } = useListings(selectedDistrict);

  const { mapRef, poiRendererRef, isMapReady } = useLeafletMap({
    containerId: MAP_CONTAINER_ID,
    enabled: results !== null,
  });

  const handleDistrictSelect = useCallback((layer: SelectedDistrictLayer) => {
    setSelectedLayer(layer);
  }, []);

  useDistrictLayers({
    mapRef,
    isMapReady,
    results,
    onSelect: handleDistrictSelect,
  });

  usePoiMarkers({
    mapRef,
    rendererRef: poiRendererRef,
    isMapReady,
    pois,
  });

  useListingMarkers({
    mapRef,
    isMapReady,
    listings,
  });

  const districtName = selectedDistrict ?? "";
  const districtPois = pois.filter((p) => p.district === districtName);

  return (
    <div className="relative h-[calc(100dvh-4rem)] w-full overflow-hidden bg-slate-900">
      <div className="absolute inset-0" id={MAP_CONTAINER_ID} />

      {!isMapReady && <MapLoadingOverlay />}

      <MapControls
        selectedTypesCount={selectedTypes.size}
        isLoadingPois={isLoadingPois}
        onOpenFilter={() => setIsFilterOpen(true)}
      />

      <PoiFilter
        poiTypes={poiTypes}
        selectedTypes={selectedTypes}
        onChange={setSelectedTypes}
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        isLoading={isLoadingPois}
      />

      <MapLegend />

      {results && (
        <DistrictInfoPanel
          isVisible={selectedLayer !== null}
          districtName={districtName}
          matchingScore={
            selectedLayer ? getMatchingScore(districtName, results) : null
          }
          results={results}
          pois={districtPois}
          onClose={() => setSelectedLayer(null)}
        />
      )}
    </div>
  );
}

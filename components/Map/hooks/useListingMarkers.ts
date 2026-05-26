"use client";

import { MutableRefObject, useEffect, useRef } from "react";
import L from "leaflet";
import type { Listing } from "@/global/types/listings";
import {
  createClusterIcon,
  createListingMarker,
} from "@/components/Map/listing.utils";

interface UseListingMarkersOptions {
  mapRef: MutableRefObject<L.Map | null>;
  isMapReady: boolean;
  listings: Listing[];
}

export function useListingMarkers({
  mapRef,
  isMapReady,
  listings,
}: UseListingMarkersOptions): void {
  const pinLayerRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!isMapReady || !map) return;

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
  }, [listings, isMapReady, mapRef]);
}

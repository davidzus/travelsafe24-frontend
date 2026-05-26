"use client";

import { MutableRefObject, useEffect, useRef, useState } from "react";
import L from "leaflet";
import {
  DEFAULT_ZOOM,
  HAMBURG_CENTER,
  TILE_ATTRIBUTION,
  TILE_URL,
} from "@/global/constants/map.constants";

interface UseLeafletMapOptions {
  containerId: string;
  enabled: boolean;
}

interface UseLeafletMapResult {
  mapRef: MutableRefObject<L.Map | null>;
  poiRendererRef: MutableRefObject<L.Canvas | null>;
  isMapReady: boolean;
}

export function useLeafletMap({
  containerId,
  enabled,
}: UseLeafletMapOptions): UseLeafletMapResult {
  const mapRef = useRef<L.Map | null>(null);
  const poiRendererRef = useRef<L.Canvas | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!enabled || mapRef.current) return;

    const map = L.map(containerId, {
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

    setIsMapReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
      poiRendererRef.current = null;
      setIsMapReady(false);
    };
  }, [containerId, enabled]);

  return { mapRef, poiRendererRef, isMapReady };
}

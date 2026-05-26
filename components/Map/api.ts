import { API_BASE_URL } from "@/global/constants/api.constants";
import type { Poi, PoiType } from "@/global/types/poi";

export async function fetchPoiTypes(signal?: AbortSignal): Promise<PoiType[]> {
  const res = await fetch(`${API_BASE_URL}/api/poi-types`, { signal });
  if (!res.ok) throw new Error(`POI types request failed: ${res.status}`);
  return (await res.json()) as PoiType[];
}

export async function fetchPoisByType(
  type: string,
  signal?: AbortSignal,
): Promise<Poi[]> {
  const res = await fetch(
    `${API_BASE_URL}/api/pois?type=${encodeURIComponent(type)}`,
    { signal },
  );
  if (!res.ok) throw new Error(`POI request failed: ${res.status}`);
  return (await res.json()) as Poi[];
}

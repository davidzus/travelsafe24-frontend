import { promises as fs } from "node:fs";
import path from "node:path";

const CACHE_FILE = path.join(
  process.cwd(),
  "scripts/scraper/.cache/geocode.json",
);

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "travelsafe24-hackathon-prototype (contact: student project)";
const MIN_INTERVAL_MS = 1100;

type CacheEntry = { lat: number; lng: number } | null;
type Cache = Record<string, CacheEntry>;

let cache: Cache | null = null;
let lastRequestAt = 0;

async function loadCache(): Promise<Cache> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(CACHE_FILE, "utf8");
    cache = JSON.parse(raw) as Cache;
  } catch {
    cache = {};
  }
  return cache;
}

async function saveCache(): Promise<void> {
  if (!cache) return;
  await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
}

async function respectRateLimit(): Promise<void> {
  const wait = MIN_INTERVAL_MS - (Date.now() - lastRequestAt);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequestAt = Date.now();
}

export async function geocode(
  query: string,
): Promise<{ lat: number; lng: number } | null> {
  const normalized = query.trim();
  if (!normalized) return null;

  const c = await loadCache();
  if (normalized in c) return c[normalized];

  await respectRateLimit();
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", `${normalized}, Hamburg, Germany`);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "de");

  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) {
      c[normalized] = null;
      return null;
    }
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (!data.length) {
      c[normalized] = null;
      await saveCache();
      return null;
    }
    const entry = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    c[normalized] = entry;
    await saveCache();
    return entry;
  } catch {
    c[normalized] = null;
    return null;
  }
}

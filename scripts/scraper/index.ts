import { promises as fs } from "node:fs";
import path from "node:path";
import { scrapeKleinanzeigen } from "./kleinanzeigen";
import { cleanBatch } from "./clean";
import { geocode } from "./geocode";
import type { Listing, ListingsFile } from "./types";

const OUTPUT_FILE = path.join(process.cwd(), "data/listings.json");

async function main() {
  const maxPages = Number(process.env.SCRAPE_MAX_PAGES ?? "3");
  const headless = process.env.SCRAPE_HEADLESS !== "false";

  console.log(`[scraper] start (maxPages=${maxPages}, headless=${headless})`);

  const cards = await scrapeKleinanzeigen({ maxPages, headless });
  console.log(`[scraper] scraped ${cards.length} unique cards`);

  const { cleaned, stats } = cleanBatch(cards);
  console.log(`[clean] total=${stats.total}`);
  console.log(`[clean]   price=${stats.withPrice} (${pct(stats.withPrice, stats.total)})`);
  console.log(`[clean]   rooms=${stats.withRooms} (${pct(stats.withRooms, stats.total)})`);
  console.log(`[clean]   size=${stats.withSize} (${pct(stats.withSize, stats.total)})`);
  console.log(`[clean]   district=${stats.withDistrict} (${pct(stats.withDistrict, stats.total)})`);
  if (stats.unknownDistricts.length > 0) {
    console.warn(`[clean] unknown districts (add alias): ${stats.unknownDistricts.join(", ")}`);
  }

  const listings: Listing[] = [];
  let geocodeHits = 0;
  let geocodeMisses = 0;

  for (const item of cleaned) {
    const coords = await geocode(item.locationText);
    if (!coords) {
      geocodeMisses++;
      continue;
    }
    geocodeHits++;
    listings.push({
      ...item,
      lat: coords.lat,
      lng: coords.lng,
      scrapedAt: new Date().toISOString(),
      source: "kleinanzeigen",
    });
  }
  console.log(`[geocode] resolved=${geocodeHits} dropped=${geocodeMisses}`);

  const output: ListingsFile = {
    generatedAt: new Date().toISOString(),
    city: "Hamburg",
    count: listings.length,
    listings,
  };

  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`[scraper] wrote ${listings.length} listings → ${OUTPUT_FILE}`);
}

function pct(n: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((n / total) * 100)}%`;
}

main().catch((err) => {
  console.error("[scraper] fatal:", err);
  process.exit(1);
});

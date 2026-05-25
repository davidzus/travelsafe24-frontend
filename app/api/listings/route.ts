import { NextResponse } from "next/server";
import data from "@/data/listings.json";
import type { ListingsFile } from "@/scripts/scraper/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const district = searchParams.get("district");
  const maxPrice = Number(searchParams.get("maxPrice") ?? "");
  const minRooms = Number(searchParams.get("minRooms") ?? "");

  const file = data as ListingsFile;
  let listings = file.listings;

  if (district) {
    const lower = district.toLowerCase();
    listings = listings.filter((l) => l.district?.toLowerCase() === lower);
  }
  if (!Number.isNaN(maxPrice) && maxPrice > 0) {
    listings = listings.filter((l) => l.priceEuro !== null && l.priceEuro <= maxPrice);
  }
  if (!Number.isNaN(minRooms) && minRooms > 0) {
    listings = listings.filter((l) => l.rooms !== null && l.rooms >= minRooms);
  }

  return NextResponse.json({
    generatedAt: file.generatedAt,
    city: file.city,
    count: listings.length,
    listings,
  });
}

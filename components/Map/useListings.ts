"use client";
import { useEffect, useState } from "react";
import type { Listing, ListingsFile } from "@/global/types/listings";

const LISTINGS_URL =
  process.env.NEXT_PUBLIC_LISTINGS_URL ??
  "https://crayzcoders.github.io/travelsafe24-scraper/listings.json";

interface UseListingsResult {
  listings: Listing[];
  loading: boolean;
}

let allListingsPromise: Promise<Listing[]> | null = null;

function loadAllListings(): Promise<Listing[]> {
  if (!allListingsPromise) {
    allListingsPromise = fetch(LISTINGS_URL)
      .then((res) => res.json() as Promise<ListingsFile>)
      .then((data) => data.listings ?? [])
      .catch((err) => {
        console.error("[useListings] load failed", err);
        allListingsPromise = null;
        return [];
      });
  }
  return allListingsPromise;
}

export function useListings(district: string | null): UseListingsResult {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!district) {
      setListings([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    loadAllListings()
      .then((all) => {
        if (cancelled) return;
        setListings(all.filter((l) => l.district === district));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [district]);

  return { listings, loading };
}

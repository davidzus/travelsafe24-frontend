"use client";
import { useEffect, useState } from "react";
import type { Listing } from "@/scripts/scraper/types";

interface UseListingsResult {
  listings: Listing[];
  loading: boolean;
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

    fetch(`/api/listings?district=${encodeURIComponent(district)}`)
      .then((res) => res.json())
      .then((data: { listings?: Listing[] }) => {
        if (cancelled) return;
        setListings(data.listings ?? []);
      })
      .catch((err) => {
        console.error("[useListings]", err);
        if (!cancelled) setListings([]);
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

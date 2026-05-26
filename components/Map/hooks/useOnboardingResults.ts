"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { EvaluationResponse } from "@/global/types/evaluation";

const STORAGE_KEY = "onboarding";

function readResultsFromStorage(): EvaluationResponse | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as EvaluationResponse;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export function useOnboardingResults(): EvaluationResponse | null {
  const router = useRouter();
  const [results] = useState<EvaluationResponse | null>(readResultsFromStorage);

  useEffect(() => {
    if (results === null) router.replace("/onboarding");
  }, [results, router]);

  return results;
}

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import type { EvaluationResponse } from "@/global/types/evaluation";

const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

import { useOnboardingResults } from "./useOnboardingResults";

const validResults: EvaluationResponse = {
  infos: { city: "Hamburg", minScore: 0, maxScore: 100 },
  districts: { Altona: { matchingScore: 50, criteria: [] } },
};

beforeEach(() => {
  sessionStorage.clear();
  replaceMock.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useOnboardingResults", () => {
  it("returns the parsed results from sessionStorage", () => {
    sessionStorage.setItem("onboarding", JSON.stringify(validResults));
    const { result } = renderHook(() => useOnboardingResults());
    expect(result.current).toEqual(validResults);
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("redirects to onboarding when nothing is stored", async () => {
    const { result } = renderHook(() => useOnboardingResults());
    expect(result.current).toBeNull();
    await waitFor(() =>
      expect(replaceMock).toHaveBeenCalledWith("/onboarding"),
    );
  });

  it("redirects to onboarding when stored JSON is invalid", async () => {
    sessionStorage.setItem("onboarding", "{not valid json");
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useOnboardingResults());

    expect(result.current).toBeNull();
    await waitFor(() =>
      expect(replaceMock).toHaveBeenCalledWith("/onboarding"),
    );
    expect(errorSpy).toHaveBeenCalled();
  });
});

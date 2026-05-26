import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import type { PoiType } from "@/global/types/poi";

const fetchPoiTypesMock = vi.fn();

vi.mock("@/components/Map/api", () => ({
  fetchPoiTypes: (...args: unknown[]) => fetchPoiTypesMock(...args),
}));

import { usePoiTypes } from "./usePoiTypes";

beforeEach(() => {
  fetchPoiTypesMock.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("usePoiTypes", () => {
  it("starts with an empty list", () => {
    fetchPoiTypesMock.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => usePoiTypes());
    expect(result.current).toEqual([]);
  });

  it("populates the list once the fetch resolves", async () => {
    const types: PoiType[] = [{ name: "restaurant" }, { name: "cafe" }];
    fetchPoiTypesMock.mockResolvedValue(types);

    const { result } = renderHook(() => usePoiTypes());

    await waitFor(() => expect(result.current).toEqual(types));
  });

  it("logs and keeps an empty list when the fetch fails", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    fetchPoiTypesMock.mockRejectedValue(new Error("network"));

    const { result } = renderHook(() => usePoiTypes());

    await waitFor(() => expect(errorSpy).toHaveBeenCalled());
    expect(result.current).toEqual([]);
  });

  it("ignores AbortError without logging", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const abortErr = Object.assign(new Error("aborted"), {
      name: "AbortError",
    });
    fetchPoiTypesMock.mockRejectedValue(abortErr);

    renderHook(() => usePoiTypes());

    await waitFor(() => expect(fetchPoiTypesMock).toHaveBeenCalled());
    expect(errorSpy).not.toHaveBeenCalled();
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import type { Poi } from "@/global/types/poi";

const fetchPoisByTypeMock = vi.fn();

vi.mock("@/components/Map/api", () => ({
  fetchPoisByType: (...args: unknown[]) => fetchPoisByTypeMock(...args),
}));

import { usePois } from "./usePois";

function makePoi(id: number, type: string): Poi {
  return {
    id,
    osmId: id * 10,
    name: `poi-${id}`,
    type,
    district: "Altona",
    zipCode: null,
    street: null,
    houseNumber: null,
    latitude: 53.5,
    longitude: 9.9,
  };
}

beforeEach(() => {
  fetchPoisByTypeMock.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("usePois", () => {
  it("returns no pois and does not fetch when nothing is selected", () => {
    const { result } = renderHook(() => usePois(new Set()));
    expect(result.current.pois).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(fetchPoisByTypeMock).not.toHaveBeenCalled();
  });

  it("fetches each selected type and exposes the results", async () => {
    fetchPoisByTypeMock.mockImplementation(async (type: string) =>
      type === "restaurant" ? [makePoi(1, type)] : [makePoi(2, type)],
    );

    const types = new Set(["restaurant", "cafe"]);
    const { result } = renderHook(() => usePois(types));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.pois.map((p) => p.id).sort()).toEqual([1, 2]);
    expect(fetchPoisByTypeMock).toHaveBeenCalledTimes(2);
  });

  it("deduplicates pois that appear under multiple types", async () => {
    const shared = makePoi(7, "restaurant");
    fetchPoisByTypeMock.mockResolvedValue([shared]);

    const types = new Set(["restaurant", "cafe"]);
    const { result } = renderHook(() => usePois(types));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.pois).toHaveLength(1);
    expect(result.current.pois[0].id).toBe(7);
  });

  it("reports loading while a request is in flight", async () => {
    let resolve!: (value: Poi[]) => void;
    fetchPoisByTypeMock.mockReturnValue(
      new Promise<Poi[]>((res) => {
        resolve = res;
      }),
    );

    const types = new Set(["restaurant"]);
    const { result } = renderHook(() => usePois(types));

    expect(result.current.isLoading).toBe(true);

    resolve([makePoi(1, "restaurant")]);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it("aborts the in-flight request when the selection changes", async () => {
    fetchPoisByTypeMock.mockImplementation(
      (_type: string, signal: AbortSignal) =>
        new Promise<Poi[]>((_res, rej) => {
          signal.addEventListener("abort", () =>
            rej(Object.assign(new Error("aborted"), { name: "AbortError" })),
          );
        }),
    );

    const { rerender } = renderHook(({ types }) => usePois(types), {
      initialProps: { types: new Set(["restaurant"]) },
    });

    const firstSignal = fetchPoisByTypeMock.mock.calls[0][1] as AbortSignal;
    expect(firstSignal.aborted).toBe(false);

    rerender({ types: new Set(["cafe"]) });

    expect(firstSignal.aborted).toBe(true);
  });

  it("clears pois immediately when the selection is emptied", async () => {
    fetchPoisByTypeMock.mockResolvedValue([makePoi(1, "restaurant")]);

    const { result, rerender } = renderHook(({ types }) => usePois(types), {
      initialProps: { types: new Set(["restaurant"]) },
    });

    await waitFor(() => expect(result.current.pois).toHaveLength(1));

    rerender({ types: new Set<string>() });

    expect(result.current.pois).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });
});

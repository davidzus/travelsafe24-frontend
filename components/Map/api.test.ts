import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchPoiTypes, fetchPoisByType } from "./api";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
  } as Response;
}

describe("fetchPoiTypes", () => {
  it("requests the poi-types endpoint and returns the parsed body", async () => {
    const types = [{ name: "restaurant" }, { name: "cafe" }];
    fetchMock.mockResolvedValue(jsonResponse(types));

    const result = await fetchPoiTypes();

    expect(result).toEqual(types);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0]).toContain("/api/poi-types");
  });

  it("throws when the response is not ok", async () => {
    fetchMock.mockResolvedValue(jsonResponse(null, false, 500));
    await expect(fetchPoiTypes()).rejects.toThrow(/500/);
  });

  it("forwards the abort signal", async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));
    const controller = new AbortController();
    await fetchPoiTypes(controller.signal);
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      signal: controller.signal,
    });
  });
});

describe("fetchPoisByType", () => {
  it("url-encodes the type query parameter", async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));
    await fetchPoisByType("place_of_worship");
    expect(fetchMock.mock.calls[0][0]).toContain(
      "type=place_of_worship",
    );
  });

  it("encodes special characters in the type", async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));
    await fetchPoisByType("a&b c");
    expect(fetchMock.mock.calls[0][0]).toContain("type=a%26b%20c");
  });

  it("throws when the response is not ok", async () => {
    fetchMock.mockResolvedValue(jsonResponse(null, false, 404));
    await expect(fetchPoisByType("restaurant")).rejects.toThrow(/404/);
  });
});

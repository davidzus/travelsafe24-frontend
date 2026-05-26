import { describe, expect, it } from "vitest";
import type { EvaluationResponse } from "@/global/types/evaluation";
import { getDistrictColor, getDistrictStyle, getMatchingScore } from "./map.utils";

function makeResults(
  districts: Record<string, number>,
  maxScore = 100,
): EvaluationResponse {
  return {
    infos: { city: "Hamburg", minScore: 0, maxScore },
    districts: Object.fromEntries(
      Object.entries(districts).map(([name, matchingScore]) => [
        name,
        { matchingScore, criteria: [] },
      ]),
    ),
  };
}

describe("getDistrictColor", () => {
  const results = makeResults({}, 100);

  it("returns the lowest gradient color for the minimum score", () => {
    expect(getDistrictColor(0, results)).toBe("#e74c3c");
  });

  it("returns the highest gradient color for the maximum score", () => {
    expect(getDistrictColor(100, results)).toBe("#27ae60");
  });

  it("maps a mid score to a mid gradient color", () => {
    expect(getDistrictColor(50, results)).toBe("#f1c40f");
  });

  it("falls back to the top color when the score range is zero", () => {
    expect(getDistrictColor(0, makeResults({}, 0))).toBe("#27ae60");
  });
});

describe("getDistrictStyle", () => {
  it("returns a colored style for a known district", () => {
    const results = makeResults({ Altona: 100 });
    const style = getDistrictStyle("Altona", results);
    expect(style).toMatchObject({
      color: "#27ae60",
      fillColor: "#27ae60",
      opacity: 1,
      fillOpacity: 0.55,
    });
  });

  it("returns a muted gray style for an unknown district", () => {
    const results = makeResults({ Altona: 50 });
    expect(getDistrictStyle("Unknown", results)).toEqual({
      color: "gray",
      opacity: 0.5,
      stroke: false,
    });
  });
});

describe("getMatchingScore", () => {
  it("rounds the score to two decimals", () => {
    const results = makeResults({ Altona: 7.456 });
    expect(getMatchingScore("Altona", results)).toBe(7.46);
  });

  it("returns an integer score unchanged", () => {
    const results = makeResults({ Altona: 12 });
    expect(getMatchingScore("Altona", results)).toBe(12);
  });
});

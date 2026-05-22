import {
  DistrictEvaluation,
  EvaluationResponse,
} from "@/global/types/evaluation";
import {
  CATEGORY_COLORS,
  Poi,
  formatTypeName,
  getCategoryForType,
} from "@/global/types/poi";
import { useMemo } from "react";

interface DistrictInfoContainerProps {
  districtName: string;
  matchingScore: number | null;
  onClose: () => void;
  results: EvaluationResponse;
  pois: Poi[];
}

function getDistrictData(districtName: string, results: EvaluationResponse) {
  const district: DistrictEvaluation = results.districts[districtName];
  if (!district) return;
  return district;
}

export default function DistrictInfoContainer({
                                                districtName,
                                                matchingScore,
                                                onClose,
                                                results,
                                                pois,
                                              }: DistrictInfoContainerProps) {
  const district = getDistrictData(districtName, results) as DistrictEvaluation;

  const groupedPois = useMemo(() => {
    const map = new Map<string, Poi[]>();
    pois.forEach((p) => {
      if (!map.has(p.type)) map.set(p.type, []);
      map.get(p.type)!.push(p);
    });
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [pois]);

  return (
      <div className="slide-in-right w-72 bg-white text-zinc-900 rounded-xl overflow-hidden shadow-xl border border-zinc-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-zinc-400 mb-1">
              DistrictEvaluation
            </p>
            <h1 className="text-xl font-bold text-zinc-900 leading-tight tracking-tight">
              {districtName}
            </h1>
            {matchingScore && <p>Matching Score: {matchingScore}</p>}
          </div>
          <button
              onClick={onClose}
              className="ml-3 mt-0.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 rounded-md p-1 transition-colors"
              aria-label="Close"
          >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-3 divide-y divide-zinc-100">
          {district?.criteria.map((criteria) => (
              <div
                  key={criteria.name}
                  className="flex justify-between items-center py-2.5"
              >
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              {criteria.name}
            </span>
                <span className="text-sm font-semibold text-zinc-800 font-mono">
              {criteria.value}
            </span>
              </div>
          ))}
          {!district && <p className="py-2 text-sm text-zinc-500">No Data Available</p>}
        </div>

        <div className="border-t border-zinc-100">
          <div className="px-5 py-3">
            <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              Points of Interest
            </span>
              {pois.length > 0 && (
                  <span className="text-xs font-semibold text-zinc-700 tabular-nums">
                {pois.length}
              </span>
              )}
            </div>

            {pois.length === 0 ? (
                <p className="text-xs text-zinc-400 italic py-1">
                  Select POI types from the filter to see places here.
                </p>
            ) : (
                <div className="max-h-64 overflow-y-auto -mr-2 pr-2 space-y-3">
                  {groupedPois.map(([type, items]) => {
                    const category = getCategoryForType(type);
                    const color = CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Other;
                    return (
                        <div key={type}>
                          <div className="flex items-center gap-1.5 mb-1">
                      <span
                          className="h-1.5 w-1.5 rounded-full shrink-0"
                          style={{ background: color }}
                      />
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                        {formatTypeName(type)}
                      </span>
                            <span className="text-[10px] text-zinc-400 tabular-nums">
                        · {items.length}
                      </span>
                          </div>
                          <ul className="space-y-0.5 pl-3">
                            {items.map((poi) => (
                                <li
                                    key={poi.id}
                                    className="text-xs text-zinc-700 truncate"
                                    title={poi.name || "(unnamed)"}
                                >
                                  {poi.name || (
                                      <span className="text-zinc-400 italic">unnamed</span>
                                  )}
                                </li>
                            ))}
                          </ul>
                        </div>
                    );
                  })}
                </div>
            )}
          </div>
        </div>

        <div className="h-0.5 bg-linear-to-r from-[rgb(247,100,94)] via-[rgb(247,140,100)] to-transparent" />
      </div>
  );
}
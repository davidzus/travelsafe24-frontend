"use client";

import { EvaluationResponse } from "@/global/types/evaluation";
import { Poi } from "@/global/types/poi";
import DistrictInfoContainer from "@/components/Map/DistrictInfoContainer";

interface DistrictInfoPanelProps {
  isVisible: boolean;
  districtName: string;
  matchingScore: number | null;
  results: EvaluationResponse;
  pois: Poi[];
  onClose: () => void;
}

export default function DistrictInfoPanel({
  isVisible,
  districtName,
  matchingScore,
  results,
  pois,
  onClose,
}: DistrictInfoPanelProps) {
  return (
    <div
      className={`absolute top-4 right-4 z-400 transition-all duration-300 ease-out ${
        isVisible
          ? "translate-x-0 opacity-100"
          : "pointer-events-none translate-x-6 opacity-0"
      }`}
    >
      {isVisible && (
        <DistrictInfoContainer
          districtName={districtName}
          matchingScore={matchingScore}
          onClose={onClose}
          results={results}
          pois={pois}
        />
      )}
    </div>
  );
}

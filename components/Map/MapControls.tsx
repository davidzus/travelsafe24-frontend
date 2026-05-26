"use client";

interface MapControlsProps {
  selectedTypesCount: number;
  isLoadingPois: boolean;
  onOpenFilter: () => void;
}

export default function MapControls({
  selectedTypesCount,
  isLoadingPois,
  onOpenFilter,
}: MapControlsProps) {
  return (
    <div className="pointer-events-none absolute top-4 left-4 z-400 flex flex-col items-start gap-2">
      <div className="pointer-events-auto rounded-2xl bg-white/95 px-4 py-3 shadow-xl ring-1 ring-black/5 backdrop-blur-md">
        <h1 className="text-sm font-semibold tracking-tight text-slate-900">
          Hamburg District Match
        </h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Hover a district · click for details
        </p>
      </div>

      <button
        onClick={onOpenFilter}
        className="pointer-events-auto flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-slate-700 shadow-xl ring-1 ring-black/5 backdrop-blur-md transition hover:bg-white hover:text-slate-900"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <path d="M3 6h18M6 12h12M10 18h4" />
        </svg>
        <span>POI Filter</span>
        {selectedTypesCount > 0 && (
          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-white">
            {selectedTypesCount}
          </span>
        )}
        {isLoadingPois && (
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
        )}
      </button>
    </div>
  );
}

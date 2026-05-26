export default function MapLegend() {
  return (
    <div className="pointer-events-none absolute bottom-6 left-4 z-400">
      <div className="pointer-events-auto rounded-2xl bg-white/95 p-3 shadow-xl ring-1 ring-black/5 backdrop-blur-md">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
          Match score
        </p>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-slate-500">Low</span>
          <div
            className="h-2 w-36 rounded-full"
            style={{
              background:
                "linear-gradient(to right, #ef4444, #f59e0b, #eab308, #84cc16, #22c55e)",
            }}
          />
          <span className="text-[10px] font-medium text-slate-500">High</span>
        </div>
      </div>
    </div>
  );
}

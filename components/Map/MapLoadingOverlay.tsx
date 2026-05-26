export default function MapLoadingOverlay() {
  return (
    <div className="absolute inset-0 z-500 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/15 border-t-white" />
        <p className="text-sm text-white/60">Loading Hamburg…</p>
      </div>
    </div>
  );
}

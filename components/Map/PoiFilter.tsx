"use client";

import { useMemo, useState } from "react";
import {
    CATEGORY_COLORS,
    POI_CATEGORIES,
    PoiType,
    formatTypeName,
    getCategoryForType,
} from "@/global/types/poi";

type Props = {
    poiTypes: PoiType[];
    selectedTypes: Set<string>;
    onChange: (next: Set<string>) => void;
    isOpen: boolean;
    onClose: () => void;
    isLoading?: boolean;
};

export default function PoiFilter({
                                      poiTypes,
                                      selectedTypes,
                                      onChange,
                                      isOpen,
                                      onClose,
                                      isLoading,
                                  }: Props) {
    const [search, setSearch] = useState("");

    const grouped = useMemo(() => {
        const out: Record<string, string[]> = {};
        const q = search.trim().toLowerCase();

        poiTypes.forEach(({ name }) => {
            if (q && !name.toLowerCase().includes(q)) return;
            const category = getCategoryForType(name);
            if (!out[category]) out[category] = [];
            out[category].push(name);
        });

        Object.keys(out).forEach((cat) => out[cat].sort());
        return out;
    }, [poiTypes, search]);

    const categoryOrder = useMemo(() => {
        const known = Object.keys(POI_CATEGORIES);
        return [...known, "Other"].filter((cat) => cat in grouped);
    }, [grouped]);

    const toggle = (name: string) => {
        const next = new Set(selectedTypes);
        if (next.has(name)) next.delete(name);
        else next.add(name);
        onChange(next);
    };

    const clearAll = () => onChange(new Set());

    return (
        <div
            className={`absolute top-4 left-4 z-450 w-72 transition-all duration-300 ease-out ${
                isOpen
                    ? "translate-x-0 opacity-100"
                    : "pointer-events-none -translate-x-4 opacity-0"
            }`}
        >
            <div className="flex max-h-[calc(100dvh-8rem)] flex-col rounded-2xl bg-white/95 shadow-xl ring-1 ring-black/5 backdrop-blur-md">
                <div className="flex items-start justify-between border-b border-slate-200 px-4 py-3">
                    <div>
                        <h2 className="text-sm font-semibold tracking-tight text-slate-900">
                            Points of Interest
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            {selectedTypes.size === 0
                                ? "Select types to display"
                                : `${selectedTypes.size} type${selectedTypes.size === 1 ? "" : "s"} selected`}
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                        {isLoading && (
                            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                        )}
                        <button
                            onClick={onClose}
                            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Close filter"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                            >
                                <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="border-b border-slate-200 p-3">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search types…"
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    />
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {categoryOrder.length === 0 && (
                        <p className="px-2 py-4 text-center text-xs text-slate-500">
                            No types match &ldquo;{search}&rdquo;
                        </p>
                    )}
                    {categoryOrder.map((category) => (
                        <div key={category} className="mb-3 last:mb-0">
                            <div className="mb-1 flex items-center gap-2 px-2">
                <span
                    className="h-2 w-2 rounded-full"
                    style={{
                        background:
                            CATEGORY_COLORS[category] ?? CATEGORY_COLORS.Other,
                    }}
                />
                                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                    {category}
                                </h3>
                            </div>
                            <ul>
                                {grouped[category].map((typeName) => (
                                    <li key={typeName}>
                                        <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 transition hover:bg-slate-100">
                                            <input
                                                type="checkbox"
                                                checked={selectedTypes.has(typeName)}
                                                onChange={() => toggle(typeName)}
                                                className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-400 focus:ring-offset-0"
                                            />
                                            <span>{formatTypeName(typeName)}</span>
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {selectedTypes.size > 0 && (
                    <div className="border-t border-slate-200 p-3">
                        <button
                            onClick={clearAll}
                            className="w-full rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                        >
                            Clear all ({selectedTypes.size})
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
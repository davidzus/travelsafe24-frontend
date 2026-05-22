export type PoiType = { name: string };

export type Poi = {
    id: number;
    osmId: number;
    name: string;
    type: string;
    district: string;
    zipCode: string | null;
    street: string | null;
    houseNumber: string | null;
    latitude: number;
    longitude: number;
};

export const POI_CATEGORIES: Record<string, string[]> = {
    "Food & Drink": [
        "restaurant",
        "cafe",
        "bar",
        "pub",
        "fast_food",
        "biergarten",
        "ice_cream",
        "food_court",
        "nightclub",
    ],
    Transport: [
        "parking",
        "bus_station",
        "ferry_terminal",
        "taxi",
        "bicycle_parking",
        "bicycle_rental",
        "car_rental",
        "car_sharing",
        "charging_station",
        "fuel",
        "motorcycle_parking",
    ],
    Health: ["pharmacy", "doctors", "hospital", "dentist", "clinic", "veterinary"],
    Education: [
        "school",
        "university",
        "college",
        "kindergarten",
        "library",
        "music_school",
        "language_school",
        "art_school",
        "driving_school",
        "childcare",
    ],
    Finance: ["bank", "atm", "bureau_de_change", "money_transfer"],
    "Public Services": [
        "post_office",
        "post_box",
        "parcel_locker",
        "police",
        "fire_station",
        "courthouse",
        "townhall",
        "recycling",
    ],
    "Culture & Leisure": [
        "cinema",
        "theatre",
        "arts_centre",
        "community_centre",
        "casino",
        "music_venue",
        "concert_hall",
        "events_venue",
        "marketplace",
        "exhibition_centre",
    ],
    "Public Facilities": [
        "toilets",
        "drinking_water",
        "bench",
        "shelter",
        "fountain",
    ],
    Worship: ["place_of_worship", "monastery"],
};

export const CATEGORY_COLORS: Record<string, string> = {
    "Food & Drink": "#f97316",
    Transport: "#3b82f6",
    Health: "#ef4444",
    Education: "#a855f7",
    Finance: "#22c55e",
    "Public Services": "#0ea5e9",
    "Culture & Leisure": "#ec4899",
    "Public Facilities": "#64748b",
    Worship: "#eab308",
    Other: "#71717a",
};

export function getCategoryForType(type: string): string {
    for (const [category, types] of Object.entries(POI_CATEGORIES)) {
        if (types.includes(type)) return category;
    }
    return "Other";
}

export function formatTypeName(type: string): string {
    return type
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}
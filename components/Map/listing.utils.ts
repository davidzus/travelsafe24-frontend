import L from "leaflet";
import type { Listing } from "@/global/types/listings";

const PIN_COLOR = "rgb(247,100,94)";

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

function formatPrice(eur: number | null): string {
  if (eur == null) return "Preis n.a.";
  return `${eur.toLocaleString("de-DE")} €`;
}

function formatMeta(listing: Listing): string {
  const parts: string[] = [];
  if (listing.rooms != null) parts.push(`${listing.rooms} Zimmer`);
  if (listing.sizeSqm != null) parts.push(`${listing.sizeSqm} m²`);
  return parts.join(" · ");
}

export function createListingIcon(): L.DivIcon {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
      width="14" height="14" style="transform: rotate(45deg);">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>`;
  return L.divIcon({
    className: "listing-pin",
    html: `<div style="
      width: 28px; height: 28px; border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      background: ${PIN_COLOR};
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
    ">${svg}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

export function buildPopupHtml(listing: Listing): string {
  const title = escapeHtml(listing.title);
  const price = formatPrice(listing.priceEuro);
  const meta = formatMeta(listing);
  const url = escapeHtml(listing.url);
  const thumb = listing.thumbnailUrl
    ? `<img src="${escapeHtml(listing.thumbnailUrl)}" alt="" style="width:100%;height:110px;object-fit:cover;border-radius:6px;margin-bottom:8px;display:block;" />`
    : "";

  return `
    <div style="min-width:220px;font-family:system-ui,sans-serif;">
      ${thumb}
      <div style="font-weight:600;font-size:13px;line-height:1.35;margin-bottom:6px;color:#18181b;">${title}</div>
      <div style="font-size:17px;font-weight:700;color:${PIN_COLOR};margin-bottom:2px;">${price}</div>
      ${meta ? `<div style="font-size:12px;color:#71717a;margin-bottom:8px;">${meta}</div>` : ""}
      <a href="${url}" target="_blank" rel="noopener noreferrer"
         style="font-size:11px;color:#2563eb;text-decoration:none;font-weight:500;">
        Auf Kleinanzeigen öffnen →
      </a>
    </div>
  `;
}

export function createListingMarker(listing: Listing): L.Marker {
  return L.marker([listing.lat, listing.lng], {
    icon: createListingIcon(),
  }).bindPopup(buildPopupHtml(listing), { maxWidth: 260 });
}

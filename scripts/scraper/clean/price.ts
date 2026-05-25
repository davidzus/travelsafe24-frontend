export function extractPrice(priceText: string): number | null {
  if (!priceText) return null;
  const cleaned = priceText.replace(/\./g, "").replace(",", ".");
  const match = cleaned.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

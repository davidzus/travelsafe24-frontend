import { chromium, type Browser, type Page } from "playwright";
import type { RawCard } from "./types";

const BASE_URL = "https://www.kleinanzeigen.de";
const SEARCH_PATH = "/s-wohnung-mieten/hamburg/c203l9409";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

function randomDelay(minMs: number, maxMs: number): Promise<void> {
  const ms = minMs + Math.random() * (maxMs - minMs);
  return new Promise((r) => setTimeout(r, ms));
}

async function extractListingsFromPage(page: Page): Promise<RawCard[]> {
  return page.evaluate((origin): RawCard[] => {
    const items = Array.from(
      document.querySelectorAll("article.aditem"),
    ) as HTMLElement[];

    return items
      .map((el): RawCard | null => {
        const id = el.getAttribute("data-adid") ?? "";
        const linkEl = el.querySelector<HTMLAnchorElement>("a.ellipsis");
        const url = linkEl?.getAttribute("href") ?? "";
        const title = (linkEl?.textContent ?? "").trim();
        const priceText = (
          el.querySelector(".aditem-main--middle--price-shipping--price")
            ?.textContent ?? ""
        ).trim();
        const locationText = (
          el.querySelector(".aditem-main--top--left")?.textContent ?? ""
        ).trim();
        const tags = Array.from(
          el.querySelectorAll(".text-module-end, .simpletag"),
        )
          .map((t) => (t.textContent ?? "").trim())
          .filter(Boolean);
        const thumbnailUrl =
          el.querySelector<HTMLImageElement>("img.imagebox-thumbnail")?.src ??
          el.querySelector<HTMLImageElement>(".aditem-image img")?.src ??
          null;
        const postedAt =
          el.querySelector(".aditem-main--top--right")?.textContent?.trim() ??
          null;

        if (!id || !url || !title) return null;

        return {
          id,
          url: url.startsWith("http") ? url : origin + url,
          title,
          priceText,
          locationText,
          tags,
          thumbnailUrl,
          postedAt,
        };
      })
      .filter((x): x is RawCard => x !== null);
  }, BASE_URL);
}

export interface ScrapeOptions {
  maxPages: number;
  headless: boolean;
}

export async function scrapeKleinanzeigen(
  options: ScrapeOptions,
): Promise<RawCard[]> {
  const browser: Browser = await chromium.launch({ headless: options.headless });
  const context = await browser.newContext({
    userAgent: USER_AGENT,
    locale: "de-DE",
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const collected = new Map<string, RawCard>();

  try {
    for (let i = 1; i <= options.maxPages; i++) {
      const url =
        i === 1
          ? `${BASE_URL}${SEARCH_PATH}`
          : `${BASE_URL}/seite:${i}${SEARCH_PATH}`;
      console.log(`[kleinanzeigen] page ${i} → ${url}`);

      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

      const blocked = await page.locator("text=Zugriff verweigert").count();
      if (blocked > 0) {
        console.warn("[kleinanzeigen] blocked — stopping early");
        break;
      }

      await page
        .waitForSelector("article.aditem", { timeout: 15000 })
        .catch(() => null);

      const cards = await extractListingsFromPage(page);
      console.log(`[kleinanzeigen] page ${i}: ${cards.length} cards`);
      for (const card of cards) {
        if (!collected.has(card.id)) collected.set(card.id, card);
      }

      if (cards.length === 0) break;
      if (i < options.maxPages) await randomDelay(3000, 6000);
    }
  } finally {
    await browser.close();
  }

  return Array.from(collected.values());
}

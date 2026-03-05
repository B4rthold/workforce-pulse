/**
 * Bright Data Scraping Browser scraper — uses Playwright over CDP.
 *
 * Connects to the remote headless Chrome managed by Bright Data.
 * Handles anti-bot protection, IP rotation, and CAPTCHA automatically.
 *
 * SERVER-SIDE ONLY — requires BRIGHT_DATA_BROWSER_WSS env var.
 */

import { chromium, type Page } from "playwright-core";

const BROWSER_WSS = process.env.BRIGHT_DATA_BROWSER_WSS ?? "";

export interface ScrapedJob {
  job_id: string | null;
  title: string;
  company_name: string;
  location: string;
  date_posted: string;
  description: string;
  url: string;
  source: "indeed";
}

// Default search queries — focused on Montgomery, AL critical sectors
export const DEFAULT_SCRAPE_QUERIES = [
  { keyword: "police officer sheriff deputy",  location: "Montgomery, AL" },
  { keyword: "firefighter fire department",    location: "Montgomery, AL" },
  { keyword: "paramedic EMT EMS dispatcher",   location: "Montgomery, AL" },
  { keyword: "nurse RN LPN CNA healthcare",    location: "Montgomery, AL" },
  { keyword: "construction electrician welder",location: "Montgomery, AL" },
  { keyword: "teacher educator school",        location: "Montgomery, AL" },
  { keyword: "software developer IT support",  location: "Montgomery, AL" },
] as const;

// ---------------------------------------------------------------------------
// Indeed scraper — one search result page per query
// ---------------------------------------------------------------------------

async function scrapeIndeedPage(
  page: Page,
  keyword: string,
  location: string
): Promise<ScrapedJob[]> {
  const url =
    `https://www.indeed.com/jobs` +
    `?q=${encodeURIComponent(keyword)}` +
    `&l=${encodeURIComponent(location)}` +
    `&fromage=30` + // last 30 days
    `&limit=25`;   // max results per page

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30_000 });

  // Wait for job cards (or bail after 8s if the page structure is unexpected)
  await page
    .waitForSelector('[data-jk], .job_seen_beacon, [class*="jobCard"]', {
      timeout: 8_000,
    })
    .catch(() => null);

  // Extract all job cards in the browser context
  const jobs = await page.evaluate((): ScrapedJob[] => {
    // Collect job cards — try multiple container selectors
    const cardEls: Element[] = [];
    const selectors = [
      '[data-jk]',
      '.job_seen_beacon',
      'li[class*="JobCard"]',
      'div[class*="jobCard"]',
    ];
    for (const sel of selectors) {
      const found = Array.from(document.querySelectorAll(sel));
      if (found.length > 0) {
        cardEls.push(...found);
        break;
      }
    }

    function text(el: Element | null): string {
      return el?.textContent?.trim() ?? "";
    }

    function attr(el: Element | null, name: string): string {
      return el?.getAttribute(name) ?? "";
    }

    return cardEls.slice(0, 20).map((card): ScrapedJob => {
      // --- job_id ---
      const jk =
        card.getAttribute("data-jk") ??
        card.querySelector("[data-jk]")?.getAttribute("data-jk") ??
        null;

      // --- title ---
      const title =
        text(card.querySelector("h2.jobTitle span[title]")) ||
        attr(card.querySelector("h2.jobTitle span[title]"), "title") ||
        text(card.querySelector("h2.jobTitle a span")) ||
        text(card.querySelector("h2.jobTitle")) ||
        text(card.querySelector('[data-testid="jobTitle"]')) ||
        text(card.querySelector("a[data-jk]")) ||
        "";

      // --- company ---
      const company =
        text(card.querySelector('[data-testid="company-name"]')) ||
        text(card.querySelector(".companyName")) ||
        text(card.querySelector('[class*="companyName"]')) ||
        "";

      // --- location ---
      const location =
        text(card.querySelector('[data-testid="text-location"]')) ||
        text(card.querySelector(".companyLocation")) ||
        text(card.querySelector('[class*="companyLocation"]')) ||
        "";

      // --- date ---
      const date =
        text(card.querySelector('[data-testid="myJobsStateDate"]')) ||
        text(card.querySelector(".date")) ||
        text(card.querySelector('[class*="date"]')) ||
        "";

      // --- snippet ---
      const snippet =
        text(card.querySelector(".job-snippet")) ||
        text(card.querySelector('[data-testid="jobDescriptionText"]')) ||
        text(card.querySelector('[class*="jobSnippet"]')) ||
        text(card.querySelector('[class*="snippet"]')) ||
        "";

      return {
        job_id: jk,
        title,
        company_name: company,
        location,
        date_posted: date,
        description: snippet,
        url: jk ? `https://www.indeed.com/viewjob?jk=${jk}` : "",
        source: "indeed",
      };
    });
  });

  return jobs.filter((j) => j.title.length > 0);
}

// ---------------------------------------------------------------------------
// Main export — scrape all queries in one browser session
// ---------------------------------------------------------------------------

export interface ScrapeResult {
  jobs: ScrapedJob[];
  queriesRun: number;
  queriesFailed: number;
  durationMs: number;
}

export async function scrapeIndeedJobs(
  queries: readonly { keyword: string; location: string }[] = DEFAULT_SCRAPE_QUERIES
): Promise<ScrapeResult> {
  if (!BROWSER_WSS) {
    throw new Error("BRIGHT_DATA_BROWSER_WSS is not configured");
  }

  const start = Date.now();
  const allJobs: ScrapedJob[] = [];
  let queriesFailed = 0;

  const browser = await chromium.connectOverCDP(BROWSER_WSS);

  try {
    for (const { keyword, location } of queries) {
      const page = await browser.newPage();
      try {
        const jobs = await scrapeIndeedPage(page, keyword, location);
        allJobs.push(...jobs);
      } catch {
        queriesFailed++;
        // Continue — return partial results on failure
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  // Deduplicate by job_id (same posting can appear for multiple keywords)
  const seen = new Set<string>();
  const unique = allJobs.filter((job) => {
    const key = job.job_id ?? `${job.title}::${job.company_name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    jobs: unique,
    queriesRun: queries.length,
    queriesFailed,
    durationMs: Date.now() - start,
  };
}

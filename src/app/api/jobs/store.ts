/**
 * In-process job store.
 * Stores scraped JobPosting records and derived JobInsights in Node.js module scope.
 * This is sufficient for a hackathon — data persists across requests in the same
 * process and resets on server restart. Replace with a real DB for production.
 */

import type { JobPosting, JobInsights } from "@/services/types";

class JobStore {
  private postings = new Map<string, JobPosting>();
  private cachedInsights: JobInsights | null = null;

  upsert(posting: JobPosting): void {
    this.postings.set(posting.id, posting);
    this.cachedInsights = null; // invalidate derived cache
  }

  getAll(): JobPosting[] {
    return Array.from(this.postings.values());
  }

  setInsights(insights: JobInsights): void {
    this.cachedInsights = insights;
  }

  getInsights(): JobInsights | null {
    return this.cachedInsights;
  }

  count(): number {
    return this.postings.size;
  }

  clear(): void {
    this.postings.clear();
    this.cachedInsights = null;
  }
}

// Singleton — shared across all API route invocations in the same Node process
export const jobStore = new JobStore();

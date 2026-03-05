import type { Skill, PulseStatus } from "../types";
import { stubSkills } from "../stubs/skills.stub";

const USE_STUBS = process.env.NEXT_PUBLIC_USE_STUBS === "true";
const API = process.env.NEXT_PUBLIC_API_URL ?? "";

export interface SkillFilters {
  category?: string;
  status?: PulseStatus;
  search?: string;
}

export async function fetchSkills(filters?: SkillFilters): Promise<Skill[]> {
  if (USE_STUBS) {
    let results = stubSkills;
    if (filters?.category && filters.category !== "All") {
      results = results.filter((s) => s.category === filters.category);
    }
    if (filters?.status) {
      results = results.filter((s) => s.demandLevel === filters.status);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      results = results.filter((s) => s.name.toLowerCase().includes(q));
    }
    return results;
  }
  const params = new URLSearchParams();
  if (filters?.category) params.set("category", filters.category);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.search) params.set("search", filters.search);
  const res = await fetch(`${API}/skills?${params}`);
  if (!res.ok) throw new Error("Failed to fetch skills");
  return res.json();
}

export async function fetchSkillById(id: string): Promise<Skill | undefined> {
  if (USE_STUBS) return stubSkills.find((s) => s.id === id);
  const res = await fetch(`${API}/skills/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch skill ${id}`);
  return res.json();
}

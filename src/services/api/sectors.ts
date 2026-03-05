import type { Sector, SectorDetail, PulseStatus } from "../types";
import { stubSectors } from "../stubs/sectors.stub";
import { stubSectorDetails } from "../stubs/sector-detail.stub";

const USE_STUBS = process.env.NEXT_PUBLIC_USE_STUBS === "true";
const API = process.env.NEXT_PUBLIC_API_URL ?? "";

const ARCGIS_911_URL = process.env.NEXT_PUBLIC_ARCGIS_911_URL ?? "";
const ARCGIS_PERMITS_URL = process.env.NEXT_PUBLIC_ARCGIS_PERMITS_URL ?? "";

export async function fetchSectors(): Promise<Sector[]> {
  if (USE_STUBS) return stubSectors;

  // If a REST API is configured, use it
  if (API) {
    const res = await fetch(`${API}/sectors`);
    if (!res.ok) throw new Error("Failed to fetch sectors");
    return res.json();
  }

  // Otherwise augment stub data with live ArcGIS counts
  try {
    const [callsRes, permitsRes] = await Promise.all([
      ARCGIS_911_URL
        ? fetch(`${ARCGIS_911_URL}/query?where=1%3D1&returnCountOnly=true&f=json`, { next: { revalidate: 3600 } })
        : Promise.resolve(null),
      ARCGIS_PERMITS_URL
        ? fetch(`${ARCGIS_PERMITS_URL}/query?where=1%3D1&returnCountOnly=true&f=json`, { next: { revalidate: 3600 } })
        : Promise.resolve(null),
    ]);

    const callCount: number = callsRes ? (await callsRes.json()).count ?? 0 : 0;
    const permitCount: number = permitsRes ? (await permitsRes.json()).count ?? 0 : 0;

    return stubSectors.map((sector) => {
      if (sector.id === "public-safety" && callCount > 0) {
        const score = Math.min(100, Math.round(callCount / 50));
        const status: PulseStatus = score >= 75 ? "critical" : score >= 45 ? "watch" : "stable";
        return { ...sector, pulseScore: score, status, openRolesCount: Math.max(1, Math.round(callCount * 0.005)) };
      }
      if (sector.id === "construction" && permitCount > 0) {
        const score = Math.min(100, Math.round(permitCount / 20));
        const status: PulseStatus = score >= 75 ? "critical" : score >= 45 ? "watch" : "stable";
        return { ...sector, pulseScore: score, status, openRolesCount: Math.max(1, Math.round(permitCount * 0.02)) };
      }
      return sector;
    });
  } catch {
    // ArcGIS unreachable — fall back to stubs silently
    return stubSectors;
  }
}

export async function fetchSectorById(id: string): Promise<SectorDetail | undefined> {
  if (USE_STUBS) {
    // Return full detail if available, otherwise construct from base sector
    if (stubSectorDetails[id]) return stubSectorDetails[id];
    const base = stubSectors.find((s) => s.id === id);
    if (!base) return undefined;
    return {
      ...base,
      hiringTrend: [],
      criticalRoles: [],
      skills: [],
      missions: [],
      playbooks: [],
    };
  }
  const res = await fetch(`${API}/sectors/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch sector ${id}`);
  return res.json();
}

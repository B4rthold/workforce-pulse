import type { Role } from "../types";
import { stubRoles } from "../stubs/roles.stub";

const USE_STUBS = process.env.NEXT_PUBLIC_USE_STUBS === "true";
const API = process.env.NEXT_PUBLIC_API_URL ?? "";

const ARCGIS_STATIONS_URL = process.env.NEXT_PUBLIC_ARCGIS_STATIONS_URL ?? "";

export async function fetchRoles(): Promise<Role[]> {
  if (USE_STUBS) return stubRoles;

  if (API) {
    const res = await fetch(`${API}/roles`);
    if (!res.ok) throw new Error("Failed to fetch roles");
    return res.json();
  }

  // Augment public safety roles with real station counts from ArcGIS
  try {
    if (!ARCGIS_STATIONS_URL) return stubRoles;
    const res = await fetch(
      `${ARCGIS_STATIONS_URL}/0/query?where=1%3D1&outFields=*&resultRecordCount=100&f=json`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) throw new Error("Stations API error");
    const json = await res.json();
    const stationCount: number = json.features?.length ?? 0;

    if (stationCount === 0) return stubRoles;

    return stubRoles.map((role) => {
      if (role.sectorId === "public-safety") {
        return { ...role, openCount: Math.max(role.openCount, Math.round(stationCount * 0.3)) };
      }
      return role;
    });
  } catch {
    return stubRoles;
  }
}

export async function fetchRolesBySector(sectorId: string): Promise<Role[]> {
  if (USE_STUBS) return stubRoles.filter((r) => r.sectorId === sectorId);
  const res = await fetch(`${API}/roles?sectorId=${sectorId}`);
  if (!res.ok) throw new Error(`Failed to fetch roles for sector ${sectorId}`);
  return res.json();
}

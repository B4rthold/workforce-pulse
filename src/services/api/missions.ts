import type { Mission } from "../types";
import { stubMissions } from "../stubs/missions.stub";

const USE_STUBS = process.env.NEXT_PUBLIC_USE_STUBS === "true";
const API = process.env.NEXT_PUBLIC_API_URL ?? "";

// Mutable in-memory copy for stub state during a session
const mutableMissions = stubMissions.map((m) => ({
  ...m,
  steps: m.steps.map((s) => ({ ...s })),
}));

export async function fetchMissions(): Promise<Mission[]> {
  if (USE_STUBS) return mutableMissions;
  const res = await fetch(`${API}/missions`);
  if (!res.ok) throw new Error("Failed to fetch missions");
  return res.json();
}

export async function fetchMissionById(id: string): Promise<Mission | undefined> {
  if (USE_STUBS) return mutableMissions.find((m) => m.id === id);
  const res = await fetch(`${API}/missions/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch mission ${id}`);
  return res.json();
}

export async function updateMissionStep(
  missionId: string,
  stepId: string,
  completed: boolean
): Promise<Mission> {
  if (USE_STUBS) {
    const mission = mutableMissions.find((m) => m.id === missionId);
    if (!mission) throw new Error(`Mission ${missionId} not found`);
    const step = mission.steps.find((s) => s.id === stepId);
    if (!step) throw new Error(`Step ${stepId} not found`);
    step.completed = completed;
    // Recalculate progress
    const completedCount = mission.steps.filter((s) => s.completed).length;
    mission.progress = Math.round((completedCount / mission.steps.length) * 100);
    return { ...mission, steps: mission.steps.map((s) => ({ ...s })) };
  }
  const res = await fetch(`${API}/missions/${missionId}/steps/${stepId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });
  if (!res.ok) throw new Error(`Failed to update step ${stepId}`);
  return res.json();
}

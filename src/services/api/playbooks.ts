import type { Playbook, CreatePlaybookPayload } from "../types";
import { stubPlaybooks } from "../stubs/playbooks.stub";

const USE_STUBS = process.env.NEXT_PUBLIC_USE_STUBS === "true";
const API = process.env.NEXT_PUBLIC_API_URL ?? "";

// Mutable in-memory copy for stub state during a session
let mutablePlaybooks: Playbook[] = stubPlaybooks.map((p) => ({ ...p }));

export async function fetchPlaybooks(): Promise<Playbook[]> {
  if (USE_STUBS) return mutablePlaybooks;
  const res = await fetch(`${API}/playbooks`);
  if (!res.ok) throw new Error("Failed to fetch playbooks");
  return res.json();
}

export async function createPlaybook(payload: CreatePlaybookPayload): Promise<Playbook> {
  if (USE_STUBS) {
    const newPlaybook: Playbook = {
      id: `playbook-${Date.now()}`,
      title: payload.title,
      summary: payload.summary,
      authorName: "You",
      authorAvatar: "/avatars/user-default.png",
      sectorId: payload.sectorId,
      tags: payload.tags,
      likes: 0,
      saves: 0,
      createdAt: new Date().toISOString(),
      steps: payload.steps,
      hasLiked: false,
      hasSaved: false,
    };
    mutablePlaybooks = [newPlaybook, ...mutablePlaybooks];
    return newPlaybook;
  }
  const res = await fetch(`${API}/playbooks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create playbook");
  return res.json();
}

export async function likePlaybook(id: string): Promise<{ likes: number }> {
  if (USE_STUBS) {
    const playbook = mutablePlaybooks.find((p) => p.id === id);
    if (!playbook) throw new Error(`Playbook ${id} not found`);
    playbook.hasLiked = !playbook.hasLiked;
    playbook.likes += playbook.hasLiked ? 1 : -1;
    return { likes: playbook.likes };
  }
  const res = await fetch(`${API}/playbooks/${id}/like`, { method: "POST" });
  if (!res.ok) throw new Error(`Failed to like playbook ${id}`);
  return res.json();
}

export async function savePlaybook(id: string): Promise<{ saves: number }> {
  if (USE_STUBS) {
    const playbook = mutablePlaybooks.find((p) => p.id === id);
    if (!playbook) throw new Error(`Playbook ${id} not found`);
    playbook.hasSaved = !playbook.hasSaved;
    playbook.saves += playbook.hasSaved ? 1 : -1;
    return { saves: playbook.saves };
  }
  const res = await fetch(`${API}/playbooks/${id}/save`, { method: "POST" });
  if (!res.ok) throw new Error(`Failed to save playbook ${id}`);
  return res.json();
}

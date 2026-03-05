import type { SectorDetail } from "../types";
import { stubSectors } from "./sectors.stub";
import { stubRoles } from "./roles.stub";
import { stubSkills } from "./skills.stub";
import { stubMissions } from "./missions.stub";
import { stubPlaybooks } from "./playbooks.stub";

const publicSafety = stubSectors.find((s) => s.id === "public-safety")!;
const healthcare = stubSectors.find((s) => s.id === "healthcare")!;
const technology = stubSectors.find((s) => s.id === "technology")!;

export const stubSectorDetails: Record<string, SectorDetail> = {
  "public-safety": {
    ...publicSafety,
    hiringTrend: [
      { month: "Apr 2025", hires: 48, attrition: 32 },
      { month: "May 2025", hires: 52, attrition: 35 },
      { month: "Jun 2025", hires: 45, attrition: 38 },
      { month: "Jul 2025", hires: 41, attrition: 42 },
      { month: "Aug 2025", hires: 44, attrition: 40 },
      { month: "Sep 2025", hires: 50, attrition: 45 },
      { month: "Oct 2025", hires: 38, attrition: 48 },
      { month: "Nov 2025", hires: 36, attrition: 50 },
      { month: "Dec 2025", hires: 32, attrition: 46 },
      { month: "Jan 2026", hires: 28, attrition: 44 },
      { month: "Feb 2026", hires: 30, attrition: 42 },
      { month: "Mar 2026", hires: 35, attrition: 40 },
    ],
    criticalRoles: stubRoles.filter((r) =>
      ["emergency-dispatcher", "paramedic", "site-safety-officer"].includes(r.id)
    ),
    skills: stubSkills.filter((s) =>
      ["crisis-management", "emergency-medical-response", "hazmat-handling", "osha-regulations", "patient-triage"].includes(s.id)
    ),
    missions: stubMissions.filter((m) => m.sectorId === "public-safety"),
    playbooks: stubPlaybooks.filter((p) => p.sectorId === "public-safety"),
  },

  healthcare: {
    ...healthcare,
    hiringTrend: [
      { month: "Apr 2025", hires: 120, attrition: 75 },
      { month: "May 2025", hires: 115, attrition: 80 },
      { month: "Jun 2025", hires: 110, attrition: 85 },
      { month: "Jul 2025", hires: 108, attrition: 82 },
      { month: "Aug 2025", hires: 112, attrition: 78 },
      { month: "Sep 2025", hires: 118, attrition: 76 },
      { month: "Oct 2025", hires: 122, attrition: 74 },
      { month: "Nov 2025", hires: 105, attrition: 88 },
      { month: "Dec 2025", hires: 98, attrition: 92 },
      { month: "Jan 2026", hires: 100, attrition: 90 },
      { month: "Feb 2026", hires: 104, attrition: 85 },
      { month: "Mar 2026", hires: 108, attrition: 82 },
    ],
    criticalRoles: stubRoles.filter((r) =>
      ["icu-nurse", "health-informatics-analyst", "medical-coder"].includes(r.id)
    ),
    skills: stubSkills.filter((s) =>
      ["patient-triage", "clinical-documentation", "medical-coding", "sql-data-engineering", "workforce-planning"].includes(s.id)
    ),
    missions: stubMissions.filter((m) => m.sectorId === "healthcare"),
    playbooks: stubPlaybooks.filter((p) => p.sectorId === "healthcare"),
  },

  technology: {
    ...technology,
    hiringTrend: [
      { month: "Apr 2025", hires: 55, attrition: 20 },
      { month: "May 2025", hires: 58, attrition: 18 },
      { month: "Jun 2025", hires: 62, attrition: 22 },
      { month: "Jul 2025", hires: 60, attrition: 24 },
      { month: "Aug 2025", hires: 57, attrition: 21 },
      { month: "Sep 2025", hires: 53, attrition: 19 },
      { month: "Oct 2025", hires: 50, attrition: 23 },
      { month: "Nov 2025", hires: 48, attrition: 26 },
      { month: "Dec 2025", hires: 44, attrition: 22 },
      { month: "Jan 2026", hires: 46, attrition: 20 },
      { month: "Feb 2026", hires: 49, attrition: 18 },
      { month: "Mar 2026", hires: 52, attrition: 17 },
    ],
    criticalRoles: stubRoles.filter((r) =>
      ["cloud-architect", "cybersecurity-engineer", "devops-engineer"].includes(r.id)
    ),
    skills: stubSkills.filter((s) =>
      ["aws-architecture", "kubernetes-orchestration", "devsecops", "cicd-pipelines", "typescript-react"].includes(s.id)
    ),
    missions: stubMissions.filter((m) => m.sectorId === "technology"),
    playbooks: stubPlaybooks.filter((p) => p.sectorId === "technology"),
  },
};

import type { AlertBanner, PulseSummary } from "../types";

export const stubAlerts: AlertBanner[] = [
  {
    id: "alert-1",
    severity: "critical",
    message: "Public Safety facing critical staffing shortage — 47 open roles unfilled for 30+ days.",
    cta: { label: "View sector", href: "/sectors/public-safety" },
    dismissible: false,
  },
  {
    id: "alert-2",
    severity: "watch",
    message: "Healthcare sector showing hiring lag — posting velocity down 18% WoW.",
    cta: { label: "View sector", href: "/sectors/healthcare" },
    dismissible: true,
  },
  {
    id: "alert-3",
    severity: "stable",
    message: "Technology sector workforce stabilizing after recent restructuring.",
    dismissible: true,
  },
];

export const stubPulseSummary: PulseSummary = {
  date: "2026-03-05",
  criticalRolesCount: 47,
  fastestRisingSkills: [
    "Emergency Response",
    "Cloud Infrastructure",
    "Cybersecurity",
    "Data Analysis",
    "Patient Triage",
    "Crisis Management",
  ],
  trainingNeedsCount: 312,
  overallStatus: "watch",
  checkInStreak: 7,
  checkInCompleted: false,
};

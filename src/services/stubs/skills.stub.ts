import type { Skill } from "../types";

export const stubSkills: Skill[] = [
  // Cloud Infrastructure
  {
    id: "aws-architecture",
    name: "AWS Architecture",
    category: "Cloud Infrastructure",
    demandLevel: "critical",
    growthRate: 28,
    sparklineData: [40, 45, 50, 55, 62, 68, 74],
    relatedRoles: ["cloud-architect", "devops-engineer", "cybersecurity-engineer"],
    trainingResources: [
      { title: "AWS Certified Solutions Architect", url: "#", provider: "Amazon Web Services" },
      { title: "Cloud Architecture Fundamentals", url: "#", provider: "Coursera" },
    ],
  },
  {
    id: "kubernetes-orchestration",
    name: "Kubernetes Orchestration",
    category: "Cloud Infrastructure",
    demandLevel: "watch",
    growthRate: 19,
    sparklineData: [30, 32, 35, 38, 40, 42, 45],
    relatedRoles: ["devops-engineer", "cloud-architect"],
    trainingResources: [
      { title: "Certified Kubernetes Administrator (CKA)", url: "#", provider: "CNCF" },
    ],
  },
  {
    id: "devsecops",
    name: "DevSecOps",
    category: "Cloud Infrastructure",
    demandLevel: "watch",
    growthRate: 23,
    sparklineData: [20, 22, 26, 28, 30, 33, 36],
    relatedRoles: ["cybersecurity-engineer", "devops-engineer"],
    trainingResources: [
      { title: "DevSecOps Foundation", url: "#", provider: "DevOps Institute" },
    ],
  },
  // Data Science
  {
    id: "predictive-modeling",
    name: "Predictive Modeling",
    category: "Data Science",
    demandLevel: "critical",
    growthRate: 34,
    sparklineData: [25, 30, 38, 44, 50, 58, 65],
    relatedRoles: ["data-analyst", "cloud-architect"],
    trainingResources: [
      { title: "Machine Learning Specialization", url: "#", provider: "Stanford / Coursera" },
      { title: "Applied Predictive Modeling", url: "#", provider: "Udemy" },
    ],
  },
  {
    id: "sql-data-engineering",
    name: "SQL & Data Engineering",
    category: "Data Science",
    demandLevel: "watch",
    growthRate: 12,
    sparklineData: [55, 56, 57, 58, 58, 59, 60],
    relatedRoles: ["data-analyst", "health-informatics-analyst"],
    trainingResources: [
      { title: "SQL for Data Science", url: "#", provider: "UC Davis / Coursera" },
    ],
  },
  {
    id: "nlp",
    name: "Natural Language Processing",
    category: "Data Science",
    demandLevel: "watch",
    growthRate: 22,
    sparklineData: [15, 17, 19, 22, 25, 28, 31],
    relatedRoles: ["cloud-architect", "cybersecurity-engineer"],
    trainingResources: [
      { title: "NLP with Deep Learning", url: "#", provider: "Stanford / YouTube" },
    ],
  },
  // Leadership
  {
    id: "crisis-management",
    name: "Crisis Management",
    category: "Leadership",
    demandLevel: "critical",
    growthRate: 15,
    sparklineData: [60, 62, 65, 70, 74, 78, 80],
    relatedRoles: ["emergency-dispatcher", "paramedic", "site-safety-officer"],
    trainingResources: [
      { title: "Crisis & Emergency Risk Communication", url: "#", provider: "CDC" },
    ],
  },
  {
    id: "workforce-planning",
    name: "Workforce Planning",
    category: "Leadership",
    demandLevel: "watch",
    growthRate: 9,
    sparklineData: [40, 41, 43, 44, 45, 46, 47],
    relatedRoles: ["supply-chain-analyst", "risk-analyst"],
    trainingResources: [
      { title: "Strategic Workforce Planning", url: "#", provider: "HRCI" },
    ],
  },
  // Safety Compliance
  {
    id: "osha-regulations",
    name: "OSHA Regulations",
    category: "Safety Compliance",
    demandLevel: "watch",
    growthRate: 7,
    sparklineData: [80, 82, 82, 83, 85, 84, 86],
    relatedRoles: ["site-safety-officer", "civil-engineer"],
    trainingResources: [
      { title: "OSHA 30-Hour Construction", url: "#", provider: "OSHA Training Institute" },
    ],
  },
  {
    id: "emergency-medical-response",
    name: "Emergency Medical Response",
    category: "Safety Compliance",
    demandLevel: "critical",
    growthRate: 18,
    sparklineData: [50, 54, 58, 63, 68, 72, 76],
    relatedRoles: ["paramedic", "emergency-dispatcher"],
    trainingResources: [
      { title: "EMT Basic Certification", url: "#", provider: "National Registry of EMTs" },
      { title: "Advanced Cardiac Life Support (ACLS)", url: "#", provider: "American Heart Association" },
    ],
  },
  {
    id: "hazmat-handling",
    name: "Hazmat Handling",
    category: "Safety Compliance",
    demandLevel: "critical",
    growthRate: 21,
    sparklineData: [30, 33, 36, 40, 44, 47, 50],
    relatedRoles: ["paramedic", "logistics-coordinator", "site-safety-officer"],
    trainingResources: [
      { title: "Hazardous Materials Technician", url: "#", provider: "IATA" },
    ],
  },
  // Software Development
  {
    id: "typescript-react",
    name: "TypeScript & React",
    category: "Software Development",
    demandLevel: "stable",
    growthRate: 6,
    sparklineData: [90, 91, 92, 91, 93, 92, 94],
    relatedRoles: ["cloud-architect", "devops-engineer"],
    trainingResources: [
      { title: "React - The Complete Guide", url: "#", provider: "Udemy" },
    ],
  },
  {
    id: "api-design",
    name: "API Design & REST",
    category: "Software Development",
    demandLevel: "stable",
    growthRate: 5,
    sparklineData: [70, 71, 70, 72, 73, 72, 74],
    relatedRoles: ["cloud-architect", "cybersecurity-engineer"],
    trainingResources: [
      { title: "API Design Best Practices", url: "#", provider: "Postman Academy" },
    ],
  },
  {
    id: "cicd-pipelines",
    name: "CI/CD Pipelines",
    category: "Software Development",
    demandLevel: "watch",
    growthRate: 14,
    sparklineData: [35, 37, 40, 43, 46, 48, 51],
    relatedRoles: ["devops-engineer"],
    trainingResources: [
      { title: "GitHub Actions for CI/CD", url: "#", provider: "GitHub Learning Lab" },
    ],
  },
  // Operations
  {
    id: "supply-chain-optimization",
    name: "Supply Chain Optimization",
    category: "Operations",
    demandLevel: "critical",
    growthRate: 25,
    sparklineData: [40, 44, 48, 54, 59, 64, 70],
    relatedRoles: ["logistics-coordinator", "supply-chain-analyst"],
    trainingResources: [
      { title: "APICS CSCP Certification", url: "#", provider: "APICS" },
    ],
  },
  {
    id: "fleet-management",
    name: "Fleet Management",
    category: "Operations",
    demandLevel: "watch",
    growthRate: 11,
    sparklineData: [28, 29, 31, 32, 33, 34, 35],
    relatedRoles: ["logistics-coordinator"],
    trainingResources: [
      { title: "Fleet Management Professional", url: "#", provider: "NPTC" },
    ],
  },
  {
    id: "process-improvement",
    name: "Process Improvement (Lean/Six Sigma)",
    category: "Operations",
    demandLevel: "stable",
    growthRate: 4,
    sparklineData: [55, 55, 56, 56, 57, 57, 58],
    relatedRoles: ["supply-chain-analyst", "risk-analyst"],
    trainingResources: [
      { title: "Lean Six Sigma Green Belt", url: "#", provider: "ASQ" },
    ],
  },
  // Healthcare
  {
    id: "clinical-documentation",
    name: "Clinical Documentation",
    category: "Healthcare",
    demandLevel: "watch",
    growthRate: 8,
    sparklineData: [60, 61, 62, 63, 64, 65, 66],
    relatedRoles: ["icu-nurse", "medical-coder"],
    trainingResources: [
      { title: "Clinical Documentation Improvement", url: "#", provider: "AHIMA" },
    ],
  },
  {
    id: "patient-triage",
    name: "Patient Triage",
    category: "Healthcare",
    demandLevel: "critical",
    growthRate: 20,
    sparklineData: [45, 48, 52, 56, 61, 65, 70],
    relatedRoles: ["icu-nurse", "paramedic"],
    trainingResources: [
      { title: "Emergency Triage Nurse Certification", url: "#", provider: "Emergency Nurses Association" },
    ],
  },
  {
    id: "medical-coding",
    name: "Medical Coding (ICD-10)",
    category: "Healthcare",
    demandLevel: "stable",
    growthRate: 3,
    sparklineData: [40, 40, 41, 41, 42, 42, 43],
    relatedRoles: ["medical-coder", "health-informatics-analyst"],
    trainingResources: [
      { title: "CPC Certification Prep", url: "#", provider: "AAPC" },
    ],
  },
];

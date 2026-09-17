export interface ExecomMember {
  id?: string;
  name: string;
  role: string;
  track: string;
  team?: string;
  email?: string;
  image?: string | null;
  demoImage?: string;
  dept?: string;
  year?: string;
  username?: string;
  linkedin?: string;
  github?: string;
}

export interface ExecomCategory {
  id: string;
  name: string;
  shortName: string;
  description: string;
  accent: string;
  badge: string;
}

export const EXECOM_CATEGORIES: ExecomCategory[] = [
  {
    id: "all",
    name: "All Committees",
    shortName: "All Teams",
    description: "The complete 2025-26 chapter leadership, domain leads, and executive committee.",
    accent: "#2c2e2a",
    badge: "BOARD",
  },
  {
    id: "organiser",
    name: "Chapter Organiser & Leadership",
    shortName: "Organiser",
    description: "Driving chapter vision, institutional growth, and strategic technology direction.",
    accent: "#ff705d",
    badge: "LEADERSHIP",
  },
  {
    id: "ai_ml",
    name: "AI & Machine Learning Team",
    shortName: "AI / ML",
    description: "Gemini multimodal models, deep learning, agentic workflows, and hands-on ML workshops.",
    accent: "#4285F4",
    badge: "AI LAB",
  },
  {
    id: "web",
    name: "Web Architecture Team",
    shortName: "Web Team",
    description: "Next.js, modern React paradigms, distributed systems, and cutting-edge web architecture.",
    accent: "#34A853",
    badge: "WEB LAB",
  },
  {
    id: "cloud",
    name: "Cloud Infrastructure Team",
    shortName: "Cloud Team",
    description: "Google Cloud Platform, Kubernetes, microservices, Firebase, and Cloud Study Jams.",
    accent: "#EA4335",
    badge: "GCP LAB",
  },
  {
    id: "android",
    name: "Mobile & Android Team",
    shortName: "Android Team",
    description: "Kotlin, Jetpack Compose, Flutter cross-platform architecture, and modern mobile UX.",
    accent: "#FBBC04",
    badge: "DEV LAB",
  },
  {
    id: "design",
    name: "Design & Creative Systems",
    shortName: "Design Team",
    description: "UI/UX engineering, Google Material Design 3, design tokens, and tactile brand systems.",
    accent: "#8ed462",
    badge: "DESIGN",
  },
  {
    id: "events",
    name: "Event Management & Operations",
    shortName: "Events Team",
    description: "Solution Challenges, hackathon logistics, speaker coordination, and tech sprint management.",
    accent: "#2ba0ff",
    badge: "OPERATIONS",
  },
  {
    id: "media",
    name: "Media & Visual Production",
    shortName: "Media Team",
    description: "Cinematography, event film recaps, digital broadcasting, and creative community media.",
    accent: "#ffd600",
    badge: "MEDIA",
  },
  {
    id: "marketing",
    name: "Marketing & Growth Team",
    shortName: "Marketing Team",
    description: "Community engagement, campaign outreach, institutional PR, and cross-campus relations.",
    accent: "#ff705d",
    badge: "OUTREACH",
  },
];

export function getMemberCategory(member: ExecomMember): string {
  const team = (member.team || "").toLowerCase().trim();
  const role = (member.role || "").toLowerCase().trim();
  const track = (member.track || "").toLowerCase().trim();

  if (team.includes("organis") || team.includes("organiz") || role.includes("organis") || role.includes("organiz") || role.includes("president")) {
    return "organiser";
  }
  if (team.includes("ai") || team.includes("ml") || role.includes("ai") || role.includes("ml") || track.includes("gemini") || track.includes("machine learning")) {
    return "ai_ml";
  }
  if (team.includes("web") || role.includes("web") || track.includes("next.js") || track.includes("frontend") || track.includes("full stack")) {
    return "web";
  }
  if (team.includes("cloud") || role.includes("cloud") || track.includes("gcp") || track.includes("kubernetes")) {
    return "cloud";
  }
  if (team.includes("android") || team.includes("mobile") || role.includes("android") || role.includes("mobile") || track.includes("kotlin") || track.includes("flutter")) {
    return "android";
  }
  if (team.includes("design") || team.includes("creative") || role.includes("design") || role.includes("creative") || track.includes("ui") || track.includes("motion")) {
    return "design";
  }
  if (team.includes("event") || team.includes("operation") || team.includes("management") || role.includes("event") || role.includes("management") || track.includes("logistics")) {
    return "events";
  }
  if (team.includes("media") || role.includes("media") || track.includes("cinematography") || track.includes("production")) {
    return "media";
  }
  if (team.includes("marketing") || role.includes("marketing") || role.includes("pr") || track.includes("campaign") || track.includes("growth")) {
    return "marketing";
  }

  return "events";
}

// ─── 2025-26 GDG AJCE Executive Committee (Active Core Team) ───────────────
export const GDG_EXECOM_2026: ExecomMember[] = [
  {
    name: "Vinayak Prakash",
    role: "Chapter Lead & Organiser",
    team: "Leadership",
    track: "Chapter Leadership & Systems",
    email: "vinayakprakash2026@cs.ajce.in",
    dept: "CSE",
    year: "2026",
    username: "vinayak-prakash",
  },
  {
    name: "Nandhu Babu",
    role: "AI/ML Lead",
    team: "AI/ML Team",
    track: "AI & Machine Learning",
    email: "nandhubabuvktd@gmail.com",
    dept: "CSE",
    year: "2026",
    username: "nandhu-babu",
  },
  {
    name: "Aravind R Nair",
    role: "AI/ML Core Member",
    team: "AI/ML Team",
    track: "AI & Machine Learning",
    email: "arnair126@gmail.com",
    dept: "CSE",
    year: "2026",
    username: "aravind-r-nair",
  },
  {
    name: "Geo Cherian Mathew",
    role: "AI/ML Core Member",
    team: "AI/ML Team",
    track: "AI & Machine Learning",
    email: "mathewgeo530@gmail.com",
    dept: "CSE",
    year: "2026",
    username: "geo-cherian-mathew",
  },
  {
    name: "Adithya Ajay",
    role: "Android Lead",
    team: "Android Team",
    track: "Mobile & Android Architecture",
    email: "adityaajay574@gmail.com",
    dept: "ECE",
    year: "2026",
    username: "adithya-ajay",
  },
  {
    name: "Jobeal M Joseph",
    role: "Android Core Member",
    team: "Android Team",
    track: "Mobile & Android Architecture",
    email: "jobealmjoseph2027@cs.ajce.in",
    dept: "CSE",
    year: "2026",
    username: "jobeal-m-joseph",
  },
  {
    name: "Alan Jimmy",
    role: "Design Lead",
    team: "Design Team",
    track: "UI/UX & Creative Systems",
    email: "alanjimmy993@gmail.com",
    dept: "IT",
    year: "2026",
    username: "alan-jimmy",
  },
  {
    name: "Chrismon K Biju",
    role: "Design Core Member",
    team: "Design Team",
    track: "UI/UX & Creative Systems",
    email: "chrismonkbiju@gmail.com",
    dept: "CSE",
    year: "2026",
    username: "chrismon-k-biju",
  },
  {
    name: "Sreejith E R",
    role: "Design Core Member",
    team: "Design Team",
    track: "UI/UX & Creative Systems",
    email: "sreejither2028@it.ajce.in",
    dept: "IT",
    year: "2026",
    username: "sreejith-e-r",
  },
  {
    name: "Bazil Salim",
    role: "Event Operations Lead",
    team: "Event Management Team",
    track: "Event Management & Operations",
    email: "bazilsalim2028@it.ajce.in",
    dept: "IT",
    year: "2026",
    username: "bazil-salim",
  },
  {
    name: "LAYEL K MANOJ",
    role: "Event Operations Member",
    team: "Event Management Team",
    track: "Event Management & Operations",
    email: "layelkmanoj2028@cs.ajce.in",
    dept: "CSE",
    year: "2026",
    username: "layel-k-manoj",
  },
  {
    name: "Amritha Jayakrishnan",
    role: "Event Operations Member",
    team: "Event Management Team",
    track: "Event Management & Operations",
    email: "amrithajayakrishnan05@gmail.com",
    dept: "CSE",
    year: "2026",
    username: "amritha-jayakrishnan",
  },
  {
    name: "Jophit Sebastian",
    role: "Event Operations Member",
    team: "Event Management Team",
    track: "Event Management & Operations",
    email: "jophitsebastian2027@ec.ajce.in",
    dept: "ECE",
    year: "2026",
    username: "jophit-sebastian",
  },
  {
    name: "Sanjo K Siby",
    role: "Web Architecture Lead",
    team: "Web Team",
    track: "Full Stack & Web Architecture",
    email: "sanjoksiby0@gmail.com",
    dept: "CSE",
    year: "2026",
    username: "sanjo-k-siby",
  },
  {
    name: "Abin Varghese",
    role: "Web Architecture Member",
    team: "Web Team",
    track: "Full Stack & Web Architecture",
    email: "abinvarghese092005@gmail.com",
    dept: "CSE",
    year: "2026",
    username: "abin-varghese",
  },
  {
    name: "Rudra Pratap Singh",
    role: "Web Architecture Member",
    team: "Web Team",
    track: "Full Stack & Web Architecture",
    email: "singh.pratap.rudra.dev@gmail.com",
    dept: "CSE",
    year: "2026",
    username: "rudra-pratap-singh",
  },
  {
    name: "Rinil Johns",
    role: "Media Lead",
    team: "Media Team",
    track: "Media & Visual Production",
    email: "trinil31johns@gmail.com",
    dept: "CSE",
    year: "2026",
    username: "rinil-johns",
  },
  {
    name: "Pranav Madhu",
    role: "Media Core Member",
    team: "Media Team",
    track: "Media & Visual Production",
    email: "Pranavmadhu1818@gmail.com",
    dept: "CSE",
    year: "2026",
    username: "pranav-madhu",
  },
  {
    name: "Nikhil Denniss Baby",
    role: "Marketing Lead",
    team: "Marketing Team",
    track: "Marketing & Growth Systems",
    email: "nikhilcl1221@gmail.com",
    dept: "CSE",
    year: "2026",
    username: "nikhil-denniss-baby",
  },
  {
    name: "Joyel Shaji",
    role: "Marketing Core Member",
    team: "Marketing Team",
    track: "Marketing & Growth Systems",
    email: "joyelshajim@gmail.com",
    dept: "CSE",
    year: "2026",
    username: "joyel-shaji",
  },
  {
    name: "Edwin George Shaji",
    role: "Marketing Core Member",
    team: "Marketing Team",
    track: "Marketing & Growth Systems",
    email: "edwingeorgeshajipadiyanickal@gmail.com",
    dept: "CSE",
    year: "2026",
    username: "edwin-george-shaji",
  },
  {
    name: "Anjalo Varghese",
    role: "Cloud Infrastructure Lead",
    team: "Cloud Team",
    track: "Cloud & DevOps Infrastructure",
    email: "anjalovarghese5@gmail.com",
    dept: "CSE",
    year: "2026",
    username: "anjalo-varghese",
  },
  {
    name: "Neeva Sunish Mathew",
    role: "Cloud Core Member",
    team: "Cloud Team",
    track: "Cloud & DevOps Infrastructure",
    email: "neevasunishmathew2027@mca.ajce.in",
    dept: "MCA",
    year: "2026",
    username: "neeva-sunish-mathew",
  },
];

// ─── 2024-25 Alumni Cohort ─────────────────────────────────────────────────
export const GDG_ALUMNI_2026: ExecomMember[] = [];
export const GDG_ALUMNI_2025: ExecomMember[] = [];

// ─── 2023-24 Founding & Previous Alumni Cohort ─────────────────────────────
export const GDG_ALUMNI_2024: ExecomMember[] = [];

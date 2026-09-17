export const ADMIN_EMAILS = [
  "dsc@amaljyothi.ac.in",
  "vinayakprakash2026@cs.ajce.in",
  "abinvarghese092005@gmail.com",
  "abinvarghese2026@cs.ajce.in",
];

export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
};

export const GDG_CONFIG = {
  name: "Google Developer Groups on Campus",
  shortName: "GDG AJCE",
  chapterName: "GDG AJCE",
  collegeName: "Amal Jyothi College of Engineering",
  tagline: "Empowering students with cutting-edge Google technologies.",
  mission: "Empowering students with cutting-edge Google technologies (AI/ML, Gemini, Cloud, Android, Web, and Open Source).",
  description: "Official Google Developer Groups on Campus chapter at Amal Jyothi College of Engineering. Empowering students with cutting-edge Google technologies (AI/ML, Gemini, Cloud, Android, Web, and Open Source).",
  socials: {
    github: "https://github.com/gdg",
    linkedin: "https://linkedin.com/company/gdg",
    twitter: "https://twitter.com/GoogleDevs",
    instagram: "https://instagram.com/googlefordevs",
    discord: "https://discord.gg/gdg",
    youtube: "https://youtube.com/@GoogleDevelopers",
  },
  colors: {
    blue: "#4285F4",
    red: "#EA4335",
    yellow: "#FBBC04",
    green: "#34A853",
  },
  tracks: [
    {
      id: "ai-ml",
      title: "AI & Machine Learning",
      icon: "Sparkles",
      color: "#4285F4",
      description: "Gemini, TensorFlow, JAX, and Generative AI applications shaping intelligent systems.",
      badge: "AI LAB",
    },
    {
      id: "cloud",
      title: "Cloud & DevOps",
      icon: "Cloud",
      color: "#EA4335",
      description: "Google Cloud Platform, Kubernetes, serverless microservices, and high-scale architecture.",
      badge: "GCP LAB",
    },
    {
      id: "web-mobile",
      title: "Web & Android",
      icon: "Smartphone",
      color: "#34A853",
      description: "Modern web with Next.js & Chrome, Kotlin, Flutter, and cutting-edge mobile apps.",
      badge: "DEV LAB",
    },
    {
      id: "open-source",
      title: "Open Source & Security",
      icon: "Shield",
      color: "#FBBC04",
      description: "Collaborative building, Git workflows, community projects, and robust modern cyber defense.",
      badge: "CORE LAB",
    },
  ],
};

import type { MetadataRoute } from "next";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gdgajce.vercel.app";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/programs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/programs/ongoing`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/programs/past`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/newsletter`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/execom`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  let programRoutes: MetadataRoute.Sitemap = [];
  let teamRoutes: MetadataRoute.Sitemap = [];
  let newsletterRoutes: MetadataRoute.Sitemap = [];

  try {
    const eventsSnap = await getDocs(query(collection(db, "events")));
    programRoutes = eventsSnap.docs
      .filter((doc) => !doc.data().isHidden)
      .map((doc) => {
        const data = doc.data();
        const slug = data.slug || doc.id;
        return {
          url: `${baseUrl}/programs/${slug}`,
          lastModified: data.updatedAt?.toDate() || new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        };
      });
  } catch (err) {
    console.warn("Could not fetch events for sitemap:", err);
  }

  try {
    const profilesSnap = await getDocs(collection(db, "coreProfiles"));
    teamRoutes = profilesSnap.docs.map((doc) => {
      const data = doc.data();
      const username = data.username || doc.id;
      return {
        url: `${baseUrl}/team/${username}`,
        lastModified: data.updatedAt?.toDate() || new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.5,
      };
    });
  } catch (err) {
    console.warn("Could not fetch team profiles for sitemap:", err);
  }

  try {
    const newslettersSnap = await getDocs(
      query(collection(db, "newsletters"), where("status", "==", "sent"))
    );
    newsletterRoutes = newslettersSnap.docs.map((doc) => {
      const data = doc.data();
      const slug = data.slug || doc.id;
      return {
        url: `${baseUrl}/newsletter/${slug}`,
        lastModified: data.sentAt?.toDate?.() || new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      };
    });
  } catch (err) {
    console.warn("Could not fetch newsletters for sitemap:", err);
  }

  return [...staticRoutes, ...programRoutes, ...teamRoutes, ...newsletterRoutes];
}

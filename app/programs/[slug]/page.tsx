import type { Metadata } from "next";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProgramDetailPage from "./ProgramDetailPage";

type Props = {
  params: Promise<{ slug: string }>;
};

async function getEventData(slug: string) {
  try {
    const eventsRef = collection(db, "events");
    const q = query(eventsRef, where("slug", "==", slug));
    const querySnap = await getDocs(q);

    if (!querySnap.empty) {
      const docSnap = querySnap.docs[0];
      return docSnap.data();
    }

    const docRef = doc(db, "events", slug);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }

    return null;
  } catch (error) {
    console.error("Error fetching event for metadata:", error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const eventData = await getEventData(slug);

  if (!eventData) {
    return {
      title: "Event Not Found | GDG",
      description: "The requested event could not be found.",
    };
  }

  const title = `${eventData.title} | GDG`;
  const description = eventData.tagline || eventData.description?.substring(0, 160) || "Join us for this exciting Google developer event!";

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gdgajce.vercel.app";
  let posterApiUrl = `${siteUrl}/api/og/${slug}`;

  if (eventData.posterUrl && eventData.posterUrl.startsWith('http')) {
    posterApiUrl = eventData.posterUrl;
  }

  return {
    title,
    description,
    openGraph: {
      title: eventData.title,
      description,
      type: "website",
      siteName: "Google Developer Groups",
      url: `${siteUrl}/programs/${slug}`,
      images: [
        {
          url: posterApiUrl,
          width: 1200,
          height: 630,
          alt: eventData.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: eventData.title,
      description,
      images: [posterApiUrl],
    },
  };
}

export default function Page({ params }: Props) {
  return <ProgramDetailPage params={params} />;
}

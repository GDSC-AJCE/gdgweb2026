import type { Metadata } from "next";
import { collection, query, where, getDocs, doc, getDoc, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import TeamMemberClient from "./TeamMemberClient";

type Props = {
    params: Promise<{ username: string }>;
};

async function getProfileData(username: string) {
    try {
        const q = query(
            collection(db, "coreProfiles"),
            where("username", "==", username.toLowerCase().trim()),
            limit(1)
        );
        const querySnap = await getDocs(q);

        if (!querySnap.empty) {
            return querySnap.docs[0].data();
        }

        const directDocRef = doc(db, "coreProfiles", username);
        const directDocSnap = await getDoc(directDocRef);
        if (directDocSnap.exists()) {
            return directDocSnap.data();
        }

        return null;
    } catch (error) {
        console.error("Error fetching profile for metadata:", error);
        return null;
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { username } = await params;
    const profile = await getProfileData(username);

    if (!profile) {
        return {
            title: "Organizer Profile Not Found",
            description: "The requested GDG organizer profile could not be found.",
        };
    }

    const title = `${profile.displayName} (@${profile.username || username}) | GDG Lead & Core Team`;
    const description = profile.bio?.substring(0, 160) || `View ${profile.displayName}'s official profile on Google Developer Groups.`;
    const imageUrl = profile.avatarUrl || "/logo.svg";

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "profile",
            url: `https://gdg.community.dev/team/${username}`,
            images: [
                {
                    url: imageUrl,
                    width: 400,
                    height: 400,
                    alt: profile.displayName,
                },
            ],
        },
        twitter: {
            card: "summary",
            title,
            description,
            images: [imageUrl],
        },
    };
}

export default async function Page({ params }: Props) {
    const { username } = await params;
    return <TeamMemberClient username={username} />;
}

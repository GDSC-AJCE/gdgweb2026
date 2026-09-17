import { NextRequest, NextResponse } from "next/server";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, token } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const subscribersRef = collection(db, "newsletter_subscribers");
    const q = query(subscribersRef, where("email", "==", normalizedEmail));
    const snap = await getDocs(q);

    if (snap.empty) {
      return NextResponse.json({ error: "Subscriber not found." }, { status: 404 });
    }

    const docSnapshot = snap.docs[0];
    const data = docSnapshot.data();

    // Verify token if present in DB
    if (data.unsubscribeToken && token && data.unsubscribeToken !== token) {
      return NextResponse.json({ error: "Invalid unsubscribe security token." }, { status: 403 });
    }

    await updateDoc(doc(db, "newsletter_subscribers", docSnapshot.id), {
      status: "unsubscribed",
      unsubscribedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "You have been successfully unsubscribed from GDG Tech Pulse.",
    });
  } catch (err: any) {
    console.error("[newsletter-unsubscribe]", err);
    return NextResponse.json({ error: err.message || "Failed to process unsubscribe request" }, { status: 500 });
  }
}

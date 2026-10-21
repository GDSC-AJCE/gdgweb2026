import { NextRequest, NextResponse } from "next/server";
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { nanoid } from "nanoid";
import { renderWelcomeEmailHtml } from "@/lib/newsletter";
import { getResendConfig, dispatchResendEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name = "Developer", topics = ["All Technical Domains"], source = "web" } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const unsubscribeToken = nanoid(32);

    const subscribersRef = collection(db, "newsletter_subscribers");
    const q = query(subscribersRef, where("email", "==", normalizedEmail));
    const existing = await getDocs(q);

    let isReactivation = false;
    let subscriberId = "";

    if (!existing.empty) {
      const existingDoc = existing.docs[0];
      subscriberId = existingDoc.id;
      const data = existingDoc.data();

      if (data.status === "active") {
        return NextResponse.json({
          success: true,
          message: "You're already subscribed to GDG Tech Pulse!",
          alreadySubscribed: true,
        });
      }

      await updateDoc(doc(db, "newsletter_subscribers", subscriberId), {
        status: "active",
        topics,
        reactivatedAt: new Date().toISOString(),
        unsubscribeToken,
      });
      isReactivation = true;
    } else {
      const newSub = {
        email: normalizedEmail,
        name: name.trim() || "Developer",
        status: "active",
        subscribedAt: new Date().toISOString(),
        topics,
        source,
        unsubscribeToken,
      };

      const docRef = await addDoc(subscribersRef, newSub);
      subscriberId = docRef.id;
    }

    // Attempt to dispatch Welcome Email via Resend
    const origin = req.headers.get("origin") || req.nextUrl.origin || process.env.NEXT_PUBLIC_SITE_URL || "https://gdgajce.vercel.app";
    const unsubscribeUrl = `${origin}/newsletter/unsubscribe?token=${unsubscribeToken}&email=${encodeURIComponent(normalizedEmail)}`;
    const { html: emailHtml, text: emailText } = renderWelcomeEmailHtml(name, unsubscribeUrl);

    let emailSent = false;
    const resendCfg = getResendConfig(req.cookies);

    if (resendCfg.configured && resendCfg.apiKey) {
      try {
        await dispatchResendEmail({
          apiKey: resendCfg.apiKey,
          from: resendCfg.from || `"GDG Tech Pulse" <onboarding@resend.dev>`,
          to: normalizedEmail,
          subject: "Welcome to GDG Tech Pulse! 🚀 (GDG AJCE)",
          html: emailHtml,
          text: emailText,
        });
        emailSent = true;
      } catch (mailErr) {
        console.warn("[newsletter-welcome-email] Failed to send via Resend:", mailErr);
      }
    } else {
      console.log(`[newsletter] Resend not configured. Welcome email queued for ${normalizedEmail}.`);
    }

    return NextResponse.json({
      success: true,
      message: isReactivation
        ? "Welcome back! Your subscription to GDG Tech Pulse has been reactivated."
        : "You're subscribed! Welcome to GDG Tech Pulse.",
      subscriberId,
      emailSent,
    });
  } catch (err: any) {
    console.error("[newsletter-subscribe with Resend]", err);
    return NextResponse.json({ error: err.message || "Failed to process newsletter subscription" }, { status: 500 });
  }
}

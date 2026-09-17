import { NextRequest, NextResponse } from "next/server";
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import nodemailer from "nodemailer";
import { nanoid } from "nanoid";
import { renderWelcomeEmailHtml } from "@/lib/newsletter";

const COOKIE_NAME = "gdg_smtp_cfg";

function getSmtpConfig(req: NextRequest) {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      secure: process.env.SMTP_SECURE === "true",
    };
  }

  const raw = req.cookies.get(COOKIE_NAME)?.value;
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name = "", topics = ["ai_ml", "cloud", "web_android", "open_source", "campus"], source = "website" } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const subscribersRef = collection(db, "newsletter_subscribers");
    const q = query(subscribersRef, where("email", "==", normalizedEmail));
    const snap = await getDocs(q);

    let unsubscribeToken = nanoid(24);
    let subscriberId = "";
    let isReactivation = false;

    if (!snap.empty) {
      const existingDoc = snap.docs[0];
      subscriberId = existingDoc.id;
      const data = existingDoc.data();
      unsubscribeToken = data.unsubscribeToken || unsubscribeToken;

      if (data.status === "active") {
        return NextResponse.json({
          success: true,
          alreadySubscribed: true,
          message: "You are already actively subscribed to GDG Tech Pulse!",
        });
      }

      // Reactivate subscriber
      isReactivation = true;
      await updateDoc(doc(db, "newsletter_subscribers", subscriberId), {
        status: "active",
        resubscribedAt: new Date().toISOString(),
        topics: topics.length > 0 ? topics : (data.topics || []),
        unsubscribeToken,
      });
    } else {
      // Create new subscription record
      const newSub = {
        email: normalizedEmail,
        name: name.trim() || normalizedEmail.split("@")[0],
        status: "active",
        subscribedAt: new Date().toISOString(),
        topics,
        source,
        unsubscribeToken,
      };

      const docRef = await addDoc(subscribersRef, newSub);
      subscriberId = docRef.id;
    }

    // Attempt to dispatch Welcome Email via SMTP
    const origin = req.headers.get("origin") || req.nextUrl.origin || process.env.NEXT_PUBLIC_SITE_URL || "https://gdgajce.vercel.app";
    const unsubscribeUrl = `${origin}/newsletter/unsubscribe?token=${unsubscribeToken}&email=${encodeURIComponent(normalizedEmail)}`;
    const { html: emailHtml, text: emailText } = renderWelcomeEmailHtml(name, unsubscribeUrl);

    let emailSent = false;
    const smtpCfg = getSmtpConfig(req);

    if (smtpCfg && smtpCfg.host && smtpCfg.user && smtpCfg.pass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpCfg.host,
          port: smtpCfg.port || 587,
          secure: smtpCfg.secure ?? false,
          auth: { user: smtpCfg.user, pass: smtpCfg.pass },
        });

        await transporter.sendMail({
          from: smtpCfg.from || `"GDG Tech Pulse" <${smtpCfg.user}>`,
          to: normalizedEmail,
          subject: "Welcome to GDG Tech Pulse! 🚀 (GDG AJCE)",
          html: emailHtml,
          text: emailText,
        });
        emailSent = true;
      } catch (mailErr) {
        console.warn("[newsletter-welcome-email] Failed to send via SMTP:", mailErr);
      }
    } else {
      console.log(`[newsletter] SMTP not configured. Welcome email queued for ${normalizedEmail}.`);
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
    console.error("[newsletter-subscribe]", err);
    return NextResponse.json({ error: err.message || "Failed to process newsletter subscription" }, { status: 500 });
  }
}

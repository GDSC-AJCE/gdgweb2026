import { NextRequest, NextResponse } from "next/server";
import { collection, query, where, getDocs, orderBy, limit, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const secret = req.nextUrl.searchParams.get("secret");
    const expectedSecret = process.env.CRON_SECRET || "gdg_cron_weekly_secret";

    if (authHeader !== `Bearer ${expectedSecret}` && secret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
    }

    // Check for pending scheduled or draft newsletters
    const newslettersRef = collection(db, "newsletters");
    const q = query(newslettersRef, where("status", "==", "scheduled"), limit(1));
    const snap = await getDocs(q);

    if (snap.empty) {
      return NextResponse.json({
        message: "No scheduled newsletter pending dispatch.",
        status: "idle",
      });
    }

    const scheduledIssue = snap.docs[0];
    const issueData = scheduledIssue.data();

    // Call internal send endpoint or execute send
    const origin = req.nextUrl.origin;
    const sendRes = await fetch(`${origin}/api/newsletter/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newsletterId: scheduledIssue.id }),
    });

    const sendResult = await sendRes.json();

    return NextResponse.json({
      success: true,
      action: "dispatched_scheduled_newsletter",
      newsletterId: scheduledIssue.id,
      title: issueData.title,
      sendResult,
    });
  } catch (err: any) {
    console.error("[newsletter-cron]", err);
    return NextResponse.json({ error: err.message || "Failed to execute newsletter cron" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { renderNewsletterEmailHtml, NewsletterIssue } from "@/lib/newsletter";
import { getResendConfig, dispatchResendEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { newsletterId, issueData, testEmail } = body;

    let issue: NewsletterIssue;

    if (newsletterId) {
      const issueSnap = await getDoc(doc(db, "newsletters", newsletterId));
      if (!issueSnap.exists()) {
        return NextResponse.json({ error: "Newsletter issue not found." }, { status: 404 });
      }
      issue = { id: issueSnap.id, ...(issueSnap.data() as any) };
    } else if (issueData) {
      issue = issueData;
    } else {
      return NextResponse.json({ error: "Missing newsletterId or issueData." }, { status: 400 });
    }

    const resendCfg = getResendConfig(req.cookies);
    if (!resendCfg.configured || !resendCfg.apiKey) {
      return NextResponse.json(
        { error: "Resend credentials not configured. Please add RESEND_API_KEY to your .env or configure it in chapter settings." },
        { status: 400 }
      );
    }

    const origin = req.headers.get("origin") || req.nextUrl.origin || process.env.NEXT_PUBLIC_SITE_URL || "https://gdgajce.vercel.app";
    const fromAddress = resendCfg.from || `"GDG Tech Pulse" <onboarding@resend.dev>`;

    // 1. If testEmail is specified, send single test email and exit
    if (testEmail) {
      const testUnsubUrl = `${origin}/newsletter/unsubscribe?token=test_token&email=${encodeURIComponent(testEmail)}`;
      const { html, text } = renderNewsletterEmailHtml(issue, "Test Admin", testUnsubUrl);

      await dispatchResendEmail({
        apiKey: resendCfg.apiKey,
        from: fromAddress,
        to: testEmail,
        subject: `[TEST] ${issue.title}`,
        html,
        text,
      });

      return NextResponse.json({
        success: true,
        testMode: true,
        sentTo: testEmail,
        message: `Test email dispatched successfully to ${testEmail} via Resend!`,
      });
    }

    // 2. Fetch all active subscribers from Firestore
    const subscribersRef = collection(db, "newsletter_subscribers");
    const q = query(subscribersRef, where("status", "==", "active"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json({
        error: "No active subscribers found. Subscribe some emails before dispatching.",
      }, { status: 400 });
    }

    const subscribers = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as { id: string; email: string; name?: string; unsubscribeToken?: string }[];

    let successCount = 0;
    let failedCount = 0;
    const errors: { email: string; reason: string }[] = [];

    // Send in concurrent chunks of 5
    const CHUNK_SIZE = 5;
    for (let i = 0; i < subscribers.length; i += CHUNK_SIZE) {
      const chunk = subscribers.slice(i, i + CHUNK_SIZE);
      const promises = chunk.map(async (sub) => {
        try {
          const unsubUrl = `${origin}/newsletter/unsubscribe?token=${sub.unsubscribeToken || ""}&email=${encodeURIComponent(sub.email)}`;
          const { html, text } = renderNewsletterEmailHtml(issue, sub.name, unsubUrl);

          await dispatchResendEmail({
            apiKey: resendCfg.apiKey!,
            from: fromAddress,
            to: sub.email,
            subject: issue.title,
            html,
            text,
          });
          successCount++;
        } catch (err: any) {
          failedCount++;
          errors.push({ email: sub.email, reason: err.message || "Unknown delivery error" });
        }
      });

      await Promise.allSettled(promises);
    }

    // If newsletter exists in Firestore, update status to 'sent'
    if (newsletterId) {
      await updateDoc(doc(db, "newsletters", newsletterId), {
        status: "sent",
        sentAt: new Date().toISOString(),
        recipientCount: successCount,
      });
    }

    return NextResponse.json({
      success: true,
      provider: "resend",
      totalAttempted: subscribers.length,
      delivered: successCount,
      failed: failedCount,
      errors: errors.slice(0, 10),
      message: `Broadcast complete! Successfully delivered to ${successCount} subscriber${successCount === 1 ? "" : "s"}.`,
    });
  } catch (err: any) {
    console.error("[newsletter-send with Resend]", err);
    return NextResponse.json({ error: err.message || "Failed to dispatch newsletter" }, { status: 500 });
  }
}

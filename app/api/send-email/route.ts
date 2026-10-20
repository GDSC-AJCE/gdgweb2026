import { NextRequest, NextResponse } from "next/server";
import { 
    getResendConfig, 
    dispatchResendEmail, 
    renderEmailWithEmailMd 
} from "@/lib/resend";

interface Recipient {
    name: string;
    email: string;
}

interface SendEmailBody {
    recipients: Recipient[];
    subject: string;
    markdownBody: string;
    apiKey?: string;
    from?: string;
}

export async function POST(req: NextRequest) {
    try {
        const body: SendEmailBody = await req.json();
        const { recipients, subject, markdownBody } = body;

        const config = getResendConfig(req.cookies);
        const activeApiKey = body.apiKey || config.apiKey;
        const activeFrom = body.from || config.from;

        if (!activeApiKey) {
            return NextResponse.json(
                { 
                    error: "Resend is not configured. Please add RESEND_API_KEY to your .env or configure it in the Email Setup modal.",
                    needsSetup: true 
                },
                { status: 400 }
            );
        }

        if (!recipients?.length) {
            return NextResponse.json({ error: "No recipients provided." }, { status: 400 });
        }
        if (!subject?.trim()) {
            return NextResponse.json({ error: "Subject is required." }, { status: 400 });
        }
        if (!markdownBody?.trim()) {
            return NextResponse.json({ error: "Email body is required." }, { status: 400 });
        }

        const results = await Promise.allSettled(
            recipients.map(async (r) => {
                const personalizedBody = markdownBody.replace(/\{\{name\}\}/g, r.name || "Member");
                const { html, text } = renderEmailWithEmailMd(personalizedBody);
                const personalizedSubject = subject.replace(/\{\{name\}\}/g, r.name || "Member");

                return dispatchResendEmail({
                    apiKey: activeApiKey,
                    from: activeFrom,
                    to: r.email,
                    subject: personalizedSubject,
                    html,
                    text,
                });
            })
        );

        const failed = results
            .map((r, i) => ({ r, recipient: recipients[i] }))
            .filter(({ r }) => r.status === "rejected")
            .map(({ r, recipient }) => ({
                email: recipient.email,
                reason: (r as PromiseRejectedResult).reason?.message ?? "Delivery failed",
            }));

        const sentCount = results.filter((r) => r.status === "fulfilled").length;

        return NextResponse.json({
            success: true,
            provider: "resend",
            sent: sentCount,
            failed: failed.length,
            failedRecipients: failed,
        });

    } catch (err: any) {
        console.error("[send-email with Resend]", err);
        return NextResponse.json({ error: err.message ?? "Internal server error" }, { status: 500 });
    }
}

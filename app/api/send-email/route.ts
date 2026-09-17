import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { marked } from "marked";

const COOKIE_NAME = "gdg_smtp_cfg";

interface SmtpConfig {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
    secure: boolean;
}

interface Recipient {
    name: string;
    email: string;
}

interface SendEmailBody {
    recipients: Recipient[];
    subject: string;
    markdownBody: string;
}

function renderEmailTemplate(markdown: string): { html: string; text: string } {
    const rawHtml = marked.parse(markdown, { gfm: true, breaks: true }) as string;

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8f9fa;
      margin: 0;
      padding: 32px 16px;
      color: #202124;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #dadce0;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(60,64,67,0.1);
    }
    .header {
      padding: 24px 32px;
      background: #ffffff;
      border-bottom: 1px solid #f1f3f4;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .header-bar {
      height: 4px;
      width: 100%;
      background: linear-gradient(90deg, #4285F4 25%, #EA4335 25% 50%, #FBBC04 50% 75%, #34A853 75%);
    }
    .content {
      padding: 32px;
    }
    .content h1 {
      font-size: 24px;
      font-weight: 700;
      color: #202124;
      margin-top: 0;
    }
    .content h2 {
      font-size: 18px;
      font-weight: 600;
      color: #202124;
      margin-top: 24px;
    }
    .content p {
      font-size: 15px;
      color: #3c4043;
      margin: 16px 0;
    }
    .content a {
      color: #1a73e8;
      text-decoration: none;
    }
    .content blockquote {
      margin: 16px 0;
      padding: 12px 16px;
      border-left: 4px solid #4285F4;
      background: #f8f9fa;
      color: #5f6368;
      border-radius: 0 8px 8px 0;
    }
    .footer {
      padding: 24px 32px;
      background: #f8f9fa;
      border-top: 1px solid #f1f3f4;
      font-size: 12px;
      color: #70757a;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-bar"></div>
    <div class="content">
      ${rawHtml}
    </div>
    <div class="footer">
      <p style="margin: 0;">Google Developer Groups (GDG) Community</p>
      <p style="margin: 4px 0 0 0; color: #9aa0a6;">Building a collaborative ecosystem for developers, innovators, and creators.</p>
    </div>
  </div>
</body>
</html>
`;

    const text = markdown.replace(/[#*`>_~\[\]]/g, "");
    return { html: emailHtml, text };
}

export async function POST(req: NextRequest) {
    try {
        const body: SendEmailBody = await req.json();
        const { recipients, subject, markdownBody } = body;

        let cfg: SmtpConfig | null = null;

        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            cfg = {
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || "587"),
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
                from: process.env.SMTP_FROM || process.env.SMTP_USER,
                secure: process.env.SMTP_SECURE === "true",
            };
        } else {
            const raw = req.cookies.get(COOKIE_NAME)?.value;
            if (raw) {
                try {
                    cfg = JSON.parse(raw);
                } catch {
                    return NextResponse.json({ error: "Corrupted SMTP config cookie." }, { status: 400 });
                }
            }
        }

        if (!cfg || !cfg.host || !cfg.user || !cfg.pass) {
            return NextResponse.json(
                { error: "SMTP not configured. Configure SMTP credentials in settings or environment variables." },
                { status: 400 }
            );
        }

        if (!recipients?.length) return NextResponse.json({ error: "No recipients provided." }, { status: 400 });
        if (!subject?.trim()) return NextResponse.json({ error: "Subject is required." }, { status: 400 });
        if (!markdownBody?.trim()) return NextResponse.json({ error: "Email body is required." }, { status: 400 });

        const transporter = nodemailer.createTransport({
            host: cfg.host,
            port: cfg.port || 587,
            secure: cfg.secure ?? false,
            auth: { user: cfg.user, pass: cfg.pass },
        });

        const fromAddress = cfg.from || `"Google Developer Groups" <${cfg.user}>`;

        const results = await Promise.allSettled(
            recipients.map((r) => {
                const personalizedBody = markdownBody.replace(/\{\{name\}\}/g, r.name);
                const { html: emailHtml, text: emailText } = renderEmailTemplate(personalizedBody);

                return transporter.sendMail({
                    from: fromAddress,
                    to: r.email,
                    subject: subject.replace(/\{\{name\}\}/g, r.name),
                    html: emailHtml,
                    text: emailText,
                });
            })
        );

        const failed = results
            .map((r, i) => ({ r, recipient: recipients[i] }))
            .filter(({ r }) => r.status === "rejected")
            .map(({ r, recipient }) => ({
                email: recipient.email,
                reason: (r as PromiseRejectedResult).reason?.message ?? "Unknown",
            }));

        return NextResponse.json({
            success: true,
            sent: results.filter((r) => r.status === "fulfilled").length,
            failed: failed.length,
            failedRecipients: failed,
        });

    } catch (err: any) {
        console.error("[send-email]", err);
        return NextResponse.json({ error: err.message ?? "Internal server error" }, { status: 500 });
    }
}

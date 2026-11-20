import { NextRequest, NextResponse } from "next/server";
import {
  getMailConfig,
  renderTemplateToHtml,
  sendViaAppsScriptGateway,
  getTransporter,
} from "@/lib/mailer";
import { resolveTemplateSource } from "@/lib/mail-template-source";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const config = getMailConfig();
    const body = await req.json();
    const {
      toEmail,
      templateContent,
      templateName,
      subject,
      senderName,
      appPassword,
      gatewayUrl,
      gatewayApiKey,
      whatsappLink: testWhatsappLink,
      whatsapp_link: testWhatsappLinkSnake,
    } = body;

    if (!toEmail) {
      return NextResponse.json(
        { success: false, error: "Recipient email is required." },
        { status: 400 }
      );
    }

    const activeGatewayUrl = (gatewayUrl || config.gatewayUrl || "").trim();
    const activeGatewayKey = (gatewayApiKey || config.gatewayApiKey || "gdgajce").trim();
    const sName = senderName || config.senderName || "GDG on Campus AJCE";
    const sSubj = subject ? `[TEST] ${subject}` : "[TEST] Update on your GDG on Campus AJCE Application";

    const resolvedTestWhatsapp =
      (testWhatsappLink || testWhatsappLinkSnake || "").trim() || "https://chat.whatsapp.com/gdgajce";

    const recipient = {
      NAME: "Test Recipient",
      name: "Test Recipient",
      MAIL: toEmail,
      email: toEmail,
      TEAM: "Web Team",
      team: "Web Team",
      CATEGORY: "Web Team",
      category: "Web Team",
      DATE: new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      date: new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      TIME: "6:00 PM IST",
      time: "6:00 PM IST",
      TIME_SLOT: "6:00 PM IST",
      time_slot: "6:00 PM IST",
      WHATSAPP_LINK: resolvedTestWhatsapp,
      whatsapp_link: resolvedTestWhatsapp,
      MEET_LINK: "https://meet.google.com/gdg-ajce-demo",
      meet_link: "https://meet.google.com/gdg-ajce-demo",
    };

    const resolved = await resolveTemplateSource({ templateContent, templateName });
    if (!resolved.ok) {
      return NextResponse.json({ success: false, error: resolved.error }, { status: 400 });
    }
    const source = resolved.source;

    // If Gateway is configured, dispatch via Apps Script Web App
    if (activeGatewayUrl) {
      const html = await renderTemplateToHtml(source, recipient, true);
      const result = await sendViaAppsScriptGateway(activeGatewayUrl, {
        to: toEmail,
        subject: sSubj,
        html,
        name: sName,
        apiKey: activeGatewayKey,
      });

      return NextResponse.json({
        success: true,
        message: `Test email successfully sent to ${toEmail} via Apps Script Gateway! (Remaining quota: ${
          result.remainingDailyQuota ?? "OK"
        })`,
      });
    }

    // Fallback to Nodemailer SMTP
    const authConfig = {
      user: config.senderEmail,
      pass: appPassword || process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD,
    };

    const transporter = getTransporter(authConfig);
    const html = await renderTemplateToHtml(source, recipient, false);
    const sEmail = authConfig.user;

    await transporter.sendMail({
      from: `"${sName}" <${sEmail}>`,
      to: toEmail,
      subject: sSubj,
      html,
    });

    return NextResponse.json({
      success: true,
      message: `Test email successfully sent to ${toEmail} via SMTP!`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

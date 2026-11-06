import { NextRequest, NextResponse } from "next/server";
import {
  getMailConfig,
  getTemplateSource,
  renderTemplateToHtml,
  sendViaAppsScriptGateway,
  getTransporter,
} from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const config = getMailConfig();
    const body = await req.json();
    const {
      toEmail,
      templateContent,
      templateName,
      senderName,
      appPassword,
      gatewayUrl,
      gatewayApiKey,
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
    const sSubj = "[TEST] Update on your GDG on Campus AJCE Core Team Application";

    const recipient = {
      NAME: "Test Recipient",
      MAIL: toEmail,
      TEAM: "Sample Domain",
    };

    let source = templateContent || (templateName ? getTemplateSource(templateName) : null);
    if (!source) {
      source = `
        <div style="font-family: sans-serif; padding: 24px; color: #1e293b;">
          <h2>Hello {{name}},</h2>
          <p>This is a test email dispatched from GDG AJCE Mail Studio.</p>
        </div>
      `;
    }

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

import { NextRequest, NextResponse } from "next/server";
import { getMailConfig, updateMailConfig } from "@/lib/mailer";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const config = getMailConfig();
    const hasAppPassword = !!(process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD);
    const hasOAuth = !!(config.refreshToken && config.clientId);
    const hasGateway = !!config.gatewayUrl;

    let authMethod = "none";
    if (hasGateway) authMethod = "gateway";
    else if (hasAppPassword) authMethod = "app-password";
    else if (hasOAuth) authMethod = "oauth";

    return NextResponse.json({
      senderEmail: config.senderEmail,
      senderName: config.senderName,
      sheetId: config.sheetId,
      sheetName: config.sheetName,
      gatewayUrl: config.gatewayUrl,
      gatewayApiKey: config.gatewayApiKey,
      figmaAccessToken: config.figmaAccessToken ? "***configured***" : "",
      hasGateway,
      hasAppPassword,
      hasOAuth,
      authMethod,
      defaultSubject: config.defaultSubject,
      defaultDelay: config.defaultDelay,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      senderEmail,
      senderName,
      sheetId,
      sheetName,
      appPassword,
      gatewayUrl,
      gatewayApiKey,
      figmaAccessToken,
    } = body;

    const updates: any = {};
    if (senderEmail) updates.senderEmail = senderEmail.trim();
    if (senderName) updates.senderName = senderName.trim();
    if (sheetId) updates.sheetId = sheetId.trim();
    if (sheetName) updates.sheetName = sheetName.trim();
    if (gatewayUrl !== undefined) updates.gatewayUrl = gatewayUrl.trim();
    if (gatewayApiKey !== undefined) updates.gatewayApiKey = gatewayApiKey.trim();
    if (figmaAccessToken !== undefined) updates.figmaAccessToken = figmaAccessToken.trim();

    updateMailConfig(updates);

    // Also persist to .env.local if available
    try {
      const envPath = path.join(process.cwd(), ".env.local");
      if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, "utf8");
        const upsert = (content: string, key: string, val: string) => {
          const regex = new RegExp(`^${key}=.*$`, "m");
          if (regex.test(content)) return content.replace(regex, `${key}=${val}`);
          return content.trim() + `\n${key}=${val}\n`;
        };
        if (senderEmail) envContent = upsert(envContent, "GMAIL_USER", senderEmail.trim());
        if (senderName) envContent = upsert(envContent, "SENDER_NAME", senderName.trim());
        if (sheetId) envContent = upsert(envContent, "GOOGLE_SHEET_ID", sheetId.trim());
        if (sheetName) envContent = upsert(envContent, "GOOGLE_SHEET_NAME", sheetName.trim());
        if (gatewayUrl !== undefined) envContent = upsert(envContent, "APPS_SCRIPT_GATEWAY_URL", gatewayUrl.trim());
        if (gatewayApiKey !== undefined) envContent = upsert(envContent, "APPS_SCRIPT_API_KEY", gatewayApiKey.trim());
        if (figmaAccessToken !== undefined) envContent = upsert(envContent, "FIGMA_ACCESS_TOKEN", figmaAccessToken.trim());
        if (appPassword !== undefined) envContent = upsert(envContent, "GMAIL_APP_PASSWORD", appPassword.replace(/\s+/g, ""));
        fs.writeFileSync(envPath, envContent, "utf8");
      }
    } catch {}

    return NextResponse.json({ success: true, message: "Settings saved successfully!" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

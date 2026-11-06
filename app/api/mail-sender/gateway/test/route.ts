import { NextRequest, NextResponse } from "next/server";
import { getMailConfig } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const config = getMailConfig();
    const body = await req.json().catch(() => ({}));
    const gatewayUrl = (body.gatewayUrl || config.gatewayUrl || "").trim();
    const gatewayApiKey = (body.gatewayApiKey || config.gatewayApiKey || "gdgajce").trim();

    if (!gatewayUrl) {
      return NextResponse.json(
        { success: false, error: "No Apps Script Gateway URL provided." },
        { status: 400 }
      );
    }

    const fetchRes = await fetch(gatewayUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ping", apiKey: gatewayApiKey }),
      redirect: "follow",
    });
    const text = await fetchRes.text();

    if (text.includes("accounts.google.com") || text.includes("Sign in") || fetchRes.status === 401) {
      return NextResponse.json(
        {
          success: false,
          requiresAccessAnyone: true,
          error:
            'Google blocked the request (HTTP 401 - Sign-in required). In your Apps Script Deploy dialog, you must set "Who has access" to "Anyone" so the app can communicate with it.',
        },
        { status: 401 }
      );
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: `Gateway returned HTML instead of JSON (Status ${fetchRes.status}). Verify your Apps Script code handles doGet/doPost with ContentService.createTextOutput.`,
        },
        { status: 400 }
      );
    }

    if (data && data.success === false) {
      return NextResponse.json(
        {
          success: false,
          error: data.error || "Gateway returned an error.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      status: "online",
      remainingDailyQuota: data.remainingDailyQuota !== undefined ? data.remainingDailyQuota : 1500,
      message: "Gateway responded successfully!",
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

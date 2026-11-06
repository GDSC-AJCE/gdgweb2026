import { NextRequest, NextResponse } from "next/server";
import { fetchGoogleSheetTabs, extractCleanSheetId, getMailConfig } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const config = getMailConfig();
    const body = await req.json().catch(() => ({}));
    const targetSheetId = extractCleanSheetId(body.sheetId || config.sheetId || "");

    if (!targetSheetId) {
      return NextResponse.json(
        { success: false, error: "No Google Sheet link or ID provided." },
        { status: 400 }
      );
    }

    const tabs = await fetchGoogleSheetTabs(targetSheetId);
    if (tabs && tabs.length > 0) {
      return NextResponse.json({ success: true, sheetId: targetSheetId, tabs });
    }

    // Default fallback tabs
    return NextResponse.json({
      success: true,
      sheetId: targetSheetId,
      tabs: [
        { name: "Not Shortlisted", gid: "0" },
        { name: "Form Responses 1", gid: "0" },
      ],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

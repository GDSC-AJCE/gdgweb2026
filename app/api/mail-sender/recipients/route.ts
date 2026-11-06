import { NextRequest, NextResponse } from "next/server";
import {
  parseRFC4180CSV,
  extractRecipientsFromRows,
  extractCleanSheetId,
  extractGid,
  createOAuth2Client,
  getMailConfig,
} from "@/lib/mailer";
import { google } from "googleapis";

export async function POST(req: NextRequest) {
  try {
    const config = getMailConfig();
    const body = await req.json();
    const { sheetId, sheetName, gid, csvData } = body;

    // 1. Direct CSV/Excel text payload
    if (csvData) {
      const rows = parseRFC4180CSV(csvData);
      if (rows.length < 2) {
        return NextResponse.json(
          { success: false, error: "CSV must have a header row and at least 1 data row." },
          { status: 400 }
        );
      }
      const recipients = extractRecipientsFromRows(rows);
      return NextResponse.json({ success: true, source: "csv", recipients });
    }

    // 2. Google Sheet source
    const rawSheetInput = sheetId || config.sheetId || "";
    const targetSheetId = extractCleanSheetId(rawSheetInput);
    const targetGid = gid || extractGid(rawSheetInput);
    const targetSheetName = sheetName || config.sheetName || "Not Shortlisted";

    if (!targetSheetId) {
      return NextResponse.json(
        { success: false, error: "No Google Sheet ID provided." },
        { status: 400 }
      );
    }

    let rows: string[][] | null = null;

    // Strategy A: Try Google Sheets API with OAuth if available
    try {
      const auth = await createOAuth2Client();
      const sheets = google.sheets({ version: "v4", auth });
      const resp = await sheets.spreadsheets.values.get({
        spreadsheetId: targetSheetId,
        range: targetSheetName,
      });
      if (resp.data && resp.data.values) {
        rows = resp.data.values as string[][];
      }
    } catch (oauthErr) {
      // Continue to Strategy B
    }

    // Strategy B: Fetch via Google Sheets export endpoints (Works seamlessly with "Anyone with link: Viewer")
    if (!rows) {
      const candidateUrls = [
        targetGid
          ? `https://docs.google.com/spreadsheets/d/${targetSheetId}/export?format=csv&gid=${targetGid}`
          : null,
        targetGid
          ? `https://docs.google.com/spreadsheets/d/${targetSheetId}/gviz/tq?tqx=out:csv&gid=${targetGid}`
          : null,
        `https://docs.google.com/spreadsheets/d/${targetSheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(
          targetSheetName
        )}`,
        `https://docs.google.com/spreadsheets/d/${targetSheetId}/export?format=csv&sheet=${encodeURIComponent(
          targetSheetName
        )}`,
      ].filter(Boolean) as string[];

      for (const testUrl of candidateUrls) {
        try {
          const pubRes = await fetch(testUrl, { redirect: "follow" });
          if (pubRes.ok) {
            const csvText = await pubRes.text();
            if (
              csvText &&
              !csvText.includes("<!DOCTYPE html>") &&
              !csvText.includes("accounts.google.com")
            ) {
              const parsed = parseRFC4180CSV(csvText);
              if (parsed.length >= 2) {
                rows = parsed;
                break;
              }
            }
          }
        } catch {}
      }
    }

    if (!rows || rows.length < 2) {
      return NextResponse.json(
        {
          success: false,
          requiresAuth: true,
          error:
            `Could not fetch Google Sheet data.\n\nPlease verify:\n1. In your Google Sheet, click Share > set General Access to "Anyone with the link (Viewer)".\n2. Verify the sheet tab name matches "${targetSheetName}".`,
        },
        { status: 400 }
      );
    }

    const recipients = extractRecipientsFromRows(rows);
    return NextResponse.json({
      success: true,
      source: "sheet",
      sheetName: targetSheetName,
      recipients,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

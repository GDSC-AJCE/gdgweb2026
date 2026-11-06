import { NextRequest, NextResponse } from "next/server";
import { getTemplateSource, renderTemplateToHtml } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { templateContent, templateName, recipient = {} } = body;

    let source = templateContent || (templateName ? getTemplateSource(templateName) : null);

    if (!source) {
      source = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>Hello {{name}}!</h2>
          <p>This is a preview of your email for the {{team}} domain.</p>
        </div>
      `;
    }

    const sample = {
      NAME: recipient.name || recipient.NAME || "Rahul Sharma",
      MAIL: recipient.email || recipient.MAIL || "rahul@amaljyothi.ac.in",
      CATEGORY:
        recipient.category ||
        recipient.CATEGORY ||
        recipient.team ||
        recipient.TEAM ||
        "Web Team",
      TEAM:
        recipient.category ||
        recipient.CATEGORY ||
        recipient.team ||
        recipient.TEAM ||
        "Web Team",
      DATE: recipient.date || recipient.DATE || "November 9, 2026",
      TIME:
        recipient.time ||
        recipient.TIME ||
        recipient.time_slot ||
        recipient.TIME_SLOT ||
        "6:00 PM - 6:10 PM",
      TIME_SLOT:
        recipient.time ||
        recipient.TIME ||
        recipient.time_slot ||
        recipient.TIME_SLOT ||
        "6:00 PM - 6:10 PM",
      WHATSAPP_LINK:
        recipient.whatsapp_link ||
        recipient.WHATSAPP_LINK ||
        "https://chat.whatsapp.com/Ftflnf70DRrAXIhwWJQ2Bo?s=cl&p=a&mlu=4&ilr=4&iam=2",
      MEET_LINK:
        recipient.meet_link ||
        recipient.MEET_LINK ||
        "https://meet.google.com/djf-bgpu-stt",
    };

    const previewHtml = await renderTemplateToHtml(source, sample, true);
    return NextResponse.json({ success: true, html: previewHtml });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { getTemplateSource, renderTemplateToHtml } from "@/lib/mailer";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      templateContent,
      templateName,
      recipient = {},
      whatsappLink: bodyWhatsappLink,
      whatsapp_link: bodyWhatsappLinkSnake,
    } = body;

    let isDeleted = false;
    if (templateName) {
      try {
        const docSnap = await getDoc(doc(db, "mail_templates", templateName));
        if (docSnap.exists() && docSnap.data().deleted === true) {
          isDeleted = true;
        }
      } catch (fsErr) {}
    }

    let source: string | null =
      typeof templateContent === "string" && templateContent.trim().length > 0
        ? templateContent
        : null;

    if (!source && templateName && !isDeleted) {
      try {
        const docSnap = await getDoc(doc(db, "mail_templates", templateName));
        if (docSnap.exists() && docSnap.data().content) {
          source = docSnap.data().content;
        }
      } catch (fsErr) {
        console.warn("Firestore template lookup failed in preview:", fsErr);
      }
    }

    if (!source && templateName && !isDeleted) {
      source = getTemplateSource(templateName);
    }

    if (!source) {
      source = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>Hello {{name}}!</h2>
          <p>This is a preview of your email for the {{team}} domain.</p>
        </div>
      `;
    }

    const rawWhatsapp =
      recipient.whatsapp_link ||
      recipient.WHATSAPP_LINK ||
      recipient.whatsappLink ||
      recipient.whatsappUrl ||
      recipient.whatsappGroup ||
      recipient.whatsapp_group ||
      recipient.postRegistrationLink ||
      recipient.post_registration_link ||
      recipient.groupLink ||
      recipient.group_link ||
      recipient.eventWhatsapp ||
      recipient.event_whatsapp ||
      recipient.whatsapp ||
      recipient.WhatsApp ||
      bodyWhatsappLink ||
      bodyWhatsappLinkSnake ||
      "";
    const resolvedWhatsapp =
      rawWhatsapp && typeof rawWhatsapp === "string" && rawWhatsapp.trim().length > 0
        ? rawWhatsapp.trim()
        : "https://chat.whatsapp.com/gdgajce";

    const sample = {
      ...recipient,
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
      WHATSAPP_LINK: resolvedWhatsapp,
      MEET_LINK:
        recipient.meet_link ||
        recipient.MEET_LINK ||
        "https://meet.google.com/djf-bgpu-stt",
      name: recipient.name || recipient.NAME || "Rahul Sharma",
      email: recipient.email || recipient.MAIL || "rahul@amaljyothi.ac.in",
      category:
        recipient.category ||
        recipient.CATEGORY ||
        recipient.team ||
        recipient.TEAM ||
        "Web Team",
      team:
        recipient.category ||
        recipient.CATEGORY ||
        recipient.team ||
        recipient.TEAM ||
        "Web Team",
      date: recipient.date || recipient.DATE || "November 9, 2026",
      time:
        recipient.time ||
        recipient.TIME ||
        recipient.time_slot ||
        recipient.TIME_SLOT ||
        "6:00 PM - 6:10 PM",
      time_slot:
        recipient.time ||
        recipient.TIME ||
        recipient.time_slot ||
        recipient.TIME_SLOT ||
        "6:00 PM - 6:10 PM",
      whatsapp_link: resolvedWhatsapp,
      meet_link:
        recipient.meet_link ||
        recipient.MEET_LINK ||
        "https://meet.google.com/djf-bgpu-stt",
    };

    const previewHtml = await renderTemplateToHtml(source, sample, true);
    return NextResponse.json(
      { success: true, html: previewHtml },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

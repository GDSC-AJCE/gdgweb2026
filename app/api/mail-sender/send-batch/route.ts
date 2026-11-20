import { NextRequest } from "next/server";
import {
  getMailConfig,
  renderTemplateToHtml,
  sendViaAppsScriptGateway,
  getTransporter,
  markEmailAsSent,
  isBatchCancelled,
  resetBatchCancellation,
} from "@/lib/mailer";
import { resolveTemplateSource } from "@/lib/mail-template-source";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const config = getMailConfig();
    const body = await req.json();
    const {
      recipients = [],
      templateContent,
      templateName,
      subject,
      delay = 800,
      appPassword,
      senderName,
      gatewayUrl,
      gatewayApiKey,
      whatsappLink: batchWhatsappLink,
      whatsapp_link: batchWhatsappLinkSnake,
    } = body;

    if (!recipients.length) {
      return new Response(JSON.stringify({ error: "No recipients provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    resetBatchCancellation();

    const activeGatewayUrl = (gatewayUrl || config.gatewayUrl || "").trim();
    const activeGatewayKey = (gatewayApiKey || config.gatewayApiKey || "gdgajce").trim();
    const sName = senderName || config.senderName || "GDG on Campus AJCE";
    const sEmail = config.senderEmail;
    const emailSubject = subject || config.defaultSubject;

    const resolved = await resolveTemplateSource({ templateContent, templateName });
    if (!resolved.ok) {
      return new Response(JSON.stringify({ error: resolved.error }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const rawSource = resolved.source;

    let transporter: any = null;
    if (!activeGatewayUrl) {
      try {
        const authConfig = {
          user: sEmail,
          pass: appPassword || process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD,
        };
        transporter = getTransporter(authConfig);
        await transporter.verify();
      } catch (err: any) {
        return new Response(
          JSON.stringify({ error: "SMTP Authentication Failed: " + err.message }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        function sendEvent(type: string, data: any) {
          controller.enqueue(encoder.encode(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`));
        }

        let successCount = 0;
        let failCount = 0;

        sendEvent("start", {
          total: recipients.length,
          method: activeGatewayUrl ? "Google Apps Script Gateway" : "Nodemailer SMTP",
        });

        for (let i = 0; i < recipients.length; i++) {
          if (isBatchCancelled()) {
            sendEvent("cancelled", { message: "Sending stopped by user." });
            break;
          }

          const r = recipients[i];
          const recipientWhatsapp =
            r.whatsapp_link ||
            r.WHATSAPP_LINK ||
            r.whatsappLink ||
            r.whatsappUrl ||
            r.whatsappGroup ||
            r.whatsapp_group ||
            r.postRegistrationLink ||
            r.post_registration_link ||
            r.groupLink ||
            r.group_link ||
            r.eventWhatsapp ||
            r.event_whatsapp ||
            r.whatsapp ||
            r.WhatsApp ||
            batchWhatsappLink ||
            batchWhatsappLinkSnake ||
            "";

          const recipientData = {
            ...r,
            NAME: r.name || r.NAME || "Applicant",
            name: r.name || r.NAME || "Applicant",
            MAIL: r.email || r.MAIL || "",
            email: r.email || r.MAIL || "",
            CATEGORY: r.category || r.team || r.CATEGORY || r.TEAM || "",
            category: r.category || r.team || r.CATEGORY || r.TEAM || "",
            TEAM: r.category || r.team || r.CATEGORY || r.TEAM || "",
            team: r.category || r.team || r.CATEGORY || r.TEAM || "",
            DATE: r.date || r.DATE || "November 9, 2026",
            date: r.date || r.DATE || "November 9, 2026",
            TIME: r.time || r.time_slot || r.TIME || r.TIME_SLOT || "6:00 PM",
            time: r.time || r.time_slot || r.TIME || r.TIME_SLOT || "6:00 PM",
            TIME_SLOT: r.time || r.time_slot || r.TIME || r.TIME_SLOT || "6:00 PM",
            time_slot: r.time || r.time_slot || r.TIME || r.TIME_SLOT || "6:00 PM",
            MEET_LINK: r.meet_link || r.MEET_LINK || r.meetLink || "",
            meet_link: r.meet_link || r.MEET_LINK || r.meetLink || "",
            WHATSAPP_LINK: recipientWhatsapp || undefined,
            whatsapp_link: recipientWhatsapp || undefined,
          };

          try {
            if (activeGatewayUrl) {
              const html = await renderTemplateToHtml(rawSource, recipientData, true);
              await sendViaAppsScriptGateway(activeGatewayUrl, {
                to: r.email,
                subject: emailSubject,
                html,
                name: sName,
                apiKey: activeGatewayKey,
              });
            } else {
              const html = await renderTemplateToHtml(rawSource, recipientData, false);
              await transporter.sendMail({
                from: `"${sName}" <${sEmail}>`,
                to: r.email,
                subject: emailSubject,
                html,
              });
            }

            successCount++;

            if (config.sheetId && config.sheetName) {
              try {
                await markEmailAsSent(config.sheetId, config.sheetName, r.email);
              } catch {}
            }

            sendEvent("progress", {
              index: i + 1,
              total: recipients.length,
              success: true,
              recipient: r,
              successCount,
              failCount,
            });
          } catch (err: any) {
            failCount++;
            sendEvent("progress", {
              index: i + 1,
              total: recipients.length,
              success: false,
              recipient: r,
              error: err.message,
              successCount,
              failCount,
            });
          }

          if (i < recipients.length - 1 && !isBatchCancelled()) {
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }

        sendEvent("done", {
          total: recipients.length,
          successCount,
          failCount,
        });

        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

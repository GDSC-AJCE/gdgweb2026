import { NextRequest } from "next/server";
import {
  getMailConfig,
  getTemplateSource,
  renderTemplateToHtml,
  sendViaAppsScriptGateway,
  getTransporter,
  markEmailAsSent,
} from "@/lib/mailer";

// Shared state for cancellation
let isBatchCancelled = false;

export function cancelBatch() {
  isBatchCancelled = true;
}

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
    } = body;

    if (!recipients.length) {
      return new Response(JSON.stringify({ error: "No recipients provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    isBatchCancelled = false;

    const activeGatewayUrl = (gatewayUrl || config.gatewayUrl || "").trim();
    const activeGatewayKey = (gatewayApiKey || config.gatewayApiKey || "gdgajce").trim();
    const sName = senderName || config.senderName || "GDG on Campus AJCE";
    const sEmail = config.senderEmail;
    const emailSubject = subject || config.defaultSubject;

    let rawSource = templateContent || (templateName ? getTemplateSource(templateName) : null);
    if (!rawSource) {
      rawSource = `
        <div style="font-family: sans-serif; padding: 24px; color: #1e293b;">
          <h2>Hello {{name}},</h2>
          <p>Update regarding your application for {{team}} domain at GDG on Campus AJCE.</p>
        </div>
      `;
    }

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
          if (isBatchCancelled) {
            sendEvent("cancelled", { message: "Sending stopped by user." });
            break;
          }

          const r = recipients[i];
          const recipientData = {
            NAME: r.name,
            MAIL: r.email,
            CATEGORY: r.category || r.team,
            TEAM: r.category || r.team,
            DATE: r.date,
            TIME: r.time || r.time_slot,
            TIME_SLOT: r.time || r.time_slot,
            MEET_LINK: r.meet_link,
            WHATSAPP_LINK: r.whatsapp_link,
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

          if (i < recipients.length - 1 && !isBatchCancelled) {
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

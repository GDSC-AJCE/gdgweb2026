import { render } from "emailmd";

export interface EmailRecipient {
  name?: string;
  email: string;
}

export interface SendEmailPayload {
  from?: string;
  to: string | string[];
  subject: string;
  markdown?: string;
  html?: string;
  text?: string;
  replyTo?: string;
  apiKey?: string;
}

export interface ResendResponse {
  id?: string;
  error?: string;
  success: boolean;
}

export const RESEND_COOKIE_NAME = "gdg_resend_cfg";
export const LEGACY_SMTP_COOKIE_NAME = "gdg_smtp_cfg";

/**
 * Renders markdown to responsive email HTML and text using emailmd
 */
export function renderEmailWithEmailMd(markdown: string): { html: string; text: string } {
  try {
    const rendered = render(markdown);
    return {
      html: rendered.html,
      text: rendered.text || markdown.replace(/[#*`>_~\[\]]/g, ""),
    };
  } catch (err) {
    console.warn("[emailmd] Failed to render with emailmd, using fallback:", err);
    const basicHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;padding:24px;background:#f8f9fa;"><div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #dadce0;">${markdown.replace(/\n/g, "<br/>")}</div></body></html>`;
    return {
      html: basicHtml,
      text: markdown.replace(/[#*`>_~\[\]]/g, ""),
    };
  }
}

/**
 * Resolves Resend configuration from environment variables or cookies
 */
export function getResendConfig(reqCookies?: { get: (name: string) => { value: string } | undefined }): {
  apiKey: string | null;
  from: string;
  configured: boolean;
  viaEnv: boolean;
} {
  const envKey = process.env.RESEND_API_KEY;
  const envFrom = process.env.RESEND_FROM || process.env.EMAIL_FROM || "GDG Community <onboarding@resend.dev>";

  if (envKey) {
    return {
      apiKey: envKey,
      from: envFrom,
      configured: true,
      viaEnv: true,
    };
  }

  if (reqCookies) {
    const rawResend = reqCookies.get(RESEND_COOKIE_NAME)?.value;
    if (rawResend) {
      try {
        const parsed = JSON.parse(rawResend);
        if (parsed.apiKey) {
          return {
            apiKey: parsed.apiKey,
            from: parsed.from || envFrom,
            configured: true,
            viaEnv: false,
          };
        }
      } catch {}
    }

    const rawLegacy = reqCookies.get(LEGACY_SMTP_COOKIE_NAME)?.value;
    if (rawLegacy) {
      try {
        const parsed = JSON.parse(rawLegacy);
        if (parsed.apiKey) {
          return {
            apiKey: parsed.apiKey,
            from: parsed.from || envFrom,
            configured: true,
            viaEnv: false,
          };
        }
      } catch {}
    }
  }

  return {
    apiKey: null,
    from: envFrom,
    configured: false,
    viaEnv: false,
  };
}

/**
 * Dispatches an email via Resend's REST API (https://resend.com/docs/api-reference/emails/send-email)
 */
export async function dispatchResendEmail(options: SendEmailPayload): Promise<ResendResponse> {
  const apiKey = options.apiKey || process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Resend API Key is missing. Please set RESEND_API_KEY in your .env or configure it in the Email Setup modal."
    );
  }

  let html = options.html;
  let text = options.text;

  if (options.markdown && !html) {
    const rendered = renderEmailWithEmailMd(options.markdown);
    html = rendered.html;
    text = text || rendered.text;
  }

  const fromAddress = options.from || process.env.RESEND_FROM || "GDG Community <onboarding@resend.dev>";
  const toList = Array.isArray(options.to) ? options.to : [options.to];

  const payload: Record<string, any> = {
    from: fromAddress,
    to: toList,
    subject: options.subject,
    html: html || "<p></p>",
    text: text || "",
  };

  if (options.replyTo) {
    payload.reply_to = options.replyTo;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey.trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data.message || data.error?.message || response.statusText || "Resend API error";
    throw new Error(`Resend Error (${response.status}): ${errorMessage}`);
  }

  return {
    id: data.id,
    success: true,
  };
}

// lib/gemini.ts
// Google Gemini AI Integration for GDG AJCE Mail Studio & Dispatch Engine

import { GoogleGenAI } from "@google/genai";

export interface EmailGenerationParams {
  prompt: string;
  category?: string;
  tone?: string;
  details?: {
    eventName?: string;
    date?: string;
    time?: string;
    venue?: string;
    rsvpLink?: string;
    meetLink?: string;
    whatsappLink?: string;
    speaker?: string;
    perks?: string;
    targetAudience?: string;
  };
  themeColor?: string;
  apiKey?: string;
}

export interface GeneratedEmailResult {
  subject: string;
  previewText: string;
  headline: string;
  summary: string;
  bodyHtml: string;
  fullHtml: string;
  unlayerDesign: any;
  suggestedSubjects: string[];
  callToAction: {
    label: string;
    url: string;
  };
  detectedVariables: string[];
}

export const GDG_COLORS = {
  blue: "#4285F4",
  red: "#EA4335",
  yellow: "#FBBC04",
  green: "#34A853",
  dark: "#0F172A",
  slate: "#334155",
};

/**
 * Resolve the Gemini API key from explicit param, environment, or return empty string
 */
export function getGeminiApiKey(explicitKey?: string): string {
  if (explicitKey && explicitKey.trim()) return explicitKey.trim();
  return (
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    ""
  );
}

/**
 * Formats raw error messages from Google Generative Language API into clear, actionable advice
 */
export function formatGeminiErrorMessage(err: any): string {
  if (!err) return "Unknown error communicating with Gemini API";
  const raw = typeof err === "string" ? err : err.message || String(err);
  try {
    const parsed = JSON.parse(raw);
    if (parsed.error && parsed.error.message) {
      if (parsed.error.message.includes("free tier is not available")) {
        return "The Gemini API free tier is disabled for this specific Google Cloud project. To fix this, create a new API key at https://aistudio.google.com/ using a personal Google account (click 'Create API key in new project'), or enable billing for this project at https://aistudio.google.com/billing.";
      }
      return parsed.error.message;
    }
  } catch {}
  if (raw.includes("free tier is not available")) {
    return "The Gemini API free tier is disabled for this specific Google Cloud project. To fix this, create a new API key at https://aistudio.google.com/ using a personal Google account (click 'Create API key in new project'), or enable billing for this project at https://aistudio.google.com/billing.";
  }
  return raw;
}

/**
 * Test connectivity with Gemini API
 */
export async function testGeminiConnection(apiKey?: string): Promise<{ success: boolean; message: string; model?: string }> {
  const key = getGeminiApiKey(apiKey);
  if (!key) {
    return {
      success: false,
      message: "No Gemini API Key provided. Set GEMINI_API_KEY in .env.local or enter it in Mail Studio settings.",
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: key, apiVersion: "v1beta" });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Respond with the word 'CONNECTED' if you can read this.",
    });

    const text = response.text || "";
    if (text.includes("CONNECTED") || text.length > 0) {
      return {
        success: true,
        message: "Gemini 2.5 Flash is online and ready!",
        model: "gemini-2.5-flash",
      };
    }
    return {
      success: true,
      message: "Connected to Gemini API.",
      model: "gemini-2.5-flash",
    };
  } catch (err: any) {
    // Attempt fallback with gemini-3.8-flash
    try {
      const ai = new GoogleGenAI({ apiKey: key, apiVersion: "v1beta" });
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: "Respond with 'CONNECTED'",
      });
      return {
        success: true,
        message: "Connected to Gemini (gemini-3.8-flash).",
        model: "gemini-3.8-flash",
      };
    } catch (fallbackErr: any) {
      return {
        success: false,
        message: formatGeminiErrorMessage(fallbackErr || err),
      };
    }
  }
}

/**
 * Generate full email content, subject lines, responsive HTML & Unlayer JSON using Gemini
 */
export async function generateEmailWithGemini(
  params: EmailGenerationParams
): Promise<GeneratedEmailResult> {
  const key = getGeminiApiKey(params.apiKey);
  if (!key) {
    throw new Error(
      "Gemini API key is required. Please set GEMINI_API_KEY in your environment or enter it in the Gemini Studio panel."
    );
  }

  const ai = new GoogleGenAI({ apiKey: key, apiVersion: "v1beta" });

  const category = params.category || "General Community Announcement";
  const tone = params.tone || "GDG Community Energetic (Friendly, Tech-forward, Welcoming)";
  const themeColor = params.themeColor || GDG_COLORS.blue;
  const details = params.details || {};

  const systemInstruction = `You are the Lead Communications Officer & Creative Developer for Google Developer Groups (GDG) on Campus AJCE (Amal Jyothi College of Engineering).
You write captivating, highly engaging, community-first emails for developers and students.
Your emails must sound vibrant, forward-looking, and authentic—never robotic or overly corporate.
Supported personalization merge tags that you can naturally weave in:
- {{name}} : First name of recipient
- {{email}} : Email address
- {{team}} or {{category}} : Selected team or applied category (e.g. AI & Machine Learning, Web, Flutter, Cloud)
- {{date}} : Event date or interview date
- {{time}} : Time slot or event duration
- {{meet_link}} : Google Meet URL
- {{whatsapp_link}} : Community / group chat link

Respond STRICTLY with a valid JSON object matching the requested schema. No code fences or Markdown outside the JSON.`;

  const promptContent = `
Task: Create a high-converting, beautifully formatted email for GDG on Campus AJCE.

User Request / Topic:
"${params.prompt}"

Email Category: ${category}
Tone of Voice: ${tone}
Primary Accent Color: ${themeColor}

Provided Key Details:
- Event / Opportunity Name: ${details.eventName || "Not specified (generate an exciting title)"}
- Date: ${details.date || "{{date}}"}
- Time: ${details.time || "{{time}}"}
- Venue / Platform: ${details.venue || "Amal Jyothi College of Engineering / Google Meet"}
- RSVP / Action Link: ${details.rsvpLink || "{{meet_link}}"}
- Speaker / Mentor: ${details.speaker || "GDG Core Team & Industry Mentors"}
- Perks & Swags: ${details.perks || "Google Developer Badges, Certificates, Hands-on Code & Swag"}
- Target Audience: ${details.targetAudience || "Tech enthusiasts, student developers, creators & leaders"}

Return ONLY a JSON object with this exact shape:
{
  "subject": "Main Catchy Subject Line (with 1-2 Google/tech emojis)",
  "previewText": "40-70 characters teaser preheader shown in inbox snippet",
  "headline": "Bold headline for top of email body",
  "summary": "1-2 sentence inspiring hook introducing the email",
  "keyPoints": [
    "Highlight point 1 with emoji",
    "Highlight point 2 with emoji",
    "Highlight point 3 with emoji"
  ],
  "paragraphs": [
    "Opening paragraph welcoming {{name}}...",
    "Main body details paragraph...",
    "Closing motivational call to action..."
  ],
  "callToAction": {
    "label": "Action Button Text (e.g., 'Claim Your Seat Now →', 'Join WhatsApp Group →')",
    "url": "${details.rsvpLink || "{{meet_link}}"}"
  },
  "suggestedSubjects": [
    "Alternative subject line 1",
    "Alternative subject line 2",
    "Alternative subject line 3",
    "Alternative subject line 4"
  ]
}
`;

  let responseText = "";
  let modelUsed = "gemini-2.5-flash";

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptContent,
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    });
    responseText = result.text || "";
  } catch (err: any) {
    // Fallback to gemini-3.8-flash
    try {
      modelUsed = "gemini-3.8-flash";
      const result = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: promptContent,
        config: {
          systemInstruction,
          temperature: 0.7,
          responseMimeType: "application/json",
        },
      });
      responseText = result.text || "";
    } catch (fallbackErr: any) {
      throw new Error(formatGeminiErrorMessage(fallbackErr || err));
    }
  }

  // Parse JSON output
  let parsed: any;
  try {
    const cleanJson = responseText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    parsed = JSON.parse(cleanJson);
  } catch (parseErr) {
    throw new Error("Failed to parse Gemini output into structured email: " + responseText.slice(0, 200));
  }

  // Detect which variables are used
  const combinedText = JSON.stringify(parsed);
  const detectedVariables: string[] = [];
  const varMatches = combinedText.match(/\{\{\s*([a-zA-Z0-9_-]+)\s*\}\}/g);
  if (varMatches) {
    varMatches.forEach((v) => {
      const cleanVar = v.replace(/[\{\}\s]/g, "");
      if (!detectedVariables.includes(cleanVar)) detectedVariables.push(cleanVar);
    });
  }

  // Generate full responsive HTML email
  const fullHtml = buildResponsiveGdgEmail({
    subject: parsed.subject,
    previewText: parsed.previewText || "",
    headline: parsed.headline || "GDG on Campus AJCE Update",
    summary: parsed.summary || "",
    paragraphs: parsed.paragraphs || [],
    keyPoints: parsed.keyPoints || [],
    callToAction: parsed.callToAction || { label: "Explore More", url: "{{meet_link}}" },
    themeColor,
    category,
    details,
  });

  // Generate Unlayer JSON design
  const unlayerDesign = buildUnlayerDesign({
    headline: parsed.headline || parsed.subject,
    summary: parsed.summary || "",
    paragraphs: parsed.paragraphs || [],
    keyPoints: parsed.keyPoints || [],
    callToAction: parsed.callToAction || { label: "Join GDG Event", url: "{{meet_link}}" },
    themeColor,
    category,
  });

  return {
    subject: parsed.subject || "Exciting Update from GDG on Campus AJCE",
    previewText: parsed.previewText || "Check out the latest news and opportunities from GDG AJCE.",
    headline: parsed.headline || "Google Developer Groups on Campus AJCE",
    summary: parsed.summary || "",
    bodyHtml: (parsed.paragraphs || []).map((p: string) => `<p>${p}</p>`).join("\n"),
    fullHtml,
    unlayerDesign,
    suggestedSubjects: parsed.suggestedSubjects || [],
    callToAction: parsed.callToAction || { label: "Get Started", url: "{{meet_link}}" },
    detectedVariables,
  };
}

/**
 * Generate 5 catchy subject lines based on topic or email body
 */
export async function generateSubjectLines(
  topic: string,
  category?: string,
  apiKey?: string
): Promise<{ subjects: { text: string; style: string; emoji: string }[] }> {
  const key = getGeminiApiKey(apiKey);
  if (!key) throw new Error("Gemini API key is required.");

  const ai = new GoogleGenAI({ apiKey: key, apiVersion: "v1beta" });

  const prompt = `
You are an expert email marketer specializing in developer communities (GDG / Google Tech).
Generate 5 distinct high-open-rate subject lines for this email topic:
Topic: "${topic}"
Category: "${category || "Community Announcement"}"

Return a JSON array of 5 objects with this structure:
[
  { "text": "🚀 Subject line text", "style": "Hype / High-Energy", "emoji": "🚀" },
  { "text": "⏳ Subject line text", "style": "Urgency / Deadline", "emoji": "⏳" },
  { "text": "💡 Subject line text", "style": "Curiosity / Value-first", "emoji": "💡" },
  { "text": "🎯 Subject line text", "style": "Direct / Personalized", "emoji": "🎯" },
  { "text": "✨ Subject line text", "style": "Google Community Vibe", "emoji": "✨" }
]
`;

  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", temperature: 0.8 },
    });
    const parsed = JSON.parse(res.text || "[]");
    return { subjects: Array.isArray(parsed) ? parsed : [] };
  } catch (err: any) {
    const fallbackRes = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: { responseMimeType: "application/json", temperature: 0.8 },
    });
    const parsed = JSON.parse(fallbackRes.text || "[]");
    return { subjects: Array.isArray(parsed) ? parsed : [] };
  }
}

/**
 * Polish / Rewrite existing content with Gemini
 */
export async function polishEmailContent(
  content: string,
  goal: "more_exciting" | "make_concise" | "fix_grammar" | "add_cta" | "custom",
  customInstruction?: string,
  apiKey?: string
): Promise<{ polished: string; summaryOfChanges: string }> {
  const key = getGeminiApiKey(apiKey);
  if (!key) throw new Error("Gemini API key is required.");

  const ai = new GoogleGenAI({ apiKey: key, apiVersion: "v1beta" });

  const goalDescriptions: Record<string, string> = {
    more_exciting: "Make this email copy punchier, highly engaging, and full of developer community excitement.",
    make_concise: "Condense this email copy, cutting fluff while preserving all crucial dates, links, and CTAs.",
    fix_grammar: "Proofread and polish the grammar, tone, flow, and formatting to professional Google standards.",
    add_cta: "Enhance the call to action, creating urgency and a compelling next step for the recipient.",
    custom: customInstruction || "Improve and polish the content.",
  };

  const prompt = `
Goal: ${goalDescriptions[goal] || goalDescriptions.more_exciting}

Original Content:
"""
${content}
"""

Preserve all merge variables like {{name}}, {{team}}, {{date}}, {{time}}, {{meet_link}}, {{whatsapp_link}}.
Return a JSON object:
{
  "polished": "The improved polished text/html",
  "summaryOfChanges": "Brief 1-sentence note explaining what was enhanced"
}
`;

  let res: any;
  try {
    res = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });
  } catch (err: any) {
    res = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });
  }

  const parsed = JSON.parse(res.text || "{}");
  return {
    polished: parsed.polished || content,
    summaryOfChanges: parsed.summaryOfChanges || "Polished by Gemini AI",
  };
}

/**
 * Builds standard bulletproof responsive HTML email for GDG AJCE
 */
function buildResponsiveGdgEmail(data: {
  subject: string;
  previewText: string;
  headline: string;
  summary: string;
  paragraphs: string[];
  keyPoints: string[];
  callToAction: { label: string; url: string };
  themeColor: string;
  category: string;
  details?: any;
}): string {
  const {
    subject,
    previewText,
    headline,
    summary,
    paragraphs,
    keyPoints,
    callToAction,
    themeColor,
    category,
    details = {},
  } = data;

  const keyPointsHtml =
    keyPoints && keyPoints.length > 0
      ? `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px;">
        <tr>
          <td>
            <div style="font-size: 13px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
              ⚡ Key Highlights & Details
            </div>
            <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 14px; line-height: 1.6;">
              ${keyPoints.map((pt) => `<li style="margin-bottom: 6px;">${pt}</li>`).join("")}
            </ul>
          </td>
        </tr>
      </table>`
      : "";

  const eventCardHtml =
    details.date || details.time || details.venue || details.speaker
      ? `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0; background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%); border: 1px solid #bfdbfe; border-radius: 12px; padding: 18px;">
        <tr>
          <td>
            <div style="display: flex; align-items: center; margin-bottom: 12px;">
              <span style="display: inline-block; width: 10px; height: 10px; background-color: ${themeColor}; border-radius: 50%; margin-right: 8px;"></span>
              <strong style="font-size: 14px; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px;">Event Information</strong>
            </div>
            <table role="presentation" width="100%" cellpadding="4" cellspacing="0" style="font-size: 13px; color: #1e293b;">
              ${details.eventName ? `<tr><td style="width: 25%; font-weight: 600; color: #64748b;">Event:</td><td style="font-weight: 700; color: #0f172a;">${details.eventName}</td></tr>` : ""}
              ${details.date ? `<tr><td style="font-weight: 600; color: #64748b;">Date:</td><td style="font-weight: 600;">${details.date}</td></tr>` : ""}
              ${details.time ? `<tr><td style="font-weight: 600; color: #64748b;">Time:</td><td style="font-weight: 600;">${details.time}</td></tr>` : ""}
              ${details.venue ? `<tr><td style="font-weight: 600; color: #64748b;">Venue:</td><td>${details.venue}</td></tr>` : ""}
              ${details.speaker ? `<tr><td style="font-weight: 600; color: #64748b;">Speaker:</td><td>${details.speaker}</td></tr>` : ""}
            </table>
          </td>
        </tr>
      </table>`
      : "";

  const paragraphsHtml = paragraphs
    .map(
      (p) =>
        `<p style="font-size: 15px; line-height: 1.65; color: #374151; margin-bottom: 16px;">${p}</p>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Google Sans', Roboto, 'Segoe UI', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    table { border-collapse: collapse; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; border-radius: 0 !important; }
      .header-pad { padding: 24px 20px 16px !important; }
      .content-pad { padding: 24px 20px !important; }
      .btn-cta { display: block !important; width: 100% !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f8fafc;">
  <!-- Preheader Preview Text -->
  <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all; font-size: 1px; color: #f8fafc; line-height: 1px;">
    ${previewText}
    &#847; &zwnj; &nbsp; &#8199; &shy;
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05); margin: 0 auto;">
          
          <!-- Top Google Color Bar -->
          <tr>
            <td style="padding: 0; height: 5px; line-height: 5px; font-size: 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="25%" style="background-color: #4285F4; height: 5px;"></td>
                  <td width="25%" style="background-color: #EA4335; height: 5px;"></td>
                  <td width="25%" style="background-color: #FBBC04; height: 5px;"></td>
                  <td width="25%" style="background-color: #34A853; height: 5px;"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Header Section -->
          <tr>
            <td class="header-pad" style="padding: 32px 36px 20px; background-color: #ffffff; border-bottom: 1px solid #f1f5f9;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <!-- GDG Badge -->
                    <div style="display: inline-block; padding: 4px 10px; border-radius: 20px; background-color: #eff6ff; border: 1px solid #dbeafe; font-size: 11px; font-weight: 700; color: #1d4ed8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
                      ${category}
                    </div>
                    <!-- GDG Logo Line -->
                    <div style="font-size: 13px; font-weight: 700; color: #475569; letter-spacing: -0.2px; text-transform: uppercase;">
                      Google Developer Groups <span style="color: #94a3b8; font-weight: 400;">on Campus</span>
                    </div>
                    <div style="font-size: 11px; font-weight: 600; color: #64748b; margin-top: 2px;">
                      Amal Jyothi College of Engineering, Kanjirappally
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content Area -->
          <tr>
            <td class="content-pad" style="padding: 32px 36px; background-color: #ffffff;">
              <!-- Headline -->
              <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.35; margin: 0 0 16px; letter-spacing: -0.4px;">
                ${headline}
              </h1>

              ${summary ? `<div style="font-size: 16px; font-weight: 500; color: #475569; line-height: 1.5; margin-bottom: 24px; padding-left: 12px; border-left: 3px solid ${themeColor};">${summary}</div>` : ""}

              <!-- Body Paragraphs -->
              ${paragraphsHtml}

              <!-- Event Highlight Card -->
              ${eventCardHtml}

              <!-- Key Points List -->
              ${keyPointsHtml}

              <!-- Primary Call To Action Button -->
              ${
                callToAction && callToAction.label
                  ? `
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0 20px;">
                <tr>
                  <td align="center">
                    <a href="${callToAction.url}" class="btn-cta" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: ${themeColor}; color: #ffffff; font-size: 15px; font-weight: 700; text-decoration: none; border-radius: 10px; box-shadow: 0 4px 8px rgba(66, 133, 244, 0.25); text-align: center;">
                      ${callToAction.label}
                    </a>
                  </td>
                </tr>
              </table>`
                  : ""
              }

              <!-- Sign-off / Signature -->
              <div style="margin-top: 36px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 14px; color: #475569; line-height: 1.5;">
                Warm regards,<br>
                <strong style="color: #0f172a;">GDG on Campus AJCE Core Team</strong><br>
                <span style="font-size: 12px; color: #94a3b8;">Department of Computer Applications & CSE, AJCE</span>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="font-size: 12px; color: #64748b; margin: 0 0 8px;">
                You are receiving this communication as a registered member or applicant of <strong>Google Developer Groups on Campus AJCE</strong>.
              </p>
              <div style="font-size: 11px; color: #94a3b8; line-height: 1.5;">
                Amal Jyothi College of Engineering &bull; Kanjirappally, Kottayam, Kerala 686518<br>
                <a href="https://gdgajce.vercel.app" target="_blank" style="color: #4285F4; text-decoration: none; font-weight: 600;">Visit Community Portal</a> &bull; 
                <a href="mailto:dsc@amaljyothi.ac.in" style="color: #4285F4; text-decoration: none; font-weight: 600;">Contact Organizers</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Builds an Unlayer design JSON schema for visual drag-and-drop editor
 */
function buildUnlayerDesign(data: {
  headline: string;
  summary: string;
  paragraphs: string[];
  keyPoints: string[];
  callToAction: { label: string; url: string };
  themeColor: string;
  category: string;
}): any {
  const { headline, summary, paragraphs, keyPoints, callToAction, themeColor, category } = data;

  const rows: any[] = [];

  // Row 1: Header / Category Banner
  rows.push({
    id: "row_header",
    cells: [1],
    columns: [
      {
        id: "col_header",
        contents: [
          {
            type: "text",
            values: {
              containerPadding: "24px 36px 12px 36px",
              color: "#1e40af",
              fontSize: "12px",
              textAlign: "left",
              lineHeight: "140%",
              text: `<p><strong>GOOGLE DEVELOPER GROUPS ON CAMPUS AJCE</strong> &bull; <span style="color: ${themeColor}">${category.toUpperCase()}</span></p>`,
            },
          },
          {
            type: "heading",
            values: {
              containerPadding: "8px 36px 16px 36px",
              headingType: "h1",
              fontSize: "24px",
              color: "#0f172a",
              textAlign: "left",
              lineHeight: "130%",
              text: headline,
            },
          },
          {
            type: "divider",
            values: {
              containerPadding: "0 36px 16px 36px",
              border: {
                borderTopWidth: "1px",
                borderTopStyle: "solid",
                borderTopColor: "#e2e8f0",
              },
            },
          },
        ],
      },
    ],
  });

  // Row 2: Summary & Paragraphs
  const bodyContents: any[] = [];
  if (summary) {
    bodyContents.push({
      type: "text",
      values: {
        containerPadding: "12px 36px 16px 36px",
        color: "#334155",
        fontSize: "16px",
        textAlign: "left",
        lineHeight: "150%",
        text: `<p><em>${summary}</em></p>`,
      },
    });
  }

  paragraphs.forEach((p, idx) => {
    bodyContents.push({
      type: "text",
      values: {
        containerPadding: "8px 36px 12px 36px",
        color: "#374151",
        fontSize: "15px",
        textAlign: "left",
        lineHeight: "160%",
        text: `<p>${p}</p>`,
      },
    });
  });

  if (keyPoints && keyPoints.length > 0) {
    const listHtml = `<ul>${keyPoints.map((k) => `<li>${k}</li>`).join("")}</ul>`;
    bodyContents.push({
      type: "text",
      values: {
        containerPadding: "12px 36px 16px 36px",
        color: "#1e293b",
        fontSize: "14px",
        textAlign: "left",
        lineHeight: "160%",
        text: listHtml,
      },
    });
  }

  // Row 3: Call To Action
  if (callToAction && callToAction.label) {
    bodyContents.push({
      type: "button",
      values: {
        containerPadding: "24px 36px 24px 36px",
        href: {
          name: "web",
          values: {
            href: callToAction.url,
            target: "_blank",
          },
        },
        buttonColors: {
          color: "#FFFFFF",
          backgroundColor: themeColor,
          hoverColor: "#FFFFFF",
          hoverBackgroundColor: "#2563eb",
        },
        size: {
          autoWidth: false,
          width: "280px",
        },
        fontSize: "15px",
        textAlign: "center",
        borderRadius: "8px",
        lineHeight: "120%",
        text: `<strong>${callToAction.label}</strong>`,
      },
    });
  }

  // Sign off
  bodyContents.push({
    type: "text",
    values: {
      containerPadding: "16px 36px 32px 36px",
      color: "#64748b",
      fontSize: "13px",
      textAlign: "left",
      lineHeight: "150%",
      text: `<p>Warm regards,<br/><strong>GDG on Campus AJCE Core Team</strong><br/>Amal Jyothi College of Engineering</p>`,
    },
  });

  rows.push({
    id: "row_body",
    cells: [1],
    columns: [
      {
        id: "col_body",
        contents: bodyContents,
      },
    ],
  });

  return {
    counters: {
      u_row: rows.length,
      u_column: rows.length,
      u_content_text: 5,
      u_content_heading: 1,
      u_content_button: 1,
      u_content_divider: 1,
    },
    body: {
      id: "u_body",
      rows,
      values: {
        backgroundColor: "#f8fafc",
        contentWidth: "600px",
        fontFamily: {
          label: "Google Sans",
          value: "'Google Sans', Roboto, Helvetica, Arial, sans-serif",
        },
      },
    },
  };
}

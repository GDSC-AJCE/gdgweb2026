// lib/mailer.ts
// GDG Mail Studio & Dispatch Engine - Core library for Next.js

import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { google } from "googleapis";

// Directory paths
export const TEMPLATES_DIR = path.join(process.cwd(), "templates");
export const ASSETS_DIR = path.join(process.cwd(), "public", "assets");
export const FIGMA_ASSETS_DIR = path.join(process.cwd(), "public", "assets", "figma");

// Ensure directories exist
if (!fs.existsSync(TEMPLATES_DIR)) {
  fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
}
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}
if (!fs.existsSync(FIGMA_ASSETS_DIR)) {
  fs.mkdirSync(FIGMA_ASSETS_DIR, { recursive: true });
}

export interface MailConfig {
  senderEmail: string;
  senderName: string;
  sheetId: string;
  sheetName: string;
  gatewayUrl: string;
  gatewayApiKey: string;
  figmaAccessToken: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  redirectUri: string;
  defaultSubject: string;
  defaultDelay: number;
}

// Global runtime config store (persists across requests during server lifetime)
let runtimeConfig: Partial<MailConfig> = {};

// Global batch cancellation state
let isBatchCancelledState = false;
export function cancelBatch() {
  isBatchCancelledState = true;
}
export function resetBatchCancellation() {
  isBatchCancelledState = false;
}
export function isBatchCancelled() {
  return isBatchCancelledState;
}

export function getMailConfig(): MailConfig {
  return {
    senderEmail:
      runtimeConfig.senderEmail ||
      process.env.GMAIL_USER ||
      process.env.NEXT_PUBLIC_SENDER_EMAIL ||
      "dsc@amaljyothi.ac.in",
    senderName:
      runtimeConfig.senderName ||
      process.env.SENDER_NAME ||
      process.env.NEXT_PUBLIC_SENDER_NAME ||
      "GDG on Campus AJCE",
    sheetId:
      runtimeConfig.sheetId ||
      process.env.GOOGLE_SHEET_ID ||
      process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID ||
      "1vn4T6EPHooqKAsAfAJWBH3MT__v3drPs9oce7V4SWIw",
    sheetName:
      runtimeConfig.sheetName ||
      process.env.GOOGLE_SHEET_NAME ||
      process.env.NEXT_PUBLIC_GOOGLE_SHEET_NAME ||
      "Not Shortlisted",
    gatewayUrl:
      runtimeConfig.gatewayUrl ||
      process.env.APPS_SCRIPT_GATEWAY_URL ||
      process.env.NEXT_PUBLIC_APPS_SCRIPT_GATEWAY_URL ||
      "https://script.google.com/macros/s/AKfycbxcIThvSrqiIT-4lKcJA-Z5EjGfwWtbXWMpljIL4ebMhfaNWX-OD2nJ_9qDosCcwq7O/exec",
    gatewayApiKey:
      runtimeConfig.gatewayApiKey ||
      process.env.APPS_SCRIPT_API_KEY ||
      process.env.NEXT_PUBLIC_APPS_SCRIPT_API_KEY ||
      "gdgajce",
    figmaAccessToken:
      runtimeConfig.figmaAccessToken ||
      process.env.FIGMA_ACCESS_TOKEN ||
      "",
    clientId:
      process.env.CLIENT_ID ||
      "",
    clientSecret:
      process.env.CLIENT_SECRET ||
      "",
    refreshToken:
      process.env.REFRESH_TOKEN ||
      "",
    redirectUri:
      process.env.REDIRECT_URI ||
      "https://developers.google.com/oauthplayground",
    defaultSubject: "Update on your GDG on Campus AJCE Core Team Application",
    defaultDelay: 800,
  };
}

export function updateMailConfig(newConfig: Partial<MailConfig>) {
  runtimeConfig = { ...runtimeConfig, ...newConfig };
}

// Variable substitution in template
export function injectVariables(content: string, recipient: any = {}): string {
  const name = recipient.NAME || recipient.Name || recipient.name || "there";
  const email = recipient.MAIL || recipient.Mail || recipient.Email || recipient.email || "";
  const category =
    recipient.CATEGORY ||
    recipient.Category ||
    recipient.category ||
    recipient.TEAM ||
    recipient.Team ||
    recipient.team ||
    recipient.Domain ||
    recipient.domain ||
    "";
  const date = recipient.DATE || recipient.Date || recipient.date || "November 9, 2026";
  const time =
    recipient.TIME ||
    recipient.Time ||
    recipient.time ||
    recipient.TIME_SLOT ||
    recipient.SLOT ||
    recipient.Slot ||
    recipient.time_slot ||
    recipient.slot ||
    "6:00 PM – 8:30 PM IST (Asia/Kolkata)";
  const whatsappLink =
    recipient.WHATSAPP_LINK ||
    recipient.whatsapp_link ||
    recipient.whatsapp ||
    recipient.WhatsApp ||
    "https://chat.whatsapp.com/Ftflnf70DRrAXIhwWJQ2Bo?s=cl&p=a&mlu=4&ilr=4&iam=2";
  const meetLink =
    recipient.MEET_LINK ||
    recipient.meet_link ||
    recipient.meet ||
    recipient.Meet ||
    "https://meet.google.com/djf-bgpu-stt";
  const teamSuffix = category ? ` for the <strong>${category}</strong> category` : "";

  return content
    .replace(/\{\{\s*name\s*\}\}/gi, name)
    .replace(/\{\{\s*email\s*\}\}/gi, email)
    .replace(/\{\{\s*category\s*\}\}/gi, category)
    .replace(/\{\{\s*team\s*\}\}/gi, category)
    .replace(/\{\{\s*team_suffix\s*\}\}/gi, teamSuffix)
    .replace(/\{\{\s*date\s*\}\}/gi, date)
    .replace(/\{\{\s*time\s*\}\}/gi, time)
    .replace(/\{\{\s*time_slot\s*\}\}/gi, time)
    .replace(/\{\{\s*whatsapp_link\s*\}\}/gi, whatsappLink)
    .replace(/\{\{\s*meet_link\s*\}\}/gi, meetLink);
}

// Render Template (MJML or HTML) to final responsive email HTML
export async function renderTemplateToHtml(
  templateSource: string,
  recipient: any = {},
  forPreview: boolean = false
): Promise<string> {
  const injected = injectVariables(templateSource, recipient);

  let html = "";
  if (injected.includes("<mjml>")) {
    try {
      const mjmlModule = await import("mjml");
      const mjmlFn = (mjmlModule as any).default || mjmlModule;
      const compiled = await mjmlFn(injected);
      html = compiled.html;
    } catch (e: any) {
      console.warn("MJML compile warning:", e.message);
      html = injected;
    }
  } else {
    html = injected;
  }

  // Convert local /assets/ image URLs to inline Base64 data URLs for email clients
  html = html.replace(/src=["'](\/assets\/[^"']+)["']/gi, (match, assetPath) => {
    try {
      const cleanPath = decodeURIComponent(assetPath).replace(/^\/assets\//, "");
      const filePath = path.join(ASSETS_DIR, cleanPath);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(cleanPath).toLowerCase().replace(".", "");
        const mime =
          ext === "png"
            ? "image/png"
            : ext === "jpg" || ext === "jpeg"
            ? "image/jpeg"
            : ext === "svg"
            ? "image/svg+xml"
            : "image/png";
        const b64 = fs.readFileSync(filePath).toString("base64");
        return `src="data:${mime};base64,${b64}"`;
      }
    } catch {}
    return match;
  });

  html = html.replace(/url\(['"]?(\/assets\/[^'")]+)['"]?\)/gi, (match, assetPath) => {
    try {
      const cleanPath = decodeURIComponent(assetPath).replace(/^\/assets\//, "");
      const filePath = path.join(ASSETS_DIR, cleanPath);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(cleanPath).toLowerCase().replace(".", "");
        const mime =
          ext === "png"
            ? "image/png"
            : ext === "jpg" || ext === "jpeg"
            ? "image/jpeg"
            : ext === "svg"
            ? "image/svg+xml"
            : "image/png";
        const b64 = fs.readFileSync(filePath).toString("base64");
        return `url('data:${mime};base64,${b64}')`;
      }
    } catch {}
    return match;
  });

  // Inject device-adaptive responsive styles
  const responsiveStyle = `
  <style id="gdg-responsive-background-fix">
    @media only screen and (max-width: 620px) {
      .u-row { width: 100% !important; }
      .u-row-container { max-width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; }
      .u-col { width: 100% !important; }
      [style*="background-image"] {
        background-size: cover !important;
        background-position: center center !important;
        background-repeat: no-repeat !important;
      }
    }
  </style>`;

  if (html.includes("</head>")) {
    html = html.replace("</head>", `${responsiveStyle}\n</head>`);
  } else {
    html = responsiveStyle + html;
  }

  // When forPreview is true, inject scroll fix CSS and ensure no overflow: hidden on html/body
  if (forPreview) {
    html = html.replace(
      /(<(?:html|body)[^>]*style=["'][^"']*?)overflow(?:-[xy])?\s*:\s*hidden\s*;?/gi,
      "$1"
    );
    html = html.replace(
      /((?:html|body)[^{]*\{[^}]*?)overflow(?:-[xy])?\s*:\s*hidden\s*;?/gi,
      "$1"
    );

    const previewScrollStyle = `
  <style id="gdg-preview-scroll-fix">
    html, body {
      overflow-y: auto !important;
      overflow-x: hidden !important;
      height: auto !important;
      min-height: 100% !important;
      -webkit-overflow-scrolling: touch !important;
    }
    body {
      padding-bottom: 40px !important;
    }
  </style>`;

    if (html.includes("</head>")) {
      html = html.replace("</head>", `${previewScrollStyle}\n</head>`);
    } else if (html.includes("<body")) {
      html = html.replace(/<body([^>]*)>/i, `<body$1>\n${previewScrollStyle}`);
    } else {
      html = previewScrollStyle + html;
    }
  }

  return html;
}

// Resolve Template content: HTML takes precedence if newer, else MJML
export function getTemplateSource(templateName: string): string | null {
  if (!templateName) return null;
  const cleanName = templateName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
  const htmlPath = path.join(TEMPLATES_DIR, `${cleanName}.html`);
  const mjmlPath = path.join(TEMPLATES_DIR, `${cleanName}.mjml`);

  const hasHtml = fs.existsSync(htmlPath);
  const hasMjml = fs.existsSync(mjmlPath);

  if (hasHtml && hasMjml) {
    const htmlTime = fs.statSync(htmlPath).mtimeMs;
    const mjmlTime = fs.statSync(mjmlPath).mtimeMs;
    return htmlTime >= mjmlTime ? fs.readFileSync(htmlPath, "utf8") : fs.readFileSync(mjmlPath, "utf8");
  }

  if (hasHtml) return fs.readFileSync(htmlPath, "utf8");
  if (hasMjml) return fs.readFileSync(mjmlPath, "utf8");
  return null;
}

// List all templates
export function listTemplates() {
  if (!fs.existsSync(TEMPLATES_DIR)) return [];
  const files = fs.readdirSync(TEMPLATES_DIR);
  const templateMap = new Map<string, { id: string; name: string; hasDesign: boolean; type: string }>();

  files.forEach((f) => {
    const ext = path.extname(f);
    const base = path.basename(f, ext);
    if (!templateMap.has(base)) {
      templateMap.set(base, {
        id: base,
        name: base
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
        hasDesign: false,
        type: "html",
      });
    }
    const item = templateMap.get(base)!;
    if (ext === ".json") item.hasDesign = true;
    if (ext === ".mjml") item.type = "mjml";
  });

  return Array.from(templateMap.values());
}

// Send via Google Apps Script Web App Gateway
export async function sendViaAppsScriptGateway(
  gatewayUrl: string,
  {
    to,
    subject,
    html,
    name,
    apiKey,
  }: {
    to: string;
    subject: string;
    html: string;
    name?: string;
    apiKey?: string;
  }
) {
  const config = getMailConfig();
  const targetUrl = (gatewayUrl || config.gatewayUrl).trim();
  const targetKey = (apiKey || config.gatewayApiKey || "gdgajce").trim();
  const senderDisplayName = name || config.senderName;

  const response = await fetch(targetUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    redirect: "follow",
    body: JSON.stringify({
      to,
      subject,
      html,
      name: senderDisplayName,
      apiKey: targetKey,
    }),
  });

  const text = await response.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch (e) {
    if (text.includes("accounts.google.com") || text.includes("Sign in") || response.status === 401) {
      throw new Error(
        'Google returned 401 Unauthorized (Sign-in required).\n' +
          'Cause: In script.google.com, your Web App deployment is set to "Only myself" or "Anyone in organization" instead of "Anyone".\n' +
          'Fix: In Apps Script, click Deploy > Manage deployments > Edit > set "Who has access" to "Anyone" > choose "New version" > Deploy.'
      );
    }
    throw new Error(`Invalid Gateway response (Status ${response.status}): ${text.slice(0, 150)}`);
  }

  if (!data.success) {
    throw new Error(data.error || "Gateway failed to dispatch email");
  }

  return data;
}

// Nodemailer transporter fallback
export function getTransporter(authConfig?: { user?: string; pass?: string }) {
  const config = getMailConfig();
  const user = authConfig?.user || config.senderEmail || "dsc@amaljyothi.ac.in";
  const pass = authConfig?.pass || process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_PASSWORD;

  if (pass) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: user.trim(),
        pass: pass.replace(/\s+/g, ""),
      },
    });
  }

  if (config.clientId && config.clientSecret && config.refreshToken) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: user.trim(),
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        refreshToken: config.refreshToken,
      },
    });
  }

  throw new Error("No authentication configured. Please provide an Apps Script Gateway URL or Gmail App Password.");
}

// Create OAuth2 client for Google APIs
export async function createOAuth2Client() {
  const config = getMailConfig();
  if (!config.refreshToken) {
    throw new Error("REFRESH_TOKEN not configured");
  }
  const oAuth2Client = new google.auth.OAuth2(
    config.clientId,
    config.clientSecret,
    config.redirectUri
  );
  oAuth2Client.setCredentials({
    refresh_token: config.refreshToken,
  });
  return oAuth2Client;
}

// Mark recipient as Sent in Google Sheet (if OAuth available)
export async function markEmailAsSent(
  spreadsheetId: string,
  sheetName: string,
  email: string,
  status: string = "Sent"
) {
  try {
    const auth = await createOAuth2Client();
    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: sheetName,
    });
    const rows = res.data.values;
    if (!rows || rows.length < 2) return false;

    const headers = rows[0];
    const emailCol = headers.findIndex((h: string) => {
      const norm = (h || "").trim().toLowerCase();
      return (
        norm === "email" ||
        norm === "email id" ||
        norm === "email address" ||
        norm === "mail" ||
        norm === "mail id"
      );
    });
    if (emailCol === -1) return false;

    let statusCol = headers.findIndex((h: string) => (h || "").trim().toLowerCase() === "status");
    if (statusCol === -1) {
      headers.push("Status");
      statusCol = headers.length - 1;
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [headers] },
      });
    }

    let foundRow = -1;
    for (let i = 1; i < rows.length; i++) {
      if ((rows[i][emailCol] || "").trim().toLowerCase() === email.trim().toLowerCase()) {
        foundRow = i;
        break;
      }
    }
    if (foundRow === -1) return false;

    while (rows[foundRow].length <= statusCol) rows[foundRow].push("");
    rows[foundRow][statusCol] = status;

    const updateRange = `${sheetName}!A${foundRow + 1}`;
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: "RAW",
      requestBody: { values: [rows[foundRow]] },
    });
    return true;
  } catch (e: any) {
    // Non-fatal if sheet write fails
    return false;
  }
}

// RFC 4180 CSV parser
export function parseRFC4180CSV(csvText: string): string[][] {
  if (!csvText) return [];
  const rows: string[][] = [];
  let row: string[] = [""];
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const c = csvText[i];
    const next = csvText[i + 1];

    if (c === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === "," && !inQuotes) {
      row.push("");
    } else if ((c === "\r" || c === "\n") && !inQuotes) {
      if (c === "\r" && next === "\n") i++;
      if (row.length > 1 || (row.length === 1 && row[0].trim() !== "")) {
        rows.push(row.map((cell) => cell.trim()));
      }
      row = [""];
    } else {
      row[row.length - 1] += c;
    }
  }
  if (row.length > 1 || (row.length === 1 && row[0].trim() !== "")) {
    rows.push(row.map((cell) => cell.trim()));
  }
  return rows;
}

// Sheet ID and GID helpers
export function extractCleanSheetId(input: string): string {
  if (!input) return "";
  const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) return match[1];
  return input.trim().split("/")[0].split("?")[0].split("#")[0];
}

export function extractGid(input: string): string | null {
  if (!input) return null;
  const match = input.match(/[#&?]gid=([0-9]+)/);
  return match ? match[1] : null;
}

// Fetch Google Sheet tabs
export async function fetchGoogleSheetTabs(sheetIdOrUrl: string) {
  const sheetId = extractCleanSheetId(sheetIdOrUrl);
  if (!sheetId) return [];

  // 1. Try Google Sheets API with OAuth if available
  try {
    const auth = await createOAuth2Client();
    const sheets = google.sheets({ version: "v4", auth });
    const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
    if (meta.data && meta.data.sheets) {
      return meta.data.sheets.map((s) => ({
        name: s.properties?.title || "Sheet",
        gid: String(s.properties?.sheetId || "0"),
      }));
    }
  } catch (e) {
    // OAuth failed or expired, fallback to htmlview scraper
  }

  // 2. Fetch htmlview / edit page to extract dynamic tabs for public sheets
  try {
    const res = await fetch(`https://docs.google.com/spreadsheets/d/${sheetId}/htmlview`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      redirect: "follow",
    });

    if (res.ok) {
      const html = await res.text();
      const regex = /items\.push\({\s*name:\s*"([^"]+)",\s*pageUrl:[^,]*,[\s\S]*?gid:\s*"([^"]+)"/g;
      const tabs: { name: string; gid: string }[] = [];
      let match;
      while ((match = regex.exec(html)) !== null) {
        let name = match[1].replace(/\\x([0-9A-Fa-f]{2})/g, (m, p) =>
          String.fromCharCode(parseInt(p, 16))
        );
        name = name.replace(/\\u([0-9A-Fa-f]{4})/g, (m, p) =>
          String.fromCharCode(parseInt(p, 16))
        );
        tabs.push({
          name: name,
          gid: match[2],
        });
      }
      if (tabs.length > 0) return tabs;
    }
  } catch (err) {
    console.error("Error fetching htmlview tabs:", err);
  }

  return [];
}

// Smart column detector and applicant extractor
export function extractRecipientsFromRows(rows: string[][]) {
  if (!rows || rows.length < 2) return [];

  const headers = rows[0].map((h) => (h || "").trim());

  let nameIdx = headers.findIndex((h) => /name|applicant|student/i.test(h));
  let emailIdx = headers.findIndex((h) => /email|mail/i.test(h));
  let teamIdx = headers.findIndex((h) => /category|domain|team|role|track/i.test(h));
  let statusIdx = headers.findIndex((h) => /^status$/i.test(h));

  if (emailIdx === -1) {
    for (let col = 0; col < 20; col++) {
      if (rows.slice(1, 10).some((r) => r[col] && r[col].includes("@") && !r[col].includes(" "))) {
        emailIdx = col;
        break;
      }
    }
  }

  if (nameIdx === -1) {
    if (emailIdx > 0) nameIdx = emailIdx - 1;
    else nameIdx = 1;
  }

  if (teamIdx === -1) {
    for (let col = 0; col < 20; col++) {
      if (col !== emailIdx && col !== nameIdx) {
        const matches = rows
          .slice(1, 10)
          .filter(
            (r) =>
              r[col] &&
              r[col].length > 0 &&
              r[col].length < 35 &&
              /\b(team|management|web|cloud|android|ai|documentation)\b/i.test(r[col])
          );
        if (matches.length >= 2) {
          teamIdx = col;
          break;
        }
      }
    }
    if (teamIdx === -1 && rows[1] && rows[1][6] && /\bteam\b/i.test(rows[1][6])) {
      teamIdx = 6;
    }
  }

  const slotIdx = headers.findIndex((h) => /\b(slot|time|hour|timing)\b/i.test(h));
  const dateIdx = headers.findIndex((h) => /\b(date|day)\b/i.test(h));
  const meetIdx = headers.findIndex((h) => /\b(meet|gmeet|interview_link)\b/i.test(h));
  const whatsappIdx = headers.findIndex((h) => /\b(whatsapp|wa|group)\b/i.test(h));

  const recipients: any[] = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const email = emailIdx !== -1 && r[emailIdx] ? r[emailIdx].trim() : "";

    if (email && email.includes("@") && !email.includes(" ")) {
      const rawName = nameIdx !== -1 && r[nameIdx] ? r[nameIdx].trim() : "Applicant";
      const name = rawName.replace(/^["']|["']$/g, "");
      const team = teamIdx !== -1 && r[teamIdx] ? r[teamIdx].trim().replace(/^["']|["']$/g, "") : "";
      const status = statusIdx !== -1 && r[statusIdx] ? r[statusIdx].trim() : "Pending";
      const time_slot = slotIdx !== -1 && r[slotIdx] ? r[slotIdx].trim() : undefined;
      const date = dateIdx !== -1 && r[dateIdx] ? r[dateIdx].trim() : undefined;
      const meet_link = meetIdx !== -1 && r[meetIdx] ? r[meetIdx].trim() : undefined;
      const whatsapp_link = whatsappIdx !== -1 && r[whatsappIdx] ? r[whatsappIdx].trim() : undefined;

      recipients.push({
        id: i,
        name: name || "Applicant",
        email,
        category: team,
        team,
        time: time_slot || "",
        time_slot: time_slot || "",
        date: date || "",
        meet_link,
        whatsapp_link,
        status: status.toLowerCase() === "sent" ? "Sent" : "Pending",
        isValid: true,
      });
    }
  }
  return recipients;
}

// Figma Design Importer
export async function importFigmaDesign(figmaUrl: string, token: string) {
  // Parse Figma URL
  const u = new URL(figmaUrl);
  const pathParts = u.pathname.split("/").filter(Boolean);
  const keyIndex = pathParts.findIndex((p) => p === "design" || p === "file");
  const fileKey = keyIndex !== -1 ? pathParts[keyIndex + 1] : pathParts[1];
  let nodeId = u.searchParams.get("node-id");
  if (nodeId) {
    nodeId = decodeURIComponent(nodeId).replace("-", ":");
  }

  if (!fileKey) throw new Error("Could not extract Figma file key from URL.");

  // Fetch file from Figma API
  const apiUrl = nodeId
    ? `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${nodeId}`
    : `https://api.figma.com/v1/files/${fileKey}`;

  const res = await fetch(apiUrl, {
    headers: { "X-Figma-Token": token },
  });
  if (!res.ok) {
    throw new Error(`Figma API error (HTTP ${res.status}): ${await res.text()}`);
  }

  const figmaData = await res.json();
  const rootNode = nodeId ? figmaData.nodes?.[nodeId]?.document : figmaData.document;

  // Build basic unlayer design structure
  const design = {
    counters: { u_row: 1, u_column: 1 },
    body: {
      rows: [
        {
          cells: [1],
          columns: [
            {
              contents: [
                {
                  type: "heading",
                  values: {
                    text: rootNode?.name || "Imported Figma Email",
                    headingType: "h1",
                    fontSize: "24px",
                    textAlign: "center",
                    color: "#1A73E8",
                  },
                },
                {
                  type: "text",
                  values: {
                    text: "<p>Imported directly from Figma design frame.</p><p>Dear {{name}}, Welcome to GDG on Campus AJCE!</p>",
                    fontSize: "14px",
                    lineHeight: "160%",
                    color: "#374151",
                  },
                },
              ],
            },
          ],
        },
      ],
      values: {
        backgroundColor: "#f8fafc",
        contentWidth: "600px",
        fontFamily: { label: "Google Sans", value: "'Google Sans', Roboto, sans-serif" },
      },
    },
    schemaVersion: 1,
  };

  return { design, assetCount: 0 };
}

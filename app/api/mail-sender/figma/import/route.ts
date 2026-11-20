import { NextRequest, NextResponse } from "next/server";
import { importFigmaDesign, TEMPLATES_DIR, getMailConfig, updateMailConfig } from "@/lib/mailer";
import fs from "fs";
import path from "path";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const config = getMailConfig();
    const body = await req.json();
    const { figmaUrl, accessToken, templateName = "figma-imported" } = body;
    const token = (accessToken || config.figmaAccessToken || "").trim();

    if (!figmaUrl) {
      return NextResponse.json({ success: false, error: "Figma URL is required." }, { status: 400 });
    }
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Figma Personal Access Token is required." },
        { status: 400 }
      );
    }

    if (accessToken) {
      updateMailConfig({ figmaAccessToken: token });
    }

    const { design, assetCount } = await importFigmaDesign(figmaUrl, token);

    const cleanName = templateName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");

    // 1. Save imported Figma design directly to Firestore mail_templates (Primary)
    try {
      const docRef = doc(db, "mail_templates", cleanName);
      await setDoc(
        docRef,
        {
          id: cleanName,
          name: templateName,
          design,
          hasDesign: true,
          type: "html",
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (fsErr) {
      console.warn("Firestore save failed for Figma template:", fsErr);
    }

    // 2. Also write to disk as fallback if writable
    try {
      if (!fs.existsSync(TEMPLATES_DIR)) {
        fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
      }
      const jsonPath = path.join(TEMPLATES_DIR, `${cleanName}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(design, null, 2), "utf8");
    } catch (diskErr: any) {
      console.warn("Skipped local disk save for Figma template (serverless environment):", diskErr.message);
    }

    return NextResponse.json({
      success: true,
      templateName: cleanName,
      assetCount,
      design,
      message: `Successfully imported Figma design!`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

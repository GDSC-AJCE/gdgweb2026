import { NextRequest, NextResponse } from "next/server";
import { importFigmaDesign, TEMPLATES_DIR, getMailConfig, updateMailConfig } from "@/lib/mailer";
import fs from "fs";
import path from "path";

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
    const jsonPath = path.join(TEMPLATES_DIR, `${cleanName}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(design, null, 2), "utf8");

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

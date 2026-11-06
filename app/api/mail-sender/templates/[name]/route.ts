import { NextRequest, NextResponse } from "next/server";
import { TEMPLATES_DIR, getTemplateSource } from "@/lib/mailer";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await context.params;
    const templateName = name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
    const jsonPath = path.join(TEMPLATES_DIR, `${templateName}.json`);

    const content = getTemplateSource(templateName) || "";
    let design = null;

    if (fs.existsSync(jsonPath)) {
      try {
        design = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
      } catch {}
    }

    return NextResponse.json({
      success: true,
      name: templateName,
      content,
      design,
      hasDesign: !!design,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await context.params;
    const templateName = name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
    const body = await req.json();
    const { content, design } = body;

    if (content) {
      const htmlPath = path.join(TEMPLATES_DIR, `${templateName}.html`);
      fs.writeFileSync(htmlPath, content, "utf8");
    }

    if (design) {
      const jsonPath = path.join(TEMPLATES_DIR, `${templateName}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(design, null, 2), "utf8");
    }

    return NextResponse.json({
      success: true,
      message: `Template '${templateName}' saved successfully!`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await context.params;
    const templateName = name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
    const exts = [".html", ".json", ".mjml"];
    let deleted = false;

    exts.forEach((ext) => {
      const p = path.join(TEMPLATES_DIR, `${templateName}${ext}`);
      if (fs.existsSync(p)) {
        fs.unlinkSync(p);
        deleted = true;
      }
    });

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: `Template '${templateName}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Template '${templateName}' deleted successfully!`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

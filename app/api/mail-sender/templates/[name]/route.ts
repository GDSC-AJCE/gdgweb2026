import { NextRequest, NextResponse } from "next/server";
import { TEMPLATES_DIR, getTemplateSource } from "@/lib/mailer";
import fs from "fs";
import path from "path";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await context.params;
    const templateName = name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
    const jsonPath = path.join(TEMPLATES_DIR, `${templateName}.json`);

    let content: string = "";
    let design: any = null;
    let displayName: string = templateName
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    let foundInFirestore = false;

    // 1. Check Firestore first
    try {
      const docRef = doc(db, "mail_templates", templateName);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        foundInFirestore = true;
        if (data.name) displayName = data.name;
        if (data.content) content = data.content;
        if (data.design) design = data.design;
      }
    } catch (fsErr) {
      console.warn("Firestore getDoc failed, falling back to disk:", fsErr);
    }

    // 2. Fallback to disk if content or design missing
    if (!content) {
      content = getTemplateSource(templateName) || "";
    }

    if (!design && fs.existsSync(jsonPath)) {
      try {
        design = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
      } catch {}
    }

    return NextResponse.json(
      {
        success: true,
        id: templateName,
        name: displayName,
        content,
        design,
        hasDesign: Boolean(design),
      },
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

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await context.params;
    const templateName = name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
    const body = await req.json();
    const { content, design } = body;

    const displayName =
      body.name ||
      templateName
        .split("-")
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    let firestoreSaved = false;

    // 1. Save to Firestore (Primary single source of truth)
    try {
      const docRef = doc(db, "mail_templates", templateName);
      const existingSnap = await getDoc(docRef);
      const existingData = existingSnap.exists() ? existingSnap.data() : {};

      const updatePayload: Record<string, any> = {
        id: templateName,
        name: displayName || existingData.name || templateName,
        type: "html",
        hasDesign: design !== undefined ? Boolean(design) : Boolean(existingData.hasDesign || existingData.design),
        updatedAt: new Date().toISOString(),
      };

      if (content !== undefined) updatePayload.content = content;
      if (design !== undefined) updatePayload.design = design;

      await setDoc(docRef, updatePayload, { merge: true });
      firestoreSaved = true;
    } catch (fsErr: any) {
      console.warn("Firestore save failed:", fsErr?.message || fsErr);
    }

    // 2. Also write to disk as fallback (safe for serverless / EROFS)
    let diskSaved = false;
    try {
      if (!fs.existsSync(TEMPLATES_DIR)) {
        fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
      }

      if (content !== undefined) {
        const htmlPath = path.join(TEMPLATES_DIR, `${templateName}.html`);
        fs.writeFileSync(htmlPath, content, "utf8");
        diskSaved = true;
      }

      if (design !== undefined) {
        const jsonPath = path.join(TEMPLATES_DIR, `${templateName}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(design, null, 2), "utf8");
        diskSaved = true;
      }
    } catch (diskErr: any) {
      console.warn("Disk write skipped or failed (expected in read-only serverless environment):", diskErr?.message);
    }

    if (!firestoreSaved && !diskSaved) {
      throw new Error("Failed to save template to Firestore or local storage.");
    }

    return NextResponse.json(
      {
        success: true,
        message: `Template '${templateName}' saved successfully!`,
      },
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

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await context.params;
    const templateName = name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
    const body = await req.json();
    const updatedName = (body.name || body.newName || "").trim();

    if (!updatedName) {
      return NextResponse.json(
        { success: false, error: "A valid template name is required." },
        { status: 400 }
      );
    }

    let firestoreUpdated = false;

    // 1. Update Firestore (Primary)
    try {
      const docRef = doc(db, "mail_templates", templateName);
      const existingSnap = await getDoc(docRef);

      if (existingSnap.exists()) {
        await setDoc(
          docRef,
          {
            name: updatedName,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } else {
        await setDoc(
          docRef,
          {
            id: templateName,
            name: updatedName,
            type: "html",
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
      firestoreUpdated = true;
    } catch (fsErr: any) {
      console.warn("Firestore update failed:", fsErr?.message || fsErr);
    }

    // 2. Update local .json file if exists (safely caught for serverless)
    try {
      const jsonPath = path.join(TEMPLATES_DIR, `${templateName}.json`);
      if (fs.existsSync(jsonPath)) {
        const raw = fs.readFileSync(jsonPath, "utf8");
        const data = JSON.parse(raw);
        if (typeof data === "object" && data !== null && !Array.isArray(data)) {
          data.name = updatedName;
          fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf8");
        }
      }
    } catch (e: any) {
      console.warn("Failed or skipped updating name in local json file (expected in serverless):", e?.message);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Template renamed successfully",
        name: updatedName,
      },
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

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await context.params;
    const templateName = name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
    let deletedFirestore = false;

    // 1. Delete from Firestore (Primary)
    try {
      const docRef = doc(db, "mail_templates", templateName);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        await deleteDoc(docRef);
        deletedFirestore = true;
      }
    } catch (fsErr: any) {
      console.warn("Firestore delete failed:", fsErr?.message || fsErr);
    }

    // 2. Delete from disk (safely caught for serverless / read-only filesystem)
    const exts = [".html", ".json", ".mjml"];
    let deletedDisk = false;

    exts.forEach((ext) => {
      try {
        const p = path.join(TEMPLATES_DIR, `${templateName}${ext}`);
        if (fs.existsSync(p)) {
          fs.unlinkSync(p);
          deletedDisk = true;
        }
      } catch (diskErr: any) {
        console.warn(`Skipped disk deletion for ${templateName}${ext} (expected in serverless):`, diskErr?.message);
      }
    });

    if (!deletedDisk && !deletedFirestore) {
      return NextResponse.json(
        { success: false, error: `Template '${templateName}' not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Template '${templateName}' deleted successfully!`,
      },
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

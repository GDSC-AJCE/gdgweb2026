import { NextResponse } from "next/server";
import { listTemplates } from "@/lib/mailer";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const diskTemplates = listTemplates();
    const templateMap = new Map<string, { id: string; name: string; hasDesign: boolean; type: string }>();

    // Add disk templates first
    diskTemplates.forEach((t) => {
      templateMap.set(t.id, t);
    });

    // Query Firestore mail_templates
    try {
      const snap = await getDocs(collection(db, "mail_templates"));
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;
        const displayName =
          data.name ||
          id
            .split("-")
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
        const hasDesign = Boolean(data.hasDesign || data.design);
        const type = data.type || "html";

        templateMap.set(id, {
          id,
          name: displayName,
          hasDesign,
          type,
        });
      });
    } catch (fsErr) {
      console.warn("Firestore mail_templates read failed, using disk templates:", fsErr);
    }

    const templates = Array.from(templateMap.values());

    return NextResponse.json(
      { success: true, templates },
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

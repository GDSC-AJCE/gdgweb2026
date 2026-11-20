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
    const deletedSet = new Set<string>();

    // 1. Query Firestore mail_templates to identify deleted tombstones and active templates
    try {
      const snap = await getDocs(collection(db, "mail_templates"));
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;

        // If template has been marked as deleted (tombstone), register in deletedSet and exclude
        if (data.deleted === true) {
          deletedSet.add(id);
          return;
        }

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

    // 2. Add disk templates, strictly filtering out any template marked as deleted
    diskTemplates.forEach((t) => {
      if (!deletedSet.has(t.id) && !templateMap.has(t.id)) {
        templateMap.set(t.id, t);
      }
    });

    // 3. Final purge: ensure no deleted template ID is ever present in templateMap
    deletedSet.forEach((deletedId) => {
      templateMap.delete(deletedId);
    });

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

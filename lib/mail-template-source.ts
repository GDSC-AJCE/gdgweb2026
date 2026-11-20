/**
 * Server-side resolution of the template HTML that will actually be rendered.
 *
 * Priority:
 *   1. `templateContent` sent by Mail Studio (the client re-reads the saved
 *      Firestore version right before every preview / test / batch send).
 *   2. Firestore `mail_templates/{templateName}` (public read per rules).
 *   3. Starter file in /templates (only if no Firestore doc exists at all).
 *
 * There is intentionally NO hardcoded fallback: if nothing resolves, callers
 * must fail loudly instead of emailing placeholder content.
 */
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getTemplateSource } from "@/lib/mailer";

export interface TemplateSourceInput {
  templateContent?: unknown;
  templateName?: unknown;
}

export type TemplateSourceResult =
  | { ok: true; source: string; origin: "request" | "firestore" | "starter" }
  | { ok: false; error: string };

function cleanId(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
}

export async function resolveTemplateSource(
  input: TemplateSourceInput
): Promise<TemplateSourceResult> {
  if (typeof input.templateContent === "string" && input.templateContent.trim().length > 0) {
    return { ok: true, source: input.templateContent, origin: "request" };
  }

  if (typeof input.templateName !== "string" || !input.templateName.trim()) {
    return { ok: false, error: "No template selected." };
  }
  const id = cleanId(input.templateName);

  let firestoreDocExists = false;
  try {
    const snap = await getDoc(doc(db, "mail_templates", id));
    if (snap.exists()) {
      firestoreDocExists = true;
      const data = snap.data();
      if (data.deleted === true) {
        return { ok: false, error: `Template '${id}' has been deleted.` };
      }
      if (typeof data.content === "string" && data.content.trim()) {
        return { ok: true, source: data.content, origin: "firestore" };
      }
    }
  } catch (err) {
    console.warn(`[mail] Firestore lookup failed for template '${id}':`, err);
  }

  // No cloud HTML (missing doc, or a metadata-only doc): fall back to a starter
  // file with the same id if one ships with the repo.
  const starter = getTemplateSource(id);
  if (starter && starter.trim()) {
    return { ok: true, source: starter, origin: "starter" };
  }

  return {
    ok: false,
    error: firestoreDocExists
      ? `Template '${id}' has no saved HTML yet. Open it in the Visual Editor and save it first.`
      : `Template '${id}' was not found.`,
  };
}

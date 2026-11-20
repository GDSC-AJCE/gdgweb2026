/**
 * Mail template repository (client side).
 *
 * Single source of truth for Mail Studio templates: Firestore `mail_templates`.
 * Writes run with the signed-in admin's Firebase session (required by
 * firestore.rules) and THROW on failure — callers must surface the error
 * instead of reporting a false "saved" state.
 *
 * Starter templates shipped in /templates are read-only seeds. They are
 * served by GET /api/mail-sender/templates/[name] and become editable cloud
 * templates the first time they are saved.
 */
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export const MAIL_TEMPLATES_COLLECTION = "mail_templates";

/** Firestore hard limit is 1 MiB per document; keep headroom for metadata. */
const MAX_TEMPLATE_BYTES = 950_000;

export type TemplateSource = "cloud" | "starter";

export interface TemplateSummary {
  id: string;
  name: string;
  hasDesign: boolean;
  type: string;
  source: TemplateSource;
  updatedAt?: string;
  /** A starter file with this id ships in /templates ("Restore original" is possible). */
  hasStarter?: boolean;
}

export interface TemplateRecord extends TemplateSummary {
  content: string;
  design: unknown | null;
  subject?: string;
  whatsappLink?: string;
}

export interface TemplatePatch {
  name?: string;
  content?: string;
  design?: unknown | null;
  subject?: string;
  whatsappLink?: string;
}

export function slugifyTemplateId(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function humanizeTemplateId(id: string): string {
  return id
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function describeTemplateError(err: unknown): string {
  const code = (err as { code?: string } | null)?.code;
  if (code === "permission-denied") {
    return "Permission denied by Firestore. Sign in with a core team / admin Google account and try again.";
  }
  if (code === "unavailable") {
    return "Firestore is unreachable. Check your connection and try again.";
  }
  if (err instanceof Error) return err.message;
  return "Unexpected error while talking to Firestore.";
}

function toSummary(id: string, data: Record<string, unknown>): TemplateSummary {
  return {
    id,
    name: (typeof data.name === "string" && data.name) || humanizeTemplateId(id),
    hasDesign: Boolean(data.hasDesign || data.design),
    type: (typeof data.type === "string" && data.type) || "html",
    source: "cloud",
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : undefined,
  };
}

function toRecord(id: string, data: Record<string, unknown>): TemplateRecord {
  return {
    ...toSummary(id, data),
    content: typeof data.content === "string" ? data.content : "",
    design: data.design ?? null,
    subject: typeof data.subject === "string" ? data.subject : undefined,
    whatsappLink: typeof data.whatsappLink === "string" ? data.whatsappLink : undefined,
  };
}

/** Strips `undefined` (rejected by Firestore) and guarantees JSON-safe data. */
function toFirestoreSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** True when a cloud doc carries real template content (not just subject/metadata). */
function hasBody(data: Record<string, unknown>): boolean {
  return (typeof data.content === "string" && data.content.trim().length > 0) || Boolean(data.design);
}

interface CloudListing {
  templates: TemplateSummary[];
  deletedIds: Set<string>;
  /** Docs that only hold metadata (e.g. a saved subject) and no HTML/design. */
  metadataOnly: Map<string, TemplateSummary>;
}

/** Cloud templates (non-deleted) plus the set of tombstoned ids. */
export async function listCloudTemplates(): Promise<CloudListing> {
  const snap = await getDocs(collection(db, MAIL_TEMPLATES_COLLECTION));
  const templates: TemplateSummary[] = [];
  const deletedIds = new Set<string>();
  const metadataOnly = new Map<string, TemplateSummary>();
  snap.forEach((d) => {
    const data = d.data();
    if (data.deleted === true) {
      deletedIds.add(d.id);
      return;
    }
    const summary = toSummary(d.id, data);
    if (hasBody(data)) templates.push(summary);
    else metadataOnly.set(d.id, summary);
  });
  return { templates, deletedIds, metadataOnly };
}

/** Starter templates shipped in /templates, as reported by the API. */
async function fetchStarterIndex(): Promise<Map<string, TemplateSummary>> {
  const res = await fetch("/api/mail-sender/templates", { cache: "no-store" });
  if (!res.ok) return new Map();
  const data = (await res.json()) as { templates?: Array<Partial<TemplateSummary>> };
  const index = new Map<string, TemplateSummary>();
  for (const t of data.templates ?? []) {
    if (typeof t.id !== "string" || !t.hasStarter) continue;
    index.set(t.id, {
      id: t.id,
      name: t.name || humanizeTemplateId(t.id),
      hasDesign: Boolean(t.hasDesign),
      type: t.type || "html",
      source: "starter",
      hasStarter: true,
    });
  }
  return index;
}

export async function listAllTemplates(): Promise<TemplateSummary[]> {
  const { templates, deletedIds, metadataOnly } = await listCloudTemplates();
  let starters = new Map<string, TemplateSummary>();
  try {
    starters = await fetchStarterIndex();
  } catch {
    starters = new Map();
  }

  const cloudIds = new Set(templates.map((t) => t.id));
  const merged: TemplateSummary[] = templates.map((t) => ({ ...t, hasStarter: starters.has(t.id) }));

  for (const [id, starter] of starters) {
    if (cloudIds.has(id) || deletedIds.has(id)) continue;
    // A metadata-only cloud doc keeps its display name but uses the starter body.
    const meta = metadataOnly.get(id);
    merged.push(meta ? { ...starter, name: meta.name } : starter);
  }
  return merged.sort((a, b) => a.name.localeCompare(b.name));
}

/** The pristine starter file for an id, ignoring any cloud copy. */
export async function getStarterTemplate(id: string): Promise<TemplateRecord | null> {
  const res = await fetch(`/api/mail-sender/templates/${encodeURIComponent(id)}?source=starter`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { success?: boolean; name?: string; content?: string; design?: unknown };
  if (!data.success || !data.content) return null;
  return {
    id,
    name: data.name || humanizeTemplateId(id),
    hasDesign: Boolean(data.design),
    type: "html",
    source: "starter",
    hasStarter: true,
    content: data.content,
    design: data.design ?? null,
  };
}

/**
 * Loads the authoritative version of a template.
 * Cloud (Firestore) wins when it has a body. A missing or metadata-only cloud
 * doc falls back to the starter file (keeping any saved subject / link).
 */
export async function getTemplate(id: string): Promise<TemplateRecord | null> {
  const snap = await getDoc(doc(db, MAIL_TEMPLATES_COLLECTION, id));
  const cloud = snap.exists() ? snap.data() : null;
  if (cloud?.deleted === true) return null;
  if (cloud && hasBody(cloud)) return toRecord(id, cloud);

  const starter = await getStarterTemplate(id);
  if (!starter) return cloud ? toRecord(id, cloud) : null;
  if (!cloud) return starter;

  const meta = toRecord(id, cloud);
  return {
    ...starter,
    name: (typeof cloud.name === "string" && cloud.name) || starter.name,
    subject: meta.subject,
    whatsappLink: meta.whatsappLink,
    updatedAt: meta.updatedAt,
  };
}

function assertSignedIn(): void {
  if (!auth.currentUser) {
    throw new Error("You are signed out. Sign in with your admin Google account to save templates.");
  }
}

/**
 * Creates or updates a template in Firestore and returns the saved record.
 * Throws on any failure (auth, rules, size, network).
 */
export async function saveTemplate(id: string, patch: TemplatePatch): Promise<TemplateRecord> {
  assertSignedIn();
  const cleanId = slugifyTemplateId(id);
  if (!cleanId) throw new Error("Template name is required.");

  const payload: Record<string, unknown> = {
    id: cleanId,
    type: "html",
    deleted: false,
    updatedAt: new Date().toISOString(),
  };
  if (patch.name !== undefined) payload.name = patch.name.trim() || humanizeTemplateId(cleanId);
  if (patch.content !== undefined) payload.content = patch.content;
  if (patch.design !== undefined) {
    payload.design = patch.design;
    payload.hasDesign = Boolean(patch.design);
  }
  if (patch.subject !== undefined) payload.subject = patch.subject;
  if (patch.whatsappLink !== undefined) payload.whatsappLink = patch.whatsappLink;

  const safe = toFirestoreSafe(payload);
  const bytes = new Blob([JSON.stringify(safe)]).size;
  if (bytes > MAX_TEMPLATE_BYTES) {
    throw new Error(
      `Template is too large to save (${Math.round(bytes / 1024)} KB, limit ~930 KB). ` +
        "Host large images on a URL instead of embedding them."
    );
  }

  const ref = doc(db, MAIL_TEMPLATES_COLLECTION, cleanId);
  await setDoc(ref, safe, { merge: true });

  const fresh = await getDoc(ref);
  if (!fresh.exists()) throw new Error("Save could not be verified. Please retry.");
  return toRecord(cleanId, fresh.data());
}

/** Soft-deletes (tombstones) a template so starter files with the same id stay hidden. */
export async function deleteTemplate(id: string): Promise<void> {
  assertSignedIn();
  await setDoc(
    doc(db, MAIL_TEMPLATES_COLLECTION, id),
    { id, deleted: true, deletedAt: new Date().toISOString() },
    { merge: true }
  );
}

/* ------------------------------------------------------------------ */
/* Legacy browser cache recovery                                       */
/* ------------------------------------------------------------------ */

const LEGACY_TEMPLATES_KEY = "gdg_mail_custom_templates";
const LEGACY_DELETED_KEY = "gdg_mail_deleted_templates";

interface LegacyTemplate {
  id: string;
  name?: string;
  content?: string;
  design?: unknown;
  subject?: string;
  whatsappLink?: string;
  updatedAt?: string;
}

function readLegacyTemplates(): LegacyTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LEGACY_TEMPLATES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Record<string, LegacyTemplate>;
    return Object.values(parsed).filter((t) => t && typeof t.id === "string");
  } catch {
    return [];
  }
}

/**
 * Older Mail Studio builds kept edits in localStorage when Firestore writes
 * failed silently. Push any of those that are newer than the cloud copy so
 * no work is lost, then clear the legacy keys. Returns recovered names.
 */
export async function recoverLegacyBrowserTemplates(): Promise<string[]> {
  const legacy = readLegacyTemplates();
  if (legacy.length === 0 || !auth.currentUser) return [];

  const recovered: string[] = [];
  const failed: LegacyTemplate[] = [];

  for (const tpl of legacy) {
    if (!tpl.content && !tpl.design) continue;
    try {
      const snap = await getDoc(doc(db, MAIL_TEMPLATES_COLLECTION, tpl.id));
      const cloud = snap.exists() ? snap.data() : null;
      if (cloud?.deleted === true) continue;
      const cloudTime = typeof cloud?.updatedAt === "string" ? Date.parse(cloud.updatedAt) : 0;
      const localTime = tpl.updatedAt ? Date.parse(tpl.updatedAt) : 0;
      const cloudHasContent = Boolean(cloud?.content);
      if (cloudHasContent && cloudTime >= localTime) continue;

      await saveTemplate(tpl.id, {
        name: tpl.name || humanizeTemplateId(tpl.id),
        content: tpl.content,
        design: tpl.design ?? null,
        subject: tpl.subject,
        whatsappLink: tpl.whatsappLink,
      });
      recovered.push(tpl.name || tpl.id);
    } catch {
      failed.push(tpl);
    }
  }

  try {
    if (failed.length === 0) {
      window.localStorage.removeItem(LEGACY_TEMPLATES_KEY);
      window.localStorage.removeItem(LEGACY_DELETED_KEY);
    } else {
      const map = Object.fromEntries(failed.map((t) => [t.id, t]));
      window.localStorage.setItem(LEGACY_TEMPLATES_KEY, JSON.stringify(map));
    }
  } catch {
    /* storage unavailable — nothing to clean */
  }

  return recovered;
}

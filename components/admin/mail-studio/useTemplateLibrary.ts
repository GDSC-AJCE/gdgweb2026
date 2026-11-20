"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import {
  deleteTemplate,
  describeTemplateError,
  getStarterTemplate,
  getTemplate,
  humanizeTemplateId,
  listAllTemplates,
  recoverLegacyBrowserTemplates,
  saveTemplate,
  slugifyTemplateId,
  type TemplatePatch,
  type TemplateRecord,
  type TemplateSummary,
} from "@/lib/mail-templates";
import type { SaveState } from "./types";

const ACTIVE_TEMPLATE_KEY = "gdg_mail_active_template";

function readStoredActiveId(): string | null {
  try {
    return window.localStorage.getItem(ACTIVE_TEMPLATE_KEY);
  } catch {
    return null;
  }
}

function storeActiveId(id: string): void {
  try {
    window.localStorage.setItem(ACTIVE_TEMPLATE_KEY, id);
  } catch {
    /* per-viewer convenience only */
  }
}

export interface TemplateDetailsDraft {
  subject: string;
  whatsappLink: string;
}

export interface TemplateLibrary {
  templates: TemplateSummary[];
  loadingList: boolean;
  activeId: string | null;
  active: TemplateRecord | null;
  loadingActive: boolean;
  saveState: SaveState;
  lastError: string | null;
  isSignedIn: boolean;
  details: TemplateDetailsDraft;
  detailsDirty: boolean;
  setDetails: (patch: Partial<TemplateDetailsDraft>) => void;
  select: (id: string) => void;
  refresh: () => Promise<void>;
  saveContent: (input: { content: string; design: unknown }, id?: string) => Promise<TemplateRecord | null>;
  saveDetails: () => Promise<TemplateRecord | null>;
  saveAs: (name: string, patch: TemplatePatch) => Promise<TemplateRecord | null>;
  rename: (name: string) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  loadForSend: () => Promise<TemplateRecord>;
  restoreStarter: (id: string) => Promise<boolean>;
  /** Bumps when template content changes outside the visual editor. */
  revision: number;
}

export function useTemplateLibrary(): TemplateLibrary {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [active, setActive] = useState<TemplateRecord | null>(null);
  const [loadingActive, setLoadingActive] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [lastError, setLastError] = useState<string | null>(null);
  const [details, setDetailsState] = useState<TemplateDetailsDraft>({ subject: "", whatsappLink: "" });
  const [revision, setRevision] = useState(0);
  const loadSeq = useRef(0);
  const recoveredFor = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    setLoadingList(true);
    try {
      const list = await listAllTemplates();
      setTemplates(list);
      setActiveId((current) => {
        if (current && list.some((t) => t.id === current)) return current;
        const stored = readStoredActiveId();
        if (stored && list.some((t) => t.id === stored)) return stored;
        return list[0]?.id ?? null;
      });
    } catch (err) {
      toast.error(`Could not load templates: ${describeTemplateError(err)}`);
    } finally {
      setLoadingList(false);
    }
  }, []);

  // Initial load + one-time recovery of edits stranded in old browser caches.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (user && recoveredFor.current !== user.uid) {
        recoveredFor.current = user.uid;
        try {
          const recovered = await recoverLegacyBrowserTemplates();
          if (!cancelled && recovered.length > 0) {
            toast.success(
              `Recovered ${recovered.length} unsaved template${recovered.length > 1 ? "s" : ""} from this browser and saved to the cloud.`
            );
          }
        } catch {
          /* recovery is best-effort */
        }
      }
      if (!cancelled) await refresh();
    })();
    return () => {
      cancelled = true;
    };
  }, [user, refresh]);

  // Load the full record whenever the selection changes.
  useEffect(() => {
    if (!activeId) {
      setActive(null);
      return;
    }
    storeActiveId(activeId);
    const seq = ++loadSeq.current;
    setLoadingActive(true);
    getTemplate(activeId)
      .then((record) => {
        if (seq !== loadSeq.current) return;
        setActive(record);
        setDetailsState({
          subject: record?.subject ?? "",
          whatsappLink: record?.whatsappLink ?? "",
        });
      })
      .catch((err) => {
        if (seq !== loadSeq.current) return;
        setActive(null);
        toast.error(`Could not open template: ${describeTemplateError(err)}`);
      })
      .finally(() => {
        if (seq === loadSeq.current) setLoadingActive(false);
      });
  }, [activeId]);

  const upsertSummary = useCallback((record: TemplateRecord) => {
    setTemplates((prev) => {
      const rest = prev.filter((t) => t.id !== record.id);
      const summary: TemplateSummary = {
        id: record.id,
        name: record.name,
        hasDesign: record.hasDesign,
        type: record.type,
        source: "cloud",
        updatedAt: record.updatedAt,
      };
      return [...rest, summary].sort((a, b) => a.name.localeCompare(b.name));
    });
  }, []);

  /** Persists a patch; promotes starter templates to cloud templates on first save. */
  const persist = useCallback(
    async (id: string, patch: TemplatePatch): Promise<TemplateRecord | null> => {
      setSaveState("saving");
      setLastError(null);
      try {
        // First save of a starter template: copy its HTML/design so the new
        // cloud doc is complete (a content-less doc would shadow the starter).
        let base: TemplatePatch = {};
        const isStarter = templates.find((t) => t.id === id)?.source === "starter";
        if (isStarter) {
          const starter = active && active.id === id ? active : await getTemplate(id);
          if (starter) base = { name: starter.name, content: starter.content, design: starter.design };
        }
        const record = await saveTemplate(id, { ...base, ...patch });
        upsertSummary(record);
        if (record.id === activeId || record.id === id) {
          setActive(record);
        }
        setSaveState("saved");
        return record;
      } catch (err) {
        const message = describeTemplateError(err);
        setSaveState("error");
        setLastError(message);
        toast.error(`Not saved: ${message}`);
        return null;
      }
    },
    [active, activeId, templates, upsertSummary]
  );

  const saveContent = useCallback(
    async (input: { content: string; design: unknown }, id?: string) => {
      const targetId = id ?? activeId;
      if (!targetId) {
        toast.error("Select or create a template first.");
        return null;
      }
      return persist(targetId, { content: input.content, design: input.design ?? null });
    },
    [activeId, persist]
  );

  const saveDetails = useCallback(async () => {
    if (!activeId) return null;
    const record = await persist(activeId, {
      subject: details.subject.trim(),
      whatsappLink: details.whatsappLink.trim(),
    });
    if (record) toast.success("Subject and links saved.");
    return record;
  }, [activeId, details, persist]);

  const saveAs = useCallback(
    async (name: string, patch: TemplatePatch) => {
      const id = slugifyTemplateId(name);
      if (!id) {
        toast.error("Enter a template name.");
        return null;
      }
      const record = await persist(id, { name: name.trim() || humanizeTemplateId(id), ...patch });
      if (record) {
        setRevision((r) => r + 1);
        setActiveId(record.id);
        setActive(record);
        setDetailsState({ subject: record.subject ?? "", whatsappLink: record.whatsappLink ?? "" });
      }
      return record;
    },
    [persist]
  );

  const rename = useCallback(
    async (name: string) => {
      if (!activeId || !name.trim()) return false;
      const record = await persist(activeId, { name: name.trim() });
      if (record) toast.success(`Renamed to “${record.name}”.`);
      return Boolean(record);
    },
    [activeId, persist]
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        await deleteTemplate(id);
        const remaining = templates.filter((t) => t.id !== id);
        setTemplates(remaining);
        if (activeId === id) setActiveId(remaining[0]?.id ?? null);
        toast.success("Template deleted.");
        return true;
      } catch (err) {
        toast.error(`Delete failed: ${describeTemplateError(err)}`);
        return false;
      }
    },
    [activeId, templates]
  );

  /** Re-reads the saved template right before sending so nothing stale goes out. */
  const loadForSend = useCallback(async (): Promise<TemplateRecord> => {
    if (!activeId) throw new Error("Select a template before sending.");
    const record = await getTemplate(activeId);
    if (!record) throw new Error("This template no longer exists.");
    if (!record.content.trim()) {
      throw new Error("This template has no HTML yet. Open it in the Visual Editor and save it.");
    }
    return record;
  }, [activeId]);

  const restoreStarter = useCallback(
    async (id: string) => {
      const starter = await getStarterTemplate(id).catch(() => null);
      if (!starter) {
        toast.error("No original version is available for this template.");
        return false;
      }
      const record = await persist(id, { content: starter.content, design: starter.design });
      if (!record) return false;
      setRevision((r) => r + 1);
      setActiveId(id);
      setActive(record);
      toast.success(`Restored the original “${record.name}”.`);
      return true;
    },
    [persist]
  );

  const setDetails = useCallback((patch: Partial<TemplateDetailsDraft>) => {
    setDetailsState((prev) => ({ ...prev, ...patch }));
  }, []);

  const detailsDirty = useMemo(() => {
    if (!active) return false;
    return (
      details.subject.trim() !== (active.subject ?? "").trim() ||
      details.whatsappLink.trim() !== (active.whatsappLink ?? "").trim()
    );
  }, [active, details]);

  return {
    templates,
    loadingList,
    activeId,
    active,
    loadingActive,
    saveState,
    lastError,
    isSignedIn: Boolean(user),
    details,
    detailsDirty,
    setDetails,
    select: setActiveId,
    refresh,
    saveContent,
    saveDetails,
    saveAs,
    rename,
    remove,
    loadForSend,
    restoreStarter,
    revision,
  };
}

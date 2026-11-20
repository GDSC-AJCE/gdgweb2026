"use client";

import { useCallback, useEffect, useImperativeHandle, useRef, useState, type Ref } from "react";
import {
  RiArrowLeftLine,
  RiCodeSSlashLine,
  RiMoreFill,
  RiPenNibLine,
  RiSave3Line,
  RiSparkling2Line,
} from "@remixicon/react";
import { Button } from "@/components/base/buttons/button";
import { Select, SelectItem } from "@/components/base/select/select";
import type { TemplateRecord, TemplateSummary } from "@/lib/mail-templates";
import { cx } from "@/utils/cx";
import { ActionMenu } from "./TemplateStrip";
import { MERGE_TAGS } from "./types";
import { Spinner } from "./ui";

/* Minimal typing for the Unlayer embed global. */
interface UnlayerExport {
  html: string;
  design: unknown;
}
interface UnlayerApi {
  init: (opts: Record<string, unknown>) => void;
  loadDesign: (design: unknown) => void;
  exportHtml: (cb: (data: UnlayerExport) => void) => void;
  addEventListener: (event: string, cb: () => void) => void;
}
declare global {
  interface Window {
    unlayer?: UnlayerApi;
  }
}

const UNLAYER_SRC = "https://editor.unlayer.com/embed.js";
const CONTAINER_ID = "mail-studio-unlayer";

export interface VisualEditorHandle {
  isDirty: () => boolean;
  save: () => Promise<boolean>;
  exportHtml: () => Promise<UnlayerExport | null>;
  loadExternal: (design: unknown, html: string) => void;
  replaceWithHtml: (html: string) => void;
}

interface VisualEditorProps {
  ref?: Ref<VisualEditorHandle>;
  visible: boolean;
  record: TemplateRecord | null;
  /** Changes when content was replaced outside the editor (restore, AI save). */
  revision: number;
  templates: TemplateSummary[];
  saving: boolean;
  onSave: (html: string, design: unknown) => Promise<boolean>;
  onSwitchTemplate: (id: string) => void;
  onDirtyChange: (dirty: boolean) => void;
  onBack: () => void;
  onOpenAiAssist: () => void;
  onExportHtml: (html: string) => void;
  onImportFigma: () => void;
}

function htmlToDesign(html: string) {
  return {
    counters: { u_row: 1, u_column: 1, u_content_html: 1 },
    body: {
      rows: [{ cells: [1], columns: [{ contents: [{ type: "html", values: { html } }] }] }],
      values: { backgroundColor: "#f8fafc", contentWidth: "600px" },
    },
  };
}

function isUnlayerDesign(design: unknown): boolean {
  const body = (design as { body?: { rows?: unknown } } | null)?.body;
  return Array.isArray(body?.rows);
}

function loadScript(): Promise<void> {
  if (window.unlayer) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${UNLAYER_SRC}"]`);
    const script = existing ?? document.createElement("script");
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("Could not load the visual editor.")), { once: true });
    if (!existing) {
      script.src = UNLAYER_SRC;
      script.async = true;
      document.body.appendChild(script);
    }
  });
}

export function VisualEditor({
  ref,
  visible,
  record,
  revision,
  templates,
  saving,
  onSave,
  onSwitchTemplate,
  onDirtyChange,
  onBack,
  onOpenAiAssist,
  onExportHtml,
  onImportFigma,
}: VisualEditorProps) {
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dirty, setDirtyState] = useState(false);
  const initStarted = useRef(false);
  const loadedId = useRef<string | null>(null);
  const loadedRevision = useRef<number>(-1);
  const suppressDirty = useRef(false);
  const dirtyRef = useRef(false);
  const pendingExternal = useRef<{ design: unknown; html: string } | null>(null);
  const autoSaveAfterLoad = useRef(false);
  const saveRef = useRef<() => Promise<boolean>>(async () => false);

  const setDirty = useCallback(
    (value: boolean) => {
      dirtyRef.current = value;
      setDirtyState(value);
      onDirtyChange(value);
    },
    [onDirtyChange]
  );

  const apply = useCallback((design: unknown, html: string) => {
    const api = window.unlayer;
    if (!api) return;
    suppressDirty.current = true;
    api.loadDesign(isUnlayerDesign(design) ? design : htmlToDesign(html || "<p></p>"));
  }, []);

  // Lazy-init Unlayer the first time the editor is shown.
  useEffect(() => {
    if (!visible || initStarted.current) return;
    initStarted.current = true;
    loadScript()
      .then(() => {
        const api = window.unlayer!;
        api.init({
          id: CONTAINER_ID,
          projectId: 0,
          displayMode: "email",
          appearance: { theme: "modern_light", panels: { tools: { dock: "left" } } },
          mergeTags: Object.fromEntries(
            MERGE_TAGS.map(({ tag, label }) => [tag.replace(/[{}]/g, ""), { name: label, value: tag }])
          ),
        });
        api.addEventListener("editor:ready", () => setReady(true));
        api.addEventListener("design:loaded", () => {
          suppressDirty.current = false;
          if (autoSaveAfterLoad.current) {
            autoSaveAfterLoad.current = false;
            window.setTimeout(() => void saveRef.current(), 0);
          }
        });
        api.addEventListener("design:updated", () => {
          if (!suppressDirty.current && !dirtyRef.current) setDirty(true);
        });
      })
      .catch((err: Error) => setLoadError(err.message));
  }, [visible, setDirty]);

  // Load the selected template when it changes (not after our own saves).
  // External designs (Gemini / Figma) queued before Unlayer was ready win.
  useEffect(() => {
    if (!ready || !record) return;
    if (pendingExternal.current) {
      const { design, html } = pendingExternal.current;
      pendingExternal.current = null;
      loadedId.current = record.id;
      loadedRevision.current = revision;
      apply(design, html);
      setDirty(true);
      return;
    }
    if (loadedId.current === record.id && loadedRevision.current === revision) return;
    loadedId.current = record.id;
    loadedRevision.current = revision;
    // Imported designs (e.g. Figma) may have no HTML yet — save once loaded.
    autoSaveAfterLoad.current = !record.content.trim() && isUnlayerDesign(record.design);
    apply(record.design, record.content);
    setDirty(false);
  }, [ready, record, revision, apply, setDirty]);

  const exportHtml = useCallback(
    () =>
      new Promise<UnlayerExport | null>((resolve) => {
        if (!window.unlayer || !ready) return resolve(null);
        window.unlayer.exportHtml((data) => resolve(data));
      }),
    [ready]
  );

  const save = useCallback(async () => {
    const data = await exportHtml();
    if (!data) return false;
    const ok = await onSave(data.html, data.design);
    if (ok) setDirty(false);
    return ok;
  }, [exportHtml, onSave, setDirty]);

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  useImperativeHandle(
    ref,
    () => ({
      isDirty: () => dirtyRef.current,
      save,
      exportHtml,
      loadExternal: (design, html) => {
        if (!ready || !record) {
          pendingExternal.current = { design, html };
          return;
        }
        loadedId.current = record.id;
        apply(design, html);
        setDirty(true);
      },
      replaceWithHtml: (html) => {
        apply(null, html);
        setDirty(true);
      },
    }),
    [save, exportHtml, apply, setDirty, record, ready]
  );

  // Ctrl/Cmd + S while the editor is open.
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, save]);

  // Warn before closing the tab with unsaved design changes.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const status = saving ? "Saving…" : dirty ? "Unsaved changes" : record ? "All changes saved" : "";

  return (
    <div
      className={cx(
        "flex h-[calc(100vh-11rem)] min-h-[620px] flex-col overflow-hidden rounded-3xl border border-separator-border bg-background-primary-default shadow-card",
        !visible && "hidden",
      )}
    >
      <div className="flex flex-none flex-wrap items-center gap-2 border-b border-separator-border px-3 py-2.5 sm:px-4">
        <Button variant="ghost" size="small" leadingIcon={RiArrowLeftLine} onClick={onBack}>
          <span className="hidden sm:inline">Compose</span>
        </Button>
        <span aria-hidden className="mx-1 hidden h-5 w-px bg-separator-border sm:block" />
        <Select
          aria-label="Template being edited"
          size="sm"
          selectedKey={record?.id ?? null}
          onSelectionChange={(key) => key !== null && onSwitchTemplate(String(key))}
          triggerClassName="w-44 sm:w-56"
        >
          {templates.map((t) => (
            <SelectItem key={t.id} id={t.id} textValue={t.name}>
              {t.name}
            </SelectItem>
          ))}
        </Select>
        <span
          className={cx(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-caption-1-medium",
            dirty ? "bg-status-yellow-background text-status-yellow-text" : "text-text-secondary",
          )}
          aria-live="polite"
        >
          <span aria-hidden className={cx("size-1.5 rounded-full", dirty ? "bg-current" : "bg-fresh-grass")} />
          {status}
        </span>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="secondary" size="small" leadingIcon={RiSparkling2Line} onClick={onOpenAiAssist} disabled={!ready}>
            <span className="hidden md:inline">AI assist</span>
          </Button>
          <ActionMenu
            label="More editor actions"
            triggerClassName="flex size-8 items-center justify-center rounded-lg border border-border-button-default bg-background-primary-default text-foreground-icon-primary shadow-xs hover:bg-background-primary-hover"
            trigger={<RiMoreFill className="size-[18px]" aria-hidden />}
            actions={[
              { label: "Import from Figma", icon: RiPenNibLine, onSelect: onImportFigma },
              {
                label: "Export HTML",
                icon: RiCodeSSlashLine,
                onSelect: () => {
                  void exportHtml().then((data) => data && onExportHtml(data.html));
                },
              },
            ]}
          />
          <Button
            variant="primary"
            size="small"
            leadingIcon={saving ? Spinner : RiSave3Line}
            onClick={() => void save()}
            disabled={!ready || saving || !record}
            title="Save (Ctrl+S)"
          >
            Save
          </Button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <div id={CONTAINER_ID} className="h-full w-full" />
        {!ready && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background-primary-default text-body-regular text-text-secondary">
            {loadError ? (
              <span className="text-text-error-primary">{loadError}</span>
            ) : (
              <>
                <Spinner className="size-5" aria-hidden /> Loading visual editor…
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

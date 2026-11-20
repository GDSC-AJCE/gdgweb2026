"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RiCloseLine, RiFileTextLine, RiGroupLine, RiPriceTag3Line, RiSendPlaneLine } from "@remixicon/react";
import { toast } from "@/components/ui";
import GeminiMailStudio from "@/components/admin/tabs/GeminiMailStudio";
import { useAuth } from "@/context/AuthContext";
import { humanizeTemplateId, slugifyTemplateId } from "@/lib/mail-templates";
import { cx } from "@/utils/cx";
import { buildBlankTemplate } from "./blankTemplate";
import { MessageCard } from "./MessageCard";
import { PreviewPanel } from "./PreviewPanel";
import { RecipientsCard } from "./RecipientsCard";
import { SendRail, type ReadinessItem } from "./SendRail";
import { StatTiles, StudioToolbar } from "./StudioOverview";
import { TemplateStrip } from "./TemplateStrip";
import { VisualEditor, type VisualEditorHandle } from "./VisualEditor";
import { AiAssistDialog, SubjectIdeasDialog } from "./dialogs/AiDialogs";
import { DeliveryDialog } from "./dialogs/DeliveryDialog";
import { DeleteTemplateDialog, TemplateNameDialog } from "./dialogs/TemplateDialogs";
import { ExportHtmlDialog, FigmaImportDialog, SetupGuideDialog, TestEmailDialog } from "./dialogs/ToolDialogs";
import { getErrorMessage, type StudioView } from "./types";
import { useDeliverySettings } from "./useDeliverySettings";
import { useEmailPreview, useMailSender } from "./useMailDispatch";
import { useRecipients } from "./useRecipients";
import { useTemplateLibrary } from "./useTemplateLibrary";

type NameDialogState = { mode: "create" | "rename" } | null;

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function MailStudio() {
  const { user } = useAuth();
  const library = useTemplateLibrary();
  const delivery = useDeliverySettings();
  const recipients = useRecipients();
  const editorRef = useRef<VisualEditorHandle>(null);

  const [view, setView] = useState<StudioView>("compose");
  const [editorDirty, setEditorDirty] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [nameDialog, setNameDialog] = useState<NameDialogState>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [testOpen, setTestOpen] = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [figmaOpen, setFigmaOpen] = useState(false);
  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [exportedHtml, setExportedHtml] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const { active, details, setDetails } = library;

  /* ---------- Defaults from server config and the Event Mailer hand-off ---------- */

  const serverSheetId = delivery.serverExtras.sheetId;
  const { setSheetId } = recipients;
  useEffect(() => {
    if (serverSheetId) setSheetId((curr) => curr || serverSheetId);
  }, [serverSheetId, setSheetId]);

  const { title: eventTitle, whatsappLink: eventWhatsapp } = recipients.eventHandoff;
  useEffect(() => {
    if (!active) return;
    const patch: { subject?: string; whatsappLink?: string } = {};
    if (eventWhatsapp && !active.whatsappLink) patch.whatsappLink = eventWhatsapp;
    if (eventTitle && !active.subject) patch.subject = `Update regarding ${eventTitle} — GDG on Campus AJCE`;
    if (Object.keys(patch).length) setDetails(patch);
  }, [active, eventTitle, eventWhatsapp, setDetails]);

  /* ---------- Unsaved-design guard ---------- */

  const flushEditor = useCallback(async (): Promise<boolean> => {
    const editor = editorRef.current;
    if (!editor?.isDirty()) return true;
    const ok = await editor.save();
    if (ok) toast.success("Design changes saved.");
    return ok;
  }, []);

  const changeView = useCallback(
    async (next: StudioView) => {
      if (next === view) return;
      if (view === "editor" && !(await flushEditor())) return;
      setView(next);
    },
    [view, flushEditor],
  );

  const selectTemplate = useCallback(
    async (id: string) => {
      if (id === library.activeId) return true;
      if (!(await flushEditor())) return false;
      library.select(id);
      return true;
    },
    [flushEditor, library],
  );

  const openEditorFor = useCallback(
    async (id: string) => {
      if (await selectTemplate(id)) setView("editor");
    },
    [selectTemplate],
  );

  /* ---------- Template actions ---------- */

  const saveDesign = useCallback(
    async (html: string, design: unknown) => {
      const record = await library.saveContent({ content: html, design });
      if (record) toast.success(`Saved “${record.name}”.`);
      return Boolean(record);
    },
    [library],
  );

  const createTemplate = useCallback(
    async (name: string) => {
      if (!(await flushEditor())) return false;
      const record = await library.saveAs(name, buildBlankTemplate(name));
      if (!record) return false;
      toast.success(`Created “${record.name}”. Design it, then press Save.`);
      setView("editor");
      return true;
    },
    [flushEditor, library],
  );

  const importFigma = useCallback(
    async ({ url, token, name }: { url: string; token: string; name: string }) => {
      const res = await fetch("/api/mail-sender/figma/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ figmaUrl: url, accessToken: token, templateName: slugifyTemplateId(name) }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string; design?: unknown };
      if (!data.success || !data.design) throw new Error(data.error || "Figma import failed.");
      if (!(await flushEditor())) throw new Error("Save your current design first.");
      // The editor generates and saves the HTML as soon as this design loads.
      const record = await library.saveAs(name, { design: data.design, content: "" });
      if (!record) throw new Error("Imported, but the template could not be saved.");
      setView("editor");
      toast.success("Figma frame imported. Generating HTML…");
    },
    [flushEditor, library],
  );

  const saveFromGemini = useCallback(
    async (id: string, html: string, design: unknown) => {
      const existing = library.templates.find((t) => t.id === id);
      const record = await library.saveAs(existing?.name || humanizeTemplateId(id), { content: html, design: design ?? null });
      if (!record) throw new Error(library.lastError || "Template was not saved.");
    },
    [library],
  );

  /* ---------- Sending ---------- */

  const sender = useMailSender((email, ok) => recipients.markStatus(email, ok ? "Sent" : "Failed"));

  const prepareDispatch = useCallback(async () => {
    if (!(await flushEditor())) throw new Error("Design changes could not be saved.");
    if (library.detailsDirty && !(await library.saveDetails())) {
      throw new Error("Subject / link changes could not be saved.");
    }
    const subject = details.subject.trim();
    if (!subject) throw new Error("Add a subject line first.");
    const record = await library.loadForSend();
    return { record, subject, whatsappLink: details.whatsappLink.trim(), delivery: delivery.settings };
  }, [flushEditor, library, details, delivery.settings]);

  const sendTest = useCallback(async (to: string) => sender.sendTest(to, await prepareDispatch()), [sender, prepareDispatch]);

  const sendAll = useCallback(async () => {
    setPreparing(true);
    try {
      const req = await prepareDispatch();
      setPreparing(false);
      await sender.sendBatch(recipients.selected, req);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setPreparing(false);
    }
  }, [prepareDispatch, sender, recipients.selected]);

  const sample = recipients.selected[0] ?? recipients.recipients[0];
  const preview = useEmailPreview(active, sample, details.whatsappLink);

  const deliveryLabel = delivery.settings.engine === "gateway" ? "Gateway" : "Gmail";
  const deliveryCaption = !delivery.isConfigured
    ? "Not configured yet"
    : delivery.gatewayStatus.tested
      ? delivery.gatewayStatus.online
        ? "Online · tested"
        : "Offline — check settings"
      : `From ${delivery.settings.senderEmail}`;

  const readiness: ReadinessItem[] = useMemo(
    () => [
      {
        id: "template",
        label: "Template",
        ok: Boolean(active?.content.trim()),
        detail: !active ? "Pick a template" : editorDirty ? "Unsaved design changes — saved before sending" : active.name,
        icon: RiFileTextLine,
        tone: "bg-status-yellow-background text-status-yellow-text",
        onFix: () => scrollToId("mail-templates-heading"),
      },
      {
        id: "subject",
        label: "Subject line",
        ok: details.subject.trim().length > 0,
        detail: details.subject.trim() || "Add a subject",
        icon: RiPriceTag3Line,
        tone: "bg-status-orange-background text-status-orange-text",
        onFix: () => document.getElementById("mail-subject")?.focus(),
      },
      {
        id: "recipients",
        label: "Recipients",
        ok: recipients.selected.length > 0,
        detail: recipients.selected.length ? `${recipients.selected.length} selected` : "Import a list",
        icon: RiGroupLine,
        tone: "bg-status-blue-background text-status-blue-text",
        onFix: () => scrollToId("mail-recipients"),
      },
      {
        id: "delivery",
        label: "Delivery",
        ok: delivery.isConfigured,
        detail: deliveryCaption,
        icon: RiSendPlaneLine,
        tone: "bg-status-purple-background text-status-purple-text",
        onFix: () => setDeliveryOpen(true),
      },
    ],
    [active, editorDirty, details.subject, recipients.selected.length, delivery.isConfigured, deliveryCaption],
  );
  const remainingSteps = readiness.filter((r) => !r.ok).length;

  /* ---------- Render ---------- */

  const sending = sender.progress.running;
  const deleteTarget = deleteId ? library.templates.find((t) => t.id === deleteId) : null;

  return (
    <div className="@container space-y-5">
      <StudioToolbar
        view={view}
        onViewChange={(v) => void changeView(v)}
        editorDirty={editorDirty}
        saveState={library.saveState}
        signedIn={Boolean(user)}
      />

      {aiSummary && view === "editor" && (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-notification-success-background px-4 py-3 text-body-regular text-notification-success-foreground">
          <span>
            <span className="text-body-semibold">AI update applied.</span> {aiSummary} Press Save to keep it.
          </span>
          <button type="button" onClick={() => setAiSummary(null)} aria-label="Dismiss" className="rounded-full p-1 hover:bg-background-primary-default/40">
            <RiCloseLine className="size-4" aria-hidden />
          </button>
        </div>
      )}

      {/* ---------------- Compose & send ---------------- */}
      <div className={cx("space-y-5", view !== "compose" && "hidden")}>
        <StatTiles
          templateCount={library.templates.length}
          activeTemplateName={active?.name}
          selectedRecipients={recipients.selected.length}
          totalRecipients={recipients.recipients.length}
          deliveryLabel={deliveryLabel}
          deliveryCaption={deliveryCaption}
          progress={sender.progress}
          remainingSteps={remainingSteps}
          onCreateTemplate={() => setNameDialog({ mode: "create" })}
          onGoToRecipients={() => scrollToId("mail-recipients")}
          onOpenDelivery={() => setDeliveryOpen(true)}
          onReview={() => scrollToId("mail-send-rail")}
        />

        <TemplateStrip
          templates={library.templates}
          activeId={library.activeId}
          loading={library.loadingList}
          onSelect={(id) => void selectTemplate(id)}
          onCreate={() => setNameDialog({ mode: "create" })}
          onCreateWithAi={() => void changeView("ai")}
          onImportFigma={() => setFigmaOpen(true)}
          onEditDesign={(id) => void openEditorFor(id)}
          onRename={(id) => {
            void selectTemplate(id).then((ok) => ok && setNameDialog({ mode: "rename" }));
          }}
          onDelete={setDeleteId}
          onRestore={(id) => void library.restoreStarter(id)}
        />

        <div className="grid items-start gap-5 @4xl:grid-cols-[minmax(0,1fr)_360px] @6xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="min-w-0 space-y-5">
            <MessageCard
              record={active}
              loading={library.loadingActive}
              details={details}
              detailsDirty={library.detailsDirty}
              saveState={library.saveState}
              onDetailsChange={setDetails}
              onSaveDetails={() => void library.saveDetails()}
              onEditDesign={() => setView("editor")}
              onSuggestSubjects={() => setSubjectsOpen(true)}
            />
            <RecipientsCard state={recipients} disabled={sending} />
          </div>

          <SendRail
            readiness={readiness}
            recipientCount={recipients.selected.length}
            templateName={active?.name ?? ""}
            subject={details.subject}
            progress={sender.progress}
            preparing={preparing}
            onSendTest={() => setTestOpen(true)}
            onSendAll={() => void sendAll()}
            onCancel={() => void sender.cancel()}
            preview={
              <PreviewPanel
                html={preview.html}
                error={preview.error}
                loading={preview.loading}
                onRefresh={preview.refresh}
                templateName={active?.name}
                subject={details.subject}
                sampleLabel={sample ? sample.name || sample.email : "a sample recipient"}
              />
            }
          />
        </div>
      </div>

      {/* ---------------- Visual editor (kept mounted so Unlayer state survives) ---------------- */}
      <VisualEditor
        ref={editorRef}
        visible={view === "editor"}
        record={active}
        revision={library.revision}
        templates={library.templates}
        saving={library.saveState === "saving"}
        onSave={saveDesign}
        onSwitchTemplate={(id) => void selectTemplate(id)}
        onDirtyChange={setEditorDirty}
        onBack={() => void changeView("compose")}
        onOpenAiAssist={() => setAiOpen(true)}
        onExportHtml={setExportedHtml}
        onImportFigma={() => setFigmaOpen(true)}
      />

      {/* ---------------- AI studio ---------------- */}
      <div className={cx(view !== "ai" && "hidden")}>
        <GeminiMailStudio
          onSaveAsTemplate={saveFromGemini}
          onApplyToDispatch={(id, subject) => {
            if (id && id !== library.activeId) library.select(id);
            if (subject) setDetails({ subject });
            setView("compose");
          }}
          onOpenInUnlayer={(design, html) => {
            setView("editor");
            editorRef.current?.loadExternal(design, html);
          }}
          onSendTestEmail={(subject) => {
            if (subject) setDetails({ subject });
            setTestOpen(true);
          }}
          existingTemplates={library.templates}
          activeTemplate={library.activeId ?? undefined}
        />
      </div>

      {/* ---------------- Dialogs ---------------- */}
      <TemplateNameDialog
        open={nameDialog !== null}
        mode={nameDialog?.mode ?? "create"}
        initialName={nameDialog?.mode === "rename" ? active?.name : ""}
        existingIds={library.templates.map((t) => t.id)}
        currentId={library.activeId ?? undefined}
        onOpenChange={(o) => !o && setNameDialog(null)}
        onSubmit={(name) => (nameDialog?.mode === "rename" ? library.rename(name) : createTemplate(name))}
      />
      <DeleteTemplateDialog
        templateName={deleteTarget ? deleteTarget.name : null}
        onOpenChange={(o) => !o && setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) void library.remove(deleteId);
          setDeleteId(null);
        }}
      />
      <DeliveryDialog
        open={deliveryOpen}
        onOpenChange={setDeliveryOpen}
        state={delivery}
        onShowSetupGuide={() => setGuideOpen(true)}
        onSave={() => void delivery.save({ sheetId: recipients.sheetId, sheetName: recipients.sheetTab })}
      />
      <TestEmailDialog
        open={testOpen}
        onOpenChange={setTestOpen}
        defaultEmail={user?.email ?? ""}
        templateName={active?.name ?? "this template"}
        onSend={sendTest}
      />
      <SetupGuideDialog open={guideOpen} onOpenChange={setGuideOpen} senderEmail={delivery.settings.senderEmail} />
      <FigmaImportDialog open={figmaOpen} onOpenChange={setFigmaOpen} onImport={importFigma} />
      <ExportHtmlDialog open={exportedHtml !== null} onOpenChange={(o) => !o && setExportedHtml(null)} html={exportedHtml ?? ""} />
      <SubjectIdeasDialog
        open={subjectsOpen}
        initialTopic={details.subject || active?.name || ""}
        onOpenChange={setSubjectsOpen}
        onPick={(subject) => setDetails({ subject })}
      />
      <AiAssistDialog
        open={aiOpen}
        onOpenChange={setAiOpen}
        getCurrentHtml={async () => (await editorRef.current?.exportHtml())?.html ?? null}
        onApply={(html, summary) => {
          editorRef.current?.replaceWithHtml(html);
          setAiSummary(summary);
        }}
      />
    </div>
  );
}

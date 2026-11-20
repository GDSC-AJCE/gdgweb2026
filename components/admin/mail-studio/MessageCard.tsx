"use client";

import { useState } from "react";
import {
  RiCheckLine,
  RiFileCopyLine,
  RiLayoutMasonryLine,
  RiMailLine,
  RiSave3Line,
  RiSparkling2Line,
  RiWhatsappLine,
} from "@remixicon/react";
import { Button } from "@/components/base/buttons/button";
import { InputBase } from "@/components/base/input/input";
import { Skeleton, toast } from "@/components/ui";
import type { TemplateRecord } from "@/lib/mail-templates";
import { cx } from "@/utils/cx";
import { MERGE_TAGS, type SaveState } from "./types";
import type { TemplateDetailsDraft } from "./useTemplateLibrary";
import { FieldLabel, Panel, PanelHeader, Spinner, StatusPill } from "./ui";

interface MessageCardProps {
  record: TemplateRecord | null;
  loading: boolean;
  details: TemplateDetailsDraft;
  detailsDirty: boolean;
  saveState: SaveState;
  onDetailsChange: (patch: Partial<TemplateDetailsDraft>) => void;
  onSaveDetails: () => void;
  onEditDesign: () => void;
  onSuggestSubjects: () => void;
}

function MergeTags() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (tag: string) => {
    try {
      await navigator.clipboard.writeText(tag);
      setCopied(tag);
      window.setTimeout(() => setCopied((c) => (c === tag ? null : c)), 1500);
    } catch {
      toast.error("Clipboard is unavailable in this browser.");
    }
  };
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Personalisation tags">
      {MERGE_TAGS.map(({ tag, label }) => (
        <li key={tag}>
          <button
            type="button"
            onClick={() => copy(tag)}
            title={`Copy ${label}`}
            className={cx(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-caption-1-regular transition",
              "outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring",
              copied === tag
                ? "bg-notification-success-background text-notification-success-foreground"
                : "bg-background-secondary-default text-text-secondary hover:bg-background-secondary-hover hover:text-text-primary",
            )}
          >
            {copied === tag ? <RiCheckLine className="size-3.5" aria-hidden /> : <RiFileCopyLine className="size-3.5" aria-hidden />}
            {tag}
          </button>
        </li>
      ))}
    </ul>
  );
}

function TemplateStatus({ record }: { record: TemplateRecord }) {
  if (record.source === "starter") return <StatusPill tone="warning">Starter · saves as your copy</StatusPill>;
  if (!record.content.trim()) return <StatusPill tone="danger">Needs design</StatusPill>;
  return <StatusPill tone="success">Saved in cloud</StatusPill>;
}

export function MessageCard({
  record,
  loading,
  details,
  detailsDirty,
  saveState,
  onDetailsChange,
  onSaveDetails,
  onEditDesign,
  onSuggestSubjects,
}: MessageCardProps) {
  const hasSubject = details.subject.trim().length > 0;
  const saving = saveState === "saving";

  return (
    <Panel labelledBy="mail-message-heading">
      <PanelHeader
        id="mail-message-heading"
        icon={RiMailLine}
        title="Message"
        description="What recipients see in their inbox."
        actions={
          <Button variant="secondary" size="small" leadingIcon={RiLayoutMasonryLine} onClick={onEditDesign} disabled={!record}>
            Edit design
          </Button>
        }
      />

      {loading && !record ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-9 w-full rounded-2lg" />
          <Skeleton className="h-9 w-full rounded-2lg" />
        </div>
      ) : !record ? (
        <p className="rounded-2xl border-2 border-dashed border-separator-border p-6 text-center text-body-regular text-text-secondary">
          Pick or create a template above to start.
        </p>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-background-secondary-default px-4 py-3">
            <div className="min-w-0">
              <p className="text-caption-2-semibold uppercase tracking-wider text-text-tertiary">Template</p>
              <p className="truncate text-body-semibold text-text-primary">{record.name}</p>
            </div>
            <TemplateStatus record={record} />
          </div>

          <div>
            <FieldLabel
              htmlFor="mail-subject"
              hint={
                <button
                  type="button"
                  onClick={onSuggestSubjects}
                  className="inline-flex items-center gap-1 rounded text-caption-1-semibold text-text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring"
                >
                  <RiSparkling2Line className="size-3.5 text-sunshine-pop" aria-hidden /> Suggest with AI
                </button>
              }
            >
              Subject line
            </FieldLabel>
            <InputBase
              id="mail-subject"
              value={details.subject}
              onChange={(e) => onDetailsChange({ subject: e.target.value })}
              placeholder="e.g. You're shortlisted for the GDG AJCE core team 🎉"
              aria-invalid={!hasSubject || undefined}
            />
            {!hasSubject && (
              <p className="mt-1 text-caption-1-regular text-text-error-primary">A subject is required before sending.</p>
            )}
          </div>

          <div>
            <FieldLabel htmlFor="mail-whatsapp" hint={<code className="font-mono">{"{{whatsapp_link}}"}</code>}>
              WhatsApp group link
            </FieldLabel>
            <InputBase
              id="mail-whatsapp"
              type="url"
              inputMode="url"
              leadingIcon={RiWhatsappLine}
              value={details.whatsappLink}
              onChange={(e) => onDetailsChange({ whatsappLink: e.target.value })}
              placeholder="https://chat.whatsapp.com/…"
            />
          </div>

          <div>
            <p className="mb-2 text-body-medium text-text-primary">
              Personalisation tags <span className="text-caption-1-regular text-text-tertiary">— click to copy</span>
            </p>
            <MergeTags />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-separator-border pt-4">
            <span className="text-caption-1-regular text-text-secondary" aria-live="polite">
              {detailsDirty ? "Unsaved changes" : "All changes saved"}
            </span>
            <Button
              variant="primary"
              size="small"
              leadingIcon={saving ? Spinner : RiSave3Line}
              onClick={onSaveDetails}
              disabled={!detailsDirty || saving}
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </Panel>
  );
}

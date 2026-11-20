"use client";

import type { ReactNode } from "react";
import {
  RiCloudLine,
  RiCloudOffLine,
  RiLayoutMasonryLine,
  RiMailSendLine,
  RiSparkling2Line,
} from "@remixicon/react";
import { cx } from "@/utils/cx";
import type { SaveState, SendProgress, StudioView } from "./types";
import { RoundArrow, Spinner, type IconComponent } from "./ui";

/* ------------------------------------------------------------------ */
/* View switcher + sync status                                         */
/* ------------------------------------------------------------------ */

const VIEWS: ReadonlyArray<{ id: StudioView; label: string; icon: IconComponent }> = [
  { id: "compose", label: "Compose & send", icon: RiMailSendLine },
  { id: "editor", label: "Visual editor", icon: RiLayoutMasonryLine },
  { id: "ai", label: "AI studio", icon: RiSparkling2Line },
];

interface StudioToolbarProps {
  view: StudioView;
  onViewChange: (view: StudioView) => void;
  editorDirty: boolean;
  saveState: SaveState;
  signedIn: boolean;
}

export function StudioToolbar({ view, onViewChange, editorDirty, saveState, signedIn }: StudioToolbarProps) {
  const sync = !signedIn
    ? { icon: RiCloudOffLine, text: "Read-only · signed out", tone: "text-text-error-primary" }
    : saveState === "saving"
      ? { icon: Spinner, text: "Saving…", tone: "text-text-secondary" }
      : saveState === "error"
        ? { icon: RiCloudOffLine, text: "Last save failed", tone: "text-text-error-primary" }
        : { icon: RiCloudLine, text: "Synced to Firestore", tone: "text-text-secondary" };
  const SyncIcon = sync.icon;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div
        role="tablist"
        aria-label="Mail Studio views"
        className="inline-flex w-full gap-1 overflow-x-auto rounded-full border border-separator-border bg-background-primary-default p-1 shadow-card sm:w-auto"
        onKeyDown={(e) => {
          if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
          const idx = VIEWS.findIndex((v) => v.id === view);
          const next = VIEWS[(idx + (e.key === "ArrowRight" ? 1 : VIEWS.length - 1)) % VIEWS.length];
          onViewChange(next.id);
          (e.currentTarget.querySelector(`[data-view="${next.id}"]`) as HTMLElement | null)?.focus();
        }}
      >
        {VIEWS.map(({ id, label, icon: Icon }) => {
          const selected = id === view;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              data-view={id}
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => onViewChange(id)}
              className={cx(
                "relative inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-body-medium transition-colors",
                "outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring",
                selected
                  ? "bg-text-primary text-background-primary-default shadow-xs"
                  : "text-text-secondary hover:bg-background-secondary-default hover:text-text-primary",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {label}
              {id === "editor" && editorDirty && (
                <span className="size-1.5 rounded-full bg-sunshine-pop" aria-label="unsaved changes" />
              )}
            </button>
          );
        })}
      </div>
      <span className={cx("inline-flex items-center gap-1.5 text-caption-1-medium", sync.tone)} aria-live="polite">
        <SyncIcon className="size-4" aria-hidden />
        {sync.text}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stat tiles                                                          */
/* ------------------------------------------------------------------ */

interface StatTileProps {
  title: string;
  caption: string;
  value: ReactNode;
  tone: string;
  actionLabel: string;
  onAction: () => void;
}

function StatTile({ title, caption, value, tone, actionLabel, onAction }: StatTileProps) {
  return (
    <div className={cx("flex min-h-[148px] flex-col justify-between rounded-3xl p-5", tone)}>
      <div>
        <p className="text-headline-semibold text-text-primary">{title}</p>
        <p className="truncate text-caption-1-regular text-text-secondary">{caption}</p>
      </div>
      <div className="flex items-end justify-between gap-3">
        <span className="truncate text-title-1-semibold text-text-primary">{value}</span>
        <RoundArrow label={actionLabel} onPress={onAction} />
      </div>
    </div>
  );
}

interface CampaignTileProps {
  progress: SendProgress;
  remainingSteps: number;
  onReview: () => void;
}

function CampaignTile({ progress, remainingSteps, onReview }: CampaignTileProps) {
  const percent = progress.total ? Math.round((progress.current / progress.total) * 100) : 0;
  const headline = progress.running
    ? `${progress.current}/${progress.total}`
    : progress.finished
      ? `${progress.successCount} sent`
      : remainingSteps === 0
        ? "Ready"
        : `${remainingSteps} to go`;
  const caption = progress.running
    ? progress.statusText
    : progress.finished
      ? progress.failCount > 0
        ? `${progress.failCount} failed — check the recipient list`
        : "Last campaign delivered"
      : remainingSteps === 0
        ? "Everything is set. Send a test first."
        : `${remainingSteps} step${remainingSteps === 1 ? "" : "s"} left before sending`;

  return (
    <div className="relative flex min-h-[148px] flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e3a8a] via-[#4338ca] to-[#f59e0b] p-5 text-white">
      <div aria-hidden className="pointer-events-none absolute -right-10 -bottom-12 size-40 rounded-full bg-white/15 blur-2xl" />
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-2.5 py-0.5 text-caption-2-medium">
        <RiMailSendLine className="size-3.5" aria-hidden /> Campaign
      </span>
      <div className="relative">
        <p className="text-title-1-semibold" aria-live="polite">
          {headline}
        </p>
        <p className="line-clamp-2 text-caption-1-regular text-white/80">{caption}</p>
        {progress.running && (
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/25" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-white transition-[width] duration-300" style={{ width: `${percent}%` }} />
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onReview}
        className="relative mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-white px-3 py-1.5 text-caption-1-semibold text-[#111827] shadow-xs transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        Review & send
      </button>
    </div>
  );
}

interface StatTilesProps {
  templateCount: number;
  activeTemplateName?: string;
  selectedRecipients: number;
  totalRecipients: number;
  deliveryLabel: string;
  deliveryCaption: string;
  progress: SendProgress;
  remainingSteps: number;
  onCreateTemplate: () => void;
  onGoToRecipients: () => void;
  onOpenDelivery: () => void;
  onReview: () => void;
}

export function StatTiles(props: StatTilesProps) {
  return (
    <div className="grid gap-4 @lg:grid-cols-2 @4xl:grid-cols-4">
      <StatTile
        title="Templates"
        caption={props.activeTemplateName ? `Using “${props.activeTemplateName}”` : "None selected"}
        value={props.templateCount}
        tone="bg-status-yellow-background/70"
        actionLabel="Create a template"
        onAction={props.onCreateTemplate}
      />
      <StatTile
        title="Recipients"
        caption={props.totalRecipients ? `${props.totalRecipients} imported` : "Import a list to start"}
        value={props.selectedRecipients}
        tone="bg-status-blue-background/60"
        actionLabel="Go to recipients"
        onAction={props.onGoToRecipients}
      />
      <StatTile
        title="Delivery"
        caption={props.deliveryCaption}
        value={props.deliveryLabel}
        tone="bg-status-purple-background"
        actionLabel="Delivery settings"
        onAction={props.onOpenDelivery}
      />
      <CampaignTile progress={props.progress} remainingSteps={props.remainingSteps} onReview={props.onReview} />
    </div>
  );
}

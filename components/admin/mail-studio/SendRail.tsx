"use client";

import { useState, type ReactNode } from "react";
import {
  RiArrowRightSLine,
  RiCheckboxCircleFill,
  RiFlaskLine,
  RiMailSendLine,
  RiStopCircleLine,
} from "@remixicon/react";
import { Button } from "@/components/base/buttons/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui";
import { cx } from "@/utils/cx";
import { dialogSurface } from "./dialogs/surface";
import type { SendProgress } from "./types";
import { Spinner, type IconComponent } from "./ui";

export interface ReadinessItem {
  id: string;
  label: string;
  detail: string;
  ok: boolean;
  icon: IconComponent;
  tone: string;
  onFix: () => void;
}

interface SendRailProps {
  readiness: ReadinessItem[];
  preview: ReactNode;
  recipientCount: number;
  templateName: string;
  subject: string;
  progress: SendProgress;
  preparing: boolean;
  onSendTest: () => void;
  onSendAll: () => void;
  onCancel: () => void;
}

function ReadinessRow({ item }: { item: ReadinessItem }) {
  const Icon = item.icon;
  return (
    <li>
      <button
        type="button"
        onClick={item.onFix}
        className="flex w-full items-center gap-3 rounded-2xl bg-background-primary-default px-3 py-3 text-left shadow-card transition hover:bg-background-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring"
      >
        <span className={cx("flex size-9 shrink-0 items-center justify-center rounded-full", item.ok ? "bg-notification-success-background text-notification-success-foreground" : item.tone)}>
          {item.ok ? <RiCheckboxCircleFill className="size-[18px]" aria-hidden /> : <Icon className="size-[18px]" aria-hidden />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-body-semibold text-text-primary">
            {item.label}
            <span className="sr-only">{item.ok ? " — ready" : " — needs attention"}</span>
          </span>
          <span className="block truncate text-caption-1-regular text-text-secondary">{item.detail}</span>
        </span>
        <RiArrowRightSLine className="size-5 shrink-0 text-foreground-icon-tertiary" aria-hidden />
      </button>
    </li>
  );
}

export function SendRail({
  readiness,
  preview,
  recipientCount,
  templateName,
  subject,
  progress,
  preparing,
  onSendTest,
  onSendAll,
  onCancel,
}: SendRailProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const pending = readiness.filter((r) => !r.ok).length;
  const ready = pending === 0;
  const templateReady = readiness.filter((r) => r.id === "template" || r.id === "subject").every((r) => r.ok);
  const busy = progress.running || preparing;
  const percent = progress.total ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <aside
      id="mail-send-rail"
      aria-labelledby="mail-rail-heading"
      className="scroll-mt-24 space-y-5 rounded-3xl bg-background-secondary-default p-4 sm:p-5 @4xl:sticky @4xl:top-24"
    >
      <div>
        <div className="mb-3 flex items-baseline justify-between gap-2 px-1">
          <h3 id="mail-rail-heading" className="text-headline-semibold text-text-primary">
            Ready to send
          </h3>
          <span className="text-caption-1-regular text-text-secondary">
            {ready ? "All set" : `${pending} thing${pending === 1 ? "" : "s"} need you`}
          </span>
        </div>
        <ul className="space-y-2">
          {readiness.map((item) => (
            <ReadinessRow key={item.id} item={item} />
          ))}
        </ul>
      </div>

      {preview}

      {(progress.running || progress.finished) && (
        <div className="space-y-2 rounded-2xl bg-background-primary-default p-4 shadow-card" aria-live="polite">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-body-medium text-text-primary">{progress.statusText}</span>
            <span className="text-body-semibold text-text-primary">{percent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-background-tertiary-default" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-button-primary transition-[width] duration-300" style={{ width: `${percent}%` }} />
          </div>
          <div className="flex items-center justify-between text-caption-1-regular text-text-secondary">
            <span>
              {progress.successCount} sent
              {progress.failCount > 0 && <span className="text-text-error-primary"> · {progress.failCount} failed</span>}
            </span>
            {progress.running && (
              <Button variant="ghost" size="xs" leadingIcon={RiStopCircleLine} onClick={onCancel}>
                Stop
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Button
          variant="primary"
          className="h-11 w-full rounded-full"
          leadingIcon={busy ? Spinner : RiMailSendLine}
          onClick={() => setConfirmOpen(true)}
          disabled={!ready || busy}
        >
          {progress.running ? "Sending…" : `Send to ${recipientCount} recipient${recipientCount === 1 ? "" : "s"}`}
        </Button>
        <Button
          variant="secondary"
          className="h-11 w-full rounded-full"
          leadingIcon={RiFlaskLine}
          onClick={onSendTest}
          disabled={!templateReady || busy}
        >
          Send a test to myself
        </Button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className={dialogSurface}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-title-3-semibold text-text-primary">
              Send {recipientCount} email{recipientCount === 1 ? "" : "s"} now?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-body-regular text-text-secondary">
                <p>
                  The latest saved version of <span className="text-body-semibold text-text-primary">{templateName}</span> will be used.
                </p>
                <p className="rounded-2xl bg-background-secondary-default px-3 py-2 text-text-primary">
                  <span className="text-caption-1-semibold text-text-tertiary">SUBJECT</span>
                  <br />
                  {subject}
                </p>
                <p>Emails can’t be recalled once sent.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmOpen(false);
                onSendAll();
              }}
            >
              Send emails
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  );
}

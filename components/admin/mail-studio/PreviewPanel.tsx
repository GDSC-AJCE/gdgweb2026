"use client";

import { useState } from "react";
import { RiComputerLine, RiErrorWarningLine, RiFullscreenLine, RiRefreshLine, RiSmartphoneLine } from "@remixicon/react";
import { IconButton } from "@/components/base/buttons/icon-button";
import { SegmentedControl, SegmentedControlItem } from "@/components/base/segmented-control/segmented-control";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui";
import { cx } from "@/utils/cx";
import { dialogSurface } from "./dialogs/surface";
import { Spinner } from "./ui";

type Device = "desktop" | "mobile";

interface PreviewPanelProps {
  html: string;
  error: string | null;
  loading: boolean;
  onRefresh: () => void;
  templateName?: string;
  subject?: string;
  sampleLabel: string;
}

function DeviceToggle({ value, onChange }: { value: Device; onChange: (d: Device) => void }) {
  return (
    <SegmentedControl
      aria-label="Preview device"
      selectedKeys={[value]}
      onSelectionChange={(keys) => {
        const next = Array.from(keys)[0];
        if (next === "desktop" || next === "mobile") onChange(next);
      }}
    >
      <SegmentedControlItem id="desktop" aria-label="Desktop preview">
        <RiComputerLine className="size-4" aria-hidden />
      </SegmentedControlItem>
      <SegmentedControlItem id="mobile" aria-label="Mobile preview">
        <RiSmartphoneLine className="size-4" aria-hidden />
      </SegmentedControlItem>
    </SegmentedControl>
  );
}

function Frame({ html, error, loading, device, fill }: { html: string; error: string | null; loading: boolean; device: Device; fill?: boolean }) {
  return (
    <div className={cx("flex justify-center rounded-2xl bg-background-tertiary-default p-2.5", fill && "h-full")}>
      <div
        className={cx(
          "relative w-full overflow-hidden rounded-xl bg-white shadow-xs transition-[max-width] duration-300",
          device === "mobile" ? "max-w-[360px]" : "max-w-full",
          fill ? "h-full" : "h-[460px]",
        )}
      >
        {error ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
            <RiErrorWarningLine className="size-6 text-text-error-primary" aria-hidden />
            <p className="max-w-xs text-caption-1-regular text-neutral-600">{error}</p>
          </div>
        ) : html ? (
          <iframe title="Email preview" srcDoc={html} sandbox="" className="block h-full w-full border-0" />
        ) : (
          <div className="flex h-full items-center justify-center text-caption-1-regular text-neutral-500">
            Select a template to preview it.
          </div>
        )}
        {loading && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-caption-2-medium text-neutral-600 shadow-xs">
            <Spinner className="size-3" aria-hidden /> Rendering
          </span>
        )}
      </div>
    </div>
  );
}

export function PreviewPanel({ html, error, loading, onRefresh, templateName, subject, sampleLabel }: PreviewPanelProps) {
  const [device, setDevice] = useState<Device>("desktop");
  const [expanded, setExpanded] = useState(false);

  return (
    <section aria-labelledby="mail-preview-heading" className="rounded-2xl bg-background-primary-default p-3 shadow-card">
      <div className="mb-3 flex items-center justify-between gap-2 px-1 pt-1">
        <div className="min-w-0">
          <h4 id="mail-preview-heading" className="text-body-semibold text-text-primary">
            Preview
          </h4>
          <p className="truncate text-caption-1-regular text-text-secondary">As {sampleLabel} sees it</p>
        </div>
        <div className="flex items-center gap-1.5">
          <DeviceToggle value={device} onChange={setDevice} />
          <IconButton size="small" icon={RiRefreshLine} aria-label="Refresh preview" onClick={onRefresh} />
          <IconButton size="small" icon={RiFullscreenLine} aria-label="Open full-size preview" onClick={() => setExpanded(true)} />
        </div>
      </div>
      {subject && (
        <p className="mb-2 truncate rounded-xl bg-background-secondary-default px-3 py-2 text-caption-1-regular text-text-primary">
          <span className="text-caption-1-semibold text-text-tertiary">Subject · </span>
          {subject}
        </p>
      )}
      <Frame html={html} error={error} loading={loading} device={device} />

      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className={cx(dialogSurface, "flex h-[92vh] max-w-5xl flex-col gap-3")}>
          <DialogHeader className="pr-10">
            <DialogTitle className="text-title-3-semibold">{templateName || "Email preview"}</DialogTitle>
            <DialogDescription className="truncate text-body-regular text-text-secondary">{subject || "No subject set"}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <DeviceToggle value={device} onChange={setDevice} />
          </div>
          <div className="min-h-0 flex-1">
            <Frame html={html} error={error} loading={loading} device={device} fill />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

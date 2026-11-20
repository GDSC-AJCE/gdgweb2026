"use client";

import { useMemo, useRef, useState } from "react";
import {
  RiCloseLine,
  RiFileExcel2Line,
  RiGroupLine,
  RiSearchLine,
  RiTableLine,
  RiUploadCloud2Line,
} from "@remixicon/react";
import { Button } from "@/components/base/buttons/button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { InputBase } from "@/components/base/input/input";
import { SegmentedControl, SegmentedControlItem } from "@/components/base/segmented-control/segmented-control";
import { Select, SelectItem } from "@/components/base/select/select";
import { cx } from "@/utils/cx";
import type { Recipient } from "./types";
import type { RecipientsState } from "./useRecipients";
import { FieldLabel, Panel, PanelHeader, Spinner, StatusPill, textAreaClass, type PillTone } from "./ui";

type Source = "sheet" | "file";

const STATUS_TONE: Record<Recipient["status"], PillTone> = {
  Sent: "success",
  Failed: "danger",
  Pending: "neutral",
};

function initials(name: string, email: string): string {
  const base = (name || email).trim();
  const parts = base.split(/[\s.@_-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function RecipientsCard({ state, disabled }: { state: RecipientsState; disabled: boolean }) {
  const [source, setSource] = useState<Source>("sheet");
  const [csv, setCsv] = useState("");
  const [query, setQuery] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const { recipients, selected } = state;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recipients;
    return recipients.filter((r) => [r.name, r.email, r.category, r.team].some((v) => (v || "").toLowerCase().includes(q)));
  }, [recipients, query]);

  const selectable = recipients.filter((r) => r.isValid !== false).length;
  const allSelected = selectable > 0 && selected.length === selectable;

  return (
    <Panel labelledBy="mail-recipients-heading">
      <div id="mail-recipients" className="scroll-mt-24" />
      <PanelHeader
        id="mail-recipients-heading"
        icon={RiGroupLine}
        title="Recipients"
        description="Import from a Google Sheet, Excel or CSV — columns Name, Email, Team."
        actions={
          recipients.length > 0 ? (
            <Button variant="ghost" size="small" leadingIcon={RiCloseLine} onClick={state.clear} disabled={disabled}>
              Clear
            </Button>
          ) : undefined
        }
      />

      {state.eventHandoff.title && recipients.length > 0 && (
        <p className="mb-4 rounded-2xl bg-status-blue-background/60 px-4 py-3 text-body-regular text-text-primary">
          <span className="text-body-semibold">{recipients.length} attendees</span> imported from “{state.eventHandoff.title}”.
        </p>
      )}

      <SegmentedControl
        aria-label="Recipient source"
        selectedKeys={[source]}
        onSelectionChange={(keys) => {
          const next = Array.from(keys)[0];
          if (next === "sheet" || next === "file") setSource(next);
        }}
        className="mb-4"
      >
        <SegmentedControlItem id="sheet">
          <span className="inline-flex items-center gap-1.5">
            <RiTableLine className="size-4" aria-hidden /> Google Sheet
          </span>
        </SegmentedControlItem>
        <SegmentedControlItem id="file">
          <span className="inline-flex items-center gap-1.5">
            <RiFileExcel2Line className="size-4" aria-hidden /> Excel / CSV
          </span>
        </SegmentedControlItem>
      </SegmentedControl>

      {source === "sheet" ? (
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_200px]">
          <div>
            <FieldLabel htmlFor="sheet-link" hint="Shared as “anyone with the link”">
              Sheet link or ID
            </FieldLabel>
            <InputBase
              id="sheet-link"
              value={state.sheetId}
              onChange={(e) => state.setSheetId(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/…"
              fieldClassName="font-mono"
            />
          </div>
          <div>
            <FieldLabel>Tab</FieldLabel>
            {state.sheetTabs.length === 0 ? (
              <Button
                variant="secondary"
                className="w-full"
                leadingIcon={state.fetchingTabs ? Spinner : undefined}
                onClick={state.fetchTabs}
                disabled={state.fetchingTabs || disabled || !state.sheetId.trim()}
              >
                Find tabs
              </Button>
            ) : (
              <Select
                aria-label="Sheet tab"
                selectedKey={state.sheetTab || null}
                onSelectionChange={(key) => key !== null && state.setSheetTab(String(key))}
                triggerClassName="w-full"
              >
                {state.sheetTabs.map((t) => (
                  <SelectItem key={t.name} id={t.name} textValue={t.name}>
                    {t.name}
                  </SelectItem>
                ))}
              </Select>
            )}
          </div>
          <div className="flex justify-end md:col-span-2">
            <Button
              variant="primary"
              leadingIcon={state.loading ? Spinner : RiGroupLine}
              onClick={state.loadFromSheet}
              disabled={state.loading || disabled || !state.sheetId.trim() || !state.sheetTab}
            >
              Import recipients
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={disabled}
            className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-separator-border-strong bg-background-secondary-default px-4 py-7 text-center transition hover:border-border-focus-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-file-upload-icon-background text-file-upload-icon-foreground">
              <RiUploadCloud2Line className="size-5" aria-hidden />
            </span>
            <span className="text-body-semibold text-text-primary">Upload .xlsx, .xls or .csv</span>
            <span className="text-caption-1-regular text-text-secondary">The first sheet is used</span>
          </button>
          <input
            ref={fileInput}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void state.loadFromFile(file);
              e.target.value = "";
            }}
          />
          <div>
            <FieldLabel htmlFor="csv-paste">…or paste CSV</FieldLabel>
            <textarea
              id="csv-paste"
              rows={3}
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
              placeholder={"Name,Email,Team\nRahul Sharma,rahul@amaljyothi.ac.in,Web Team"}
              className={cx(textAreaClass, "font-mono")}
            />
          </div>
          <div className="flex justify-end">
            <Button
              variant="secondary"
              leadingIcon={state.loading ? Spinner : undefined}
              onClick={() => state.loadFromCsv(csv)}
              disabled={!csv.trim() || state.loading || disabled}
            >
              Parse CSV
            </Button>
          </div>
        </div>
      )}

      {recipients.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-body-regular text-text-secondary" aria-live="polite">
              <span className="text-body-semibold text-text-primary">{selected.length}</span> of {recipients.length} selected
            </p>
            <InputBase
              aria-label="Search recipients"
              placeholder="Search"
              size="small"
              leadingIcon={RiSearchLine}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              fieldClassName="w-48"
            />
          </div>
          <div className="max-h-96 overflow-auto rounded-2xl border border-border-table">
            <table className="w-full text-left">
              <thead className="sticky top-0 z-10 bg-background-secondary-default text-caption-1-medium text-text-secondary">
                <tr>
                  <th scope="col" className="w-12 px-4 py-2.5">
                    <Checkbox
                      aria-label="Select all recipients"
                      isSelected={allSelected}
                      isIndeterminate={!allSelected && selected.length > 0}
                      onChange={(v) => state.setSelected(v ? "all" : "none")}
                      isDisabled={disabled}
                    />
                  </th>
                  <th scope="col" className="px-2 py-2.5 font-medium">Recipient</th>
                  <th scope="col" className="hidden px-2 py-2.5 font-medium md:table-cell">Team</th>
                  <th scope="col" className="px-4 py-2.5 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-table">
                {filtered.map((r) => (
                  <tr key={r.id} className={cx("transition-colors", r.selected ? "bg-background-primary-default" : "bg-background-primary-default/60")}>
                    <td className="px-4 py-2.5">
                      <Checkbox
                        aria-label={`Select ${r.name || r.email}`}
                        isSelected={Boolean(r.selected)}
                        onChange={(v) => state.setSelected([r.id], v)}
                        isDisabled={disabled || r.isValid === false}
                      />
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="flex items-center gap-3">
                        <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background-tertiary-default text-caption-1-semibold text-text-secondary">
                          {initials(r.name, r.email)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-body-medium text-text-primary">{r.name || "—"}</p>
                          <p className="truncate font-mono text-caption-1-regular text-text-secondary">
                            {r.email}
                            {r.isValid === false && <span className="ml-1 text-text-error-primary">(invalid)</span>}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-2 py-2.5 text-body-regular text-text-secondary md:table-cell">{r.category || r.team || "—"}</td>
                    <td className="px-4 py-2.5 text-right">
                      <StatusPill tone={STATUS_TONE[r.status] ?? "neutral"}>{r.status}</StatusPill>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-body-regular text-text-secondary">
                      No recipients match “{query}”.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Panel>
  );
}

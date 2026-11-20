"use client";

import { useMemo, useState, type ReactNode } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  RiAddLine,
  RiArrowGoBackLine,
  RiDeleteBinLine,
  RiFileTextLine,
  RiLayoutMasonryLine,
  RiMoreFill,
  RiPenNibLine,
  RiPencilLine,
  RiSearchLine,
  RiSparkling2Line,
} from "@remixicon/react";
import {
  Dropdown,
  DropdownDivider,
  DropdownItem,
  DropdownPopover,
  DropdownTrigger,
} from "@/components/base/dropdown/dropdown";
import { InputBase } from "@/components/base/input/input";
import { Skeleton } from "@/components/ui";
import type { TemplateSummary } from "@/lib/mail-templates";
import { cx } from "@/utils/cx";
import { Panel, PanelHeader, type IconComponent } from "./ui";

interface MenuAction {
  label: string;
  icon: IconComponent;
  onSelect: () => void;
  danger?: boolean;
  dividerBefore?: boolean;
}

/** BoardUI dropdown that closes after an item is chosen. */
export function ActionMenu({
  label,
  actions,
  trigger,
  triggerClassName,
}: {
  label: string;
  actions: MenuAction[];
  trigger: ReactNode;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dropdown isOpen={open} onOpenChange={setOpen}>
      <DropdownTrigger aria-label={label} className={triggerClassName}>
        {trigger}
      </DropdownTrigger>
      <DropdownPopover aria-label={label} placement="bottom end">
        {actions.map((a) => (
          <div key={a.label}>
            {a.dividerBefore && <DropdownDivider />}
            <DropdownItem
              onSelect={() => {
                setOpen(false);
                a.onSelect();
              }}
              className={cx("text-body-regular", a.danger && "text-text-destructive")}
            >
              <a.icon className="size-4 shrink-0" aria-hidden />
              {a.label}
            </DropdownItem>
          </div>
        ))}
      </DropdownPopover>
    </Dropdown>
  );
}

function edited(iso?: string): string {
  if (!iso) return "Saved";
  const t = Date.parse(iso);
  return Number.isNaN(t) ? "Saved" : `Edited ${formatDistanceToNow(t, { addSuffix: true })}`;
}

interface TemplateStripProps {
  templates: TemplateSummary[];
  activeId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onCreateWithAi: () => void;
  onImportFigma: () => void;
  onEditDesign: (id: string) => void;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}

export function TemplateStrip(props: TemplateStripProps) {
  const { templates, activeId, loading } = props;
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? templates.filter((t) => t.name.toLowerCase().includes(q) || t.id.includes(q)) : templates;
  }, [templates, query]);

  return (
    <Panel labelledBy="mail-templates-heading">
      <PanelHeader
        id="mail-templates-heading"
        title="Templates"
        description="Choose what to send. Everything here is stored in Firestore."
        actions={
          <>
            <InputBase
              aria-label="Search templates"
              placeholder="Search"
              size="small"
              leadingIcon={RiSearchLine}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              fieldClassName="w-40 sm:w-52"
            />
            <ActionMenu
              label="Create template"
              triggerClassName="rounded-2lg"
              trigger={
                <span className="inline-flex h-8 items-center gap-1 rounded-lg bg-button-primary px-2.5 text-body-medium text-text-white shadow-xs">
                  <RiAddLine className="size-[18px]" aria-hidden /> New
                </span>
              }
              actions={[
                { label: "Start from scratch", icon: RiFileTextLine, onSelect: props.onCreate },
                { label: "Generate with Gemini", icon: RiSparkling2Line, onSelect: props.onCreateWithAi },
                { label: "Import from Figma", icon: RiPenNibLine, onSelect: props.onImportFigma },
              ]}
            />
          </>
        }
      />

      {loading && templates.length === 0 ? (
        <div className="flex gap-3 overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-56 shrink-0 rounded-2xl" />
          ))}
        </div>
      ) : (
        <ul className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2" aria-label="Templates">
          {filtered.map((t) => {
            const active = t.id === activeId;
            return (
              <li key={t.id} className="relative w-56 shrink-0 snap-start">
                <button
                  type="button"
                  onClick={() => props.onSelect(t.id)}
                  aria-current={active ? "true" : undefined}
                  className={cx(
                    "flex h-32 w-full flex-col justify-between rounded-2xl border p-4 text-left transition",
                    "outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring focus-visible:ring-offset-2",
                    active
                      ? "border-transparent bg-text-primary text-background-primary-default shadow-md"
                      : "border-separator-border bg-background-secondary-default text-text-primary hover:bg-background-secondary-hover",
                  )}
                >
                  <span
                    className={cx(
                      "flex size-9 items-center justify-center rounded-full",
                      active ? "bg-background-primary-default/15" : "bg-background-primary-default shadow-xs",
                    )}
                  >
                    <RiFileTextLine className="size-[18px]" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate pr-6 text-body-semibold">{t.name}</span>
                    <span className={cx("block truncate text-caption-1-regular", active ? "opacity-70" : "text-text-secondary")}>
                      {t.source === "starter" ? "Starter template" : edited(t.updatedAt)}
                    </span>
                  </span>
                </button>
                <div className="absolute right-3 top-3">
                  <ActionMenu
                    label={`Actions for ${t.name}`}
                    triggerClassName={cx(
                      "flex size-8 items-center justify-center rounded-full transition",
                      active
                        ? "text-background-primary-default hover:bg-background-primary-default/15"
                        : "text-foreground-icon-secondary hover:bg-background-primary-default",
                    )}
                    trigger={<RiMoreFill className="size-[18px]" aria-hidden />}
                    actions={[
                      { label: "Edit design", icon: RiLayoutMasonryLine, onSelect: () => props.onEditDesign(t.id) },
                      { label: "Rename", icon: RiPencilLine, onSelect: () => props.onRename(t.id) },
                      ...(t.hasStarter && t.source === "cloud"
                        ? [{ label: "Restore original", icon: RiArrowGoBackLine, onSelect: () => props.onRestore(t.id) }]
                        : []),
                      {
                        label: "Delete",
                        icon: RiDeleteBinLine,
                        danger: true,
                        dividerBefore: true,
                        onSelect: () => props.onDelete(t.id),
                      },
                    ]}
                  />
                </div>
              </li>
            );
          })}
          <li className="w-56 shrink-0 snap-start">
            <button
              type="button"
              onClick={props.onCreate}
              className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-separator-border-strong text-text-secondary transition hover:border-border-focus-ring hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-button-primary text-text-white shadow-xs">
                <RiAddLine className="size-5" aria-hidden />
              </span>
              <span className="text-body-medium">New template</span>
            </button>
          </li>
        </ul>
      )}
      {!loading && query && filtered.length === 0 && (
        <p className="pt-2 text-caption-1-regular text-text-secondary">No templates match “{query}”.</p>
      )}
    </Panel>
  );
}

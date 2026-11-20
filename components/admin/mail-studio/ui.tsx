/**
 * Mail Studio surface primitives, built on BoardUI tokens
 * (text-text-*, bg-background-*, border-separator-border, text-<ramp> utilities).
 * Dark mode flips through the tokens — no hardcoded dark: colours here.
 */
import type { ComponentType, ReactNode } from "react";
import { RiArrowRightUpLine, RiLoader4Line } from "@remixicon/react";
import { cx } from "@/utils/cx";

type IconProps = { className?: string; "aria-hidden"?: boolean | "true" | "false" };
export type IconComponent = ComponentType<IconProps>;

/** Spinning loader usable as a BoardUI Button `leadingIcon`. */
export function Spinner({ className, ...rest }: IconProps) {
  return <RiLoader4Line {...rest} className={cx("animate-spin", className)} />;
}

interface PanelProps {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "aside";
  labelledBy?: string;
}

/** White rounded surface — the base card of the studio. */
export function Panel({ children, className, as: Tag = "section", labelledBy }: PanelProps) {
  return (
    <Tag
      aria-labelledby={labelledBy}
      className={cx(
        "rounded-3xl border border-separator-border bg-background-primary-default p-5 shadow-card sm:p-6",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

interface PanelHeaderProps {
  id: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  icon?: IconComponent;
}

export function PanelHeader({ id, title, description, actions, icon: Icon }: PanelHeaderProps) {
  return (
    <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background-secondary-default text-foreground-icon-primary">
            <Icon className="size-[18px]" aria-hidden />
          </span>
        )}
        <div className="min-w-0">
          <h3 id={id} className="text-headline-semibold text-text-primary">
            {title}
          </h3>
          {description && <p className="text-caption-1-regular text-text-secondary">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}

/** The dark circular arrow used on stat tiles and list rows. */
export function RoundArrow({
  label,
  onPress,
  disabled,
  tone = "dark",
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: "dark" | "light";
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={disabled}
      aria-label={label}
      className={cx(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full transition",
        "outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-40",
        tone === "dark"
          ? "bg-text-primary text-background-primary-default hover:scale-105"
          : "bg-background-primary-default text-text-primary shadow-xs hover:scale-105",
      )}
    >
      <RiArrowRightUpLine className="size-[18px]" aria-hidden />
    </button>
  );
}

export function FieldLabel({
  htmlFor,
  children,
  hint,
}: {
  htmlFor?: string;
  children: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <div className="mb-1.5 flex items-center justify-between gap-2">
      <label htmlFor={htmlFor} className="text-body-medium text-text-primary">
        {children}
      </label>
      {hint && <span className="text-caption-1-regular text-text-tertiary">{hint}</span>}
    </div>
  );
}

const PILL_TONES = {
  success: "bg-notification-success-background text-notification-success-foreground",
  warning: "bg-status-yellow-background text-status-yellow-text",
  danger: "bg-notification-error-background text-notification-error-foreground",
  info: "bg-status-blue-background text-status-blue-text",
  neutral: "bg-background-secondary-default text-text-secondary",
} as const;

export type PillTone = keyof typeof PILL_TONES;

/** Rounded status pill with a leading dot (Approved / Pending / Declined style). */
export function StatusPill({ tone, children, className }: { tone: PillTone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-caption-1-medium whitespace-nowrap",
        PILL_TONES[tone],
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

/** Plain text-area styled like BoardUI's filled inputs. */
export const textAreaClass = cx(
  "w-full resize-y rounded-2lg bg-background-tertiary-default p-2.5 font-sans text-body-regular text-text-primary",
  "placeholder:text-text-tertiary outline-none ring-2 ring-inset ring-transparent transition",
  "hover:ring-border-button-hover focus:ring-border-focus-ring",
);

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// StatusDot: default export, uses color prop ("green" | "yellow" | "red" | "blue" | "gray") + ping
import StatusDot from "@/components/ui/StatusDot";
// Chip: default export, uses children + color ("blue"|"green"|"yellow"|"red"|"purple"|"slate") + variant
import Chip from "@/components/ui/Chip";
import Alert from "@/components/ui/Alert";
import GDGLogoMark from "@/components/ui/GDGLogoMark";
import { DataTableExample } from "@/components/application/data-table/data-table";
import { TreeView, TreeViewItem } from "@/components/base/tree-view/tree-view";
import { CalendarDate, getLocalTimeZone, today, Time } from "@internationalized/date";
import { TimeField } from "@/components/base/time-field/time-field";
import { DatePicker } from "@/components/base/date-picker/date-picker";
import { DateRangePicker, type DateRangeValue } from "@/components/base/date-picker/date-range-picker";
import type { Selection } from "react-aria-components";
import { Tag, TagGroup } from "@/components/base/tag-group/tag-group";
import {
  RiImage2Line,
  RiArticleLine,
  RiSettings3Line,
  RiArrowRightLine,
  RiExternalLinkLine,
  RiDownloadLine,
  RiHomeLine,
  RiDashboardLine,
  RiFolderLine,
  RiCompass3Line,
} from "@remixicon/react";
import {
  Breadcrumb as BoardUIBreadcrumb,
  BreadcrumbItem as BoardUIBreadcrumbItem,
} from "@/components/base/breadcrumb/breadcrumb";
import { LinkButton } from "@/components/base/buttons/link-button";
import {
  Tab as BoardUITab,
  TabList as BoardUITabList,
  TabPanel as BoardUITabPanel,
  Tabs as BoardUITabs,
} from "@/components/base/tabs/tabs";
import {
  Skeleton as BoardUISkeleton,
  SkeletonText as BoardUISkeletonText,
} from "@/components/base/skeleton/skeleton";
import {
  Sparkles,
  ArrowRight,
  Plus,
  Settings,
  User,
  LogOut,
  Bell,
  Heart,
  Star,
  Zap,
  CheckCircle,
  Copy,
  Check,
} from "lucide-react";

// ─── Section wrapper ───────────────────────────────────────────────────────────
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-[#2c2e2a]">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-[#80827f]">{description}</p>
        )}
        <div className="h-px bg-[#e5e1d5] mt-3" />
      </div>
      <div>{children}</div>
    </section>
  );
}

// ─── Code snippet with copy ────────────────────────────────────────────────────
function CodeSnippet({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative rounded-2xl bg-[#2c2e2a] text-[#f5f1e4] text-xs font-mono p-4 overflow-x-auto">
      <button
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-[#8ed462]" />
        ) : (
          <Copy className="h-3.5 w-3.5 text-[#80827f]" />
        )}
      </button>
      <pre className="whitespace-pre-wrap">{code}</pre>
    </div>
  );
}

function TimeFieldShowcase() {
  const [opens, setOpens] = useState<Time | null>(new Time(9, 0));
  const [closes, setCloses] = useState<Time | null>(new Time(18, 0));
  const isInvalid = opens != null && closes != null && closes.compare(opens) <= 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
        <TimeField label="Opens" value={opens} onChange={setOpens} />
        <TimeField
          label="Closes"
          value={closes}
          onChange={setCloses}
          isInvalid={isInvalid}
          hint={isInvalid ? "Must be after opening time." : "Normal operational hours"}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg pt-2 border-t border-[#e5e1d5]">
        <TimeField label="24-Hour Cycle" hourCycle={24} defaultValue={new Time(21, 45)} />
        <TimeField label="Reminder (Disabled)" isDisabled defaultValue={new Time(8, 30)} hint="Reminders are paused." />
      </div>
    </div>
  );
}

function DatePickerShowcase() {
  const [singleDate, setSingleDate] = useState<CalendarDate | null>(today(getLocalTimeZone()));
  const [dateRange, setDateRange] = useState<DateRangeValue | null>(() => {
    const now = today(getLocalTimeZone());
    return {
      start: now.subtract({ days: 7 }),
      end: now,
    };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Single Date Picker */}
        <div className="space-y-3 p-4 rounded-2xl bg-[#f5f1e4]/50 border border-[#e5e1d5]">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-[#2c2e2a]">Single Date Picker</h4>
            <p className="text-xs text-[#80827f]">
              Direct single date selection with animated editable day chip and month navigation.
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <DatePicker
              value={singleDate}
              onChange={setSingleDate}
              aria-label="Meeting or event date"
            />
            <div className="text-[11px] font-mono text-[#80827f] mt-1">
              Selected: <span className="font-semibold text-[#2c2e2a]">{singleDate ? singleDate.toString() : "None"}</span>
            </div>
          </div>
        </div>

        {/* Date Range Picker with Quick Presets */}
        <div className="space-y-3 p-4 rounded-2xl bg-[#f5f1e4]/50 border border-[#e5e1d5]">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-[#2c2e2a]">Date Range Picker with Quick Presets</h4>
            <p className="text-xs text-[#80827f]">
              Dual-month view with quick presets (Today, Last week, This month) and range summary.
            </p>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              aria-label="Report or filter period"
            />
            <div className="text-[11px] font-mono text-[#80827f] mt-1">
              Range: <span className="font-semibold text-[#2c2e2a]">
                {dateRange ? `${dateRange.start.toString()} → ${dateRange.end.toString()}` : "None"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Variants & States */}
      <div className="p-4 rounded-2xl bg-[#f5f1e4]/30 border border-[#e5e1d5] space-y-3">
        <h4 className="text-xs font-bold text-[#80827f] uppercase tracking-wider">Additional Variants & States</h4>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-[#4b4e47] font-medium">Disabled Picker</span>
            <DatePicker isDisabled defaultValue={today(getLocalTimeZone())} aria-label="Disabled date picker" />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-[#4b4e47] font-medium">Unselected Range</span>
            <DateRangePicker placeholder="Pick report schedule..." aria-label="Schedule range" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TagGroupShowcase() {
  const [selectedTopics, setSelectedTopics] = useState<Selection>(new Set(["design", "engineering"]));
  const [skills, setSkills] = useState([
    { id: "react", name: "React" },
    { id: "typescript", name: "TypeScript" },
    { id: "firebase", name: "Firebase" },
    { id: "gemini", name: "Gemini AI" },
  ]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <TagGroup
          label="Selectable Topics"
          selectionMode="multiple"
          selectedKeys={selectedTopics}
          onSelectionChange={setSelectedTopics}
          hint="Click to toggle topics or use keyboard Space/Enter"
        >
          <Tag id="design">Design</Tag>
          <Tag id="engineering">Engineering</Tag>
          <Tag id="ai" color="cyan">AI & Machine Learning</Tag>
          <Tag id="cloud" color="blue">Google Cloud</Tag>
          <Tag id="mobile" color="lime">Android & Flutter</Tag>
          <Tag id="web">Web Development</Tag>
        </TagGroup>
      </div>

      <div className="space-y-2 pt-3 border-t border-[#e5e1d5]">
        <TagGroup
          label="Removable Skills"
          items={skills}
          onRemove={(keys) => setSkills((prev) => prev.filter((s) => !keys.has(s.id)))}
          emptyState="All skills removed. Refresh to reset."
          hint="Click the × or press Backspace on focused tag"
        >
          {(skill) => <Tag color="soft">{skill.name}</Tag>}
        </TagGroup>
      </div>
    </div>
  );
}

function BoardUITabsShowcase() {
  return (
    <BoardUITabs defaultSelectedKey="banners" className="w-full">
      <BoardUITabList aria-label="Content types">
        <BoardUITab id="banners" icon={RiImage2Line} count={152}>
          Banners
        </BoardUITab>
        <BoardUITab id="posts" icon={RiArticleLine} count={32}>
          Posts
        </BoardUITab>
        <BoardUITab id="settings" icon={RiSettings3Line}>
          Settings
        </BoardUITab>
      </BoardUITabList>

      <BoardUITabPanel id="banners" className="p-4 rounded-2xl bg-[#f5f1e4]/60 border border-[#e5e1d5] text-xs text-[#2c2e2a]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white border border-[#d5d5d4] text-[#4285F4]">
            <RiImage2Line className="size-5" />
          </div>
          <div>
            <div className="font-semibold text-sm text-[#2c2e2a]">Creative Banners & Media</div>
            <div className="text-[#80827f]">152 active promotional assets ready for deployment across campus channels.</div>
          </div>
        </div>
      </BoardUITabPanel>
      <BoardUITabPanel id="posts" className="p-4 rounded-2xl bg-[#f5f1e4]/60 border border-[#e5e1d5] text-xs text-[#2c2e2a]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white border border-[#d5d5d4] text-[#10B981]">
            <RiArticleLine className="size-5" />
          </div>
          <div>
            <div className="font-semibold text-sm text-[#2c2e2a]">Editorial Posts & Articles</div>
            <div className="text-[#80827f]">32 technical writeups and event recaps published on the community board.</div>
          </div>
        </div>
      </BoardUITabPanel>
      <BoardUITabPanel id="settings" className="p-4 rounded-2xl bg-[#f5f1e4]/60 border border-[#e5e1d5] text-xs text-[#2c2e2a]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white border border-[#d5d5d4] text-[#64748B]">
            <RiSettings3Line className="size-5" />
          </div>
          <div>
            <div className="font-semibold text-sm text-[#2c2e2a]">Channel & Feed Configuration</div>
            <div className="text-[#80827f]">Manage automated content delivery, webhooks, and broadcast thresholds.</div>
          </div>
        </div>
      </BoardUITabPanel>
    </BoardUITabs>
  );
}

function BoardUISkeletonShowcase() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="space-y-6">
      {/* Interactive Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#f5f1e4]/70 border border-[#e5e1d5]">
        <div className="flex items-center gap-2.5 flex-wrap">
          <Sparkles className="w-4 h-4 text-[#4285F4]" />
          <span className="text-xs font-semibold text-[#2c2e2a]">Interactive Skeleton State</span>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium font-mono transition-colors ${
              isLoaded ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-amber-100 text-amber-800 border border-amber-200"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isLoaded ? "bg-emerald-600" : "bg-amber-600 animate-pulse"}`} />
            {isLoaded ? "Content Loaded" : "Skeleton Active (Sheen)"}
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsLoaded((prev) => !prev)}
          className="rounded-full text-xs font-semibold gap-1.5 cursor-pointer bg-white hover:bg-slate-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#4285F4]" />
          <span>{isLoaded ? "Simulate Loading (Show Skeleton)" : "Reveal Content (isLoaded blur-in)"}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Docs Example: Standalone Skeleton Card */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-[#80827f] flex items-center justify-between">
            <span>Docs Example (Static Placeholders)</span>
            <span className="text-[10px] font-mono text-[#80827f]">aria-busy="true"</span>
          </div>
          <div
            aria-busy="true"
            className="flex w-full flex-col gap-4 rounded-3xl border border-[#d5d5d4] bg-white p-5 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <BoardUISkeleton shape="circle" className="size-10 shrink-0" />
              <div className="flex flex-1 flex-col gap-2">
                <BoardUISkeleton shape="text" className="h-3.5 w-32" />
                <BoardUISkeleton shape="text" className="h-3 w-20" />
              </div>
            </div>
            <BoardUISkeletonText lines={3} />
            <BoardUISkeleton className="h-36 w-full rounded-2xl" />
          </div>
        </div>

        {/* Live Content Transition Card with isLoaded */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-[#80827f] flex items-center justify-between">
            <span>Interactive Reveal (isLoaded blur-in)</span>
            <span className="text-[10px] font-mono text-[#80827f]">isLoaded={isLoaded ? "true" : "false"}</span>
          </div>
          <div
            aria-busy={!isLoaded}
            className="flex w-full flex-col gap-4 rounded-3xl border border-[#d5d5d4] bg-white p-5 shadow-xs"
          >
            <div className="flex items-center gap-3">
              <BoardUISkeleton shape="circle" isLoaded={isLoaded} className="size-10 shrink-0 rounded-full">
                <div className="size-10 rounded-full bg-gradient-to-br from-[#4285F4] to-[#34A853] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  MC
                </div>
              </BoardUISkeleton>
              <div className="flex flex-1 flex-col gap-1 min-w-0">
                <BoardUISkeleton shape="text" isLoaded={isLoaded} className="w-fit">
                  <span className="font-bold text-sm text-[#2c2e2a]">Maya Chen</span>
                </BoardUISkeleton>
                <BoardUISkeleton shape="text" isLoaded={isLoaded} className="w-fit">
                  <span className="text-xs text-[#80827f]">Cloud Architecture Lead • GDG AJCE</span>
                </BoardUISkeleton>
              </div>
            </div>

            <BoardUISkeleton shape="rect" isLoaded={isLoaded} className="w-full">
              <p className="text-xs text-[#4b4e47] leading-relaxed">
                Shipped the new onboarding flow for 1,400+ student developers. Spearheading the Google Cloud Study Jam with interactive workshops and automated certification validation.
              </p>
            </BoardUISkeleton>

            <BoardUISkeleton shape="rect" isLoaded={isLoaded} className="h-36 w-full rounded-2xl">
              <div className="h-36 w-full rounded-2xl bg-gradient-to-br from-[#4285F4]/15 via-[#EA4335]/10 to-[#FBBC05]/20 p-4 flex flex-col justify-between border border-[#e5e1d5]">
                <div className="flex items-center justify-between">
                  <GDGLogoMark className="w-5 h-5" />
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/90 border border-[#d5d5d4] text-[#2c2e2a]">
                    STUDY JAM
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-[#2c2e2a]">Vertex AI & Cloud Run Sprint</div>
                  <div className="text-[11px] text-[#5f6368]">Hands-on lab featuring Gemini API integration</div>
                </div>
              </div>
            </BoardUISkeleton>
          </div>
        </div>
      </div>
    </div>
  );
}

function BoardUILinkButtonShowcase() {
  const [lastAction, setLastAction] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Interactive feedback bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#f5f1e4]/70 border border-[#e5e1d5]">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-[#4285F4]" />
          <span className="text-xs font-semibold text-[#2c2e2a]">Inline Action State</span>
          <span className="text-xs text-[#80827f] font-mono">
            {lastAction ? `Last triggered: "${lastAction}"` : "Click any button to test handler"}
          </span>
        </div>
        {lastAction && (
          <button
            onClick={() => setLastAction(null)}
            className="text-[11px] font-semibold text-[#80827f] hover:text-[#2c2e2a] cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Official Docs / Matrix Showcase */}
        <div className="p-6 rounded-3xl bg-white border border-[#d5d5d4] shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-[#2c2e2a]">Official Pattern Showcase</h3>
            <p className="text-xs text-[#80827f]">
              Demonstrating variants, sizes, and leading / trailing Remix icons.
            </p>
          </div>

          <div className="space-y-4 pt-1">
            {/* Primary medium with trailing arrow */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#f5f1e4]/40 border border-[#e5e1d5]">
              <span className="text-xs text-[#80827f]">Primary Medium (href + Trailing Icon)</span>
              <LinkButton href="/programs" trailingIcon={RiArrowRightLine}>
                Learn more
              </LinkButton>
            </div>

            {/* Secondary medium dismissal */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#f5f1e4]/40 border border-[#e5e1d5]">
              <span className="text-xs text-[#80827f]">Secondary Medium (onClick handler)</span>
              <LinkButton variant="secondary" onClick={() => setLastAction("Dismissed notification")}>
                Dismiss
              </LinkButton>
            </div>

            {/* External link */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#f5f1e4]/40 border border-[#e5e1d5]">
              <span className="text-xs text-[#80827f]">External Link (RiExternalLinkLine)</span>
              <LinkButton href="/changelog" trailingIcon={RiExternalLinkLine}>
                View changelog
              </LinkButton>
            </div>

            {/* Small size with leading download icon */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#f5f1e4]/40 border border-[#e5e1d5]">
              <span className="text-xs text-[#80827f]">Small Size (Leading Download Icon)</span>
              <LinkButton
                size="small"
                leadingIcon={RiDownloadLine}
                onClick={() => setLastAction("Downloaded chapter report")}
              >
                Download report
              </LinkButton>
            </div>

            {/* Extra small (xs) secondary with trailing arrow */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#f5f1e4]/40 border border-[#e5e1d5]">
              <span className="text-xs text-[#80827f]">Extra Small xs (Caption font scale)</span>
              <LinkButton
                size="xs"
                variant="secondary"
                trailingIcon={RiArrowRightLine}
                onClick={() => setLastAction("See all activity")}
              >
                See all
              </LinkButton>
            </div>

            {/* Disabled state */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#f5f1e4]/40 border border-[#e5e1d5]">
              <span className="text-xs text-[#80827f]">Disabled State (Muted & no underline)</span>
              <LinkButton disabled trailingIcon={RiArrowRightLine}>
                Action disabled
              </LinkButton>
            </div>
          </div>
        </div>

        {/* Card 2: Interactive In-Context Demonstration */}
        <div className="p-6 rounded-3xl bg-white border border-[#d5d5d4] shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#2c2e2a]">In-Context Administrative Tile</h3>
              <p className="text-xs text-[#80827f]">
                Seamless inline copy actions without the heavy visual footprint of bordered buttons.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#faf9f6] border border-[#e5e1d5] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#2c2e2a]">Execom Candidate Roster</span>
                <LinkButton
                  size="xs"
                  variant="secondary"
                  trailingIcon={RiArrowRightLine}
                  onClick={() => setLastAction("Navigating to candidate roster")}
                >
                  View full queue
                </LinkButton>
              </div>
              <p className="text-xs text-[#80827f] leading-relaxed">
                14 student applications pending review for the Google Cloud & Gemini AI tracks. Download the candidate
                resumes or inspect submitted portfolios.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <LinkButton
                  size="small"
                  variant="primary"
                  trailingIcon={RiExternalLinkLine}
                  href="https://developers.google.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  Developer portal
                </LinkButton>
                <LinkButton
                  size="small"
                  leadingIcon={RiDownloadLine}
                  onClick={() => setLastAction("Exported applicant CSV")}
                >
                  Export CSV
                </LinkButton>
              </div>
            </div>
          </div>

          {/* Code preview snippet */}
          <CodeSnippet
            code={`import { RiArrowRightLine, RiExternalLinkLine, RiDownloadLine } from "@remixicon/react";\nimport { LinkButton } from "@/components/base/buttons/link-button";\n\n<LinkButton href="/pricing" trailingIcon={RiArrowRightLine}>Learn more</LinkButton>\n<LinkButton variant="secondary" onClick={() => {}}>Dismiss</LinkButton>\n<LinkButton size="small" leadingIcon={RiDownloadLine}>Download report</LinkButton>\n<LinkButton size="xs" variant="secondary" trailingIcon={RiArrowRightLine}>See all</LinkButton>`}
          />
        </div>
      </div>
    </div>
  );
}

function BoardUIBreadcrumbShowcase() {
  const [activeStep, setActiveStep] = useState<string>("recruitment");
  const [lastClicked, setLastClicked] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Interactive feedback bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#f5f1e4]/70 border border-[#e5e1d5]">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-[#4285F4]" />
          <span className="text-xs font-semibold text-[#2c2e2a]">Interactive Navigation State</span>
          <span className="text-xs text-[#80827f] font-mono">
            {lastClicked ? `Action triggered: "${lastClicked}"` : "Click breadcrumb links to test handlers"}
          </span>
        </div>
        {lastClicked && (
          <button
            onClick={() => setLastClicked(null)}
            className="text-[11px] font-semibold text-[#80827f] hover:text-[#2c2e2a] cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Official Documentation Pattern */}
        <div className="p-6 rounded-3xl bg-white border border-[#d5d5d4] shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-bold text-[#2c2e2a]">Official Pattern Showcase</h3>
            <p className="text-xs text-[#80827f]">
              Direct implementation from official documentation with leading Remix icons and automatic chevrons.
            </p>
          </div>

          <div className="space-y-4 pt-1">
            <div className="p-4 rounded-2xl bg-[#f5f1e4]/40 border border-[#e5e1d5]">
              <span className="text-[11px] font-mono text-[#80827f] block mb-2">Docs Example (Dashboard &gt; Projects &gt; BoardUI)</span>
              <BoardUIBreadcrumb aria-label="Pages">
                <BoardUIBreadcrumbItem
                  href="#dashboard"
                  onClick={() => setLastClicked("Navigated to Dashboard")}
                >
                  Dashboard
                </BoardUIBreadcrumbItem>
                <BoardUIBreadcrumbItem
                  href="#projects"
                  onClick={() => setLastClicked("Navigated to Projects")}
                >
                  Projects
                </BoardUIBreadcrumbItem>
                <BoardUIBreadcrumbItem current icon={RiHomeLine}>
                  BoardUI
                </BoardUIBreadcrumbItem>
              </BoardUIBreadcrumb>
            </div>

            <div className="p-4 rounded-2xl bg-[#f5f1e4]/40 border border-[#e5e1d5]">
              <span className="text-[11px] font-mono text-[#80827f] block mb-2">Deep Hierarchy (With Leading Section Icons)</span>
              <BoardUIBreadcrumb aria-label="Documentation trail">
                <BoardUIBreadcrumbItem
                  icon={RiDashboardLine}
                  onClick={() => setLastClicked("Clicked Chapter Console")}
                >
                  Console
                </BoardUIBreadcrumbItem>
                <BoardUIBreadcrumbItem
                  icon={RiFolderLine}
                  onClick={() => setLastClicked("Clicked Workspaces")}
                >
                  Workspaces
                </BoardUIBreadcrumbItem>
                <BoardUIBreadcrumbItem
                  onClick={() => setLastClicked("Clicked Projects")}
                >
                  GDG Campus
                </BoardUIBreadcrumbItem>
                <BoardUIBreadcrumbItem current icon={RiCompass3Line}>
                  Design System
                </BoardUIBreadcrumbItem>
              </BoardUIBreadcrumb>
            </div>
          </div>
        </div>

        {/* Card 2: Interactive In-Context Demonstration */}
        <div className="p-6 rounded-3xl bg-white border border-[#d5d5d4] shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-[#2c2e2a]">Admin Console Header In-Context</h3>
              <p className="text-xs text-[#80827f]">
                Integrated live into the GDG on Campus AJCE Admin Header for instant section orientation.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#faf9f6] border border-[#e5e1d5] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#2c2e2a]">Simulated Admin Viewport</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  LIVE CONSOLE
                </span>
              </div>

              {/* Live trail based on activeStep */}
              <div className="py-2 px-3 rounded-xl bg-white border border-[#d5d5d4]">
                <BoardUIBreadcrumb aria-label="Dynamic Admin Hierarchy">
                  <BoardUIBreadcrumbItem
                    icon={RiHomeLine}
                    onClick={() => {
                      setActiveStep("home");
                      setLastClicked("Clicked GDG Admin");
                    }}
                  >
                    GDG Admin
                  </BoardUIBreadcrumbItem>
                  <BoardUIBreadcrumbItem
                    icon={RiFolderLine}
                    onClick={() => {
                      setActiveStep("leadership");
                      setLastClicked("Clicked Leadership");
                    }}
                  >
                    Leadership
                  </BoardUIBreadcrumbItem>
                  <BoardUIBreadcrumbItem
                    current
                    icon={RiCompass3Line}
                  >
                    {activeStep === "home" ? "Overview" : activeStep === "leadership" ? "Execom Leads" : "Recruitment Pipeline"}
                  </BoardUIBreadcrumbItem>
                </BoardUIBreadcrumb>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  size="sm"
                  variant={activeStep === "home" ? "default" : "outline"}
                  onClick={() => {
                    setActiveStep("home");
                    setLastClicked("Switched to Overview tab");
                  }}
                  className="text-xs h-7"
                >
                  Home Tab
                </Button>
                <Button
                  size="sm"
                  variant={activeStep === "leadership" ? "default" : "outline"}
                  onClick={() => {
                    setActiveStep("leadership");
                    setLastClicked("Switched to Leadership tab");
                  }}
                  className="text-xs h-7"
                >
                  Execom Tab
                </Button>
                <Button
                  size="sm"
                  variant={activeStep === "recruitment" ? "default" : "outline"}
                  onClick={() => {
                    setActiveStep("recruitment");
                    setLastClicked("Switched to Recruitment tab");
                  }}
                  className="text-xs h-7"
                >
                  Recruitment Tab
                </Button>
              </div>
            </div>
          </div>

          {/* Code preview snippet */}
          <CodeSnippet
            code={`import { RiHomeLine } from "@remixicon/react";\nimport { Breadcrumb, BreadcrumbItem } from "@/components/base/breadcrumb/breadcrumb";\n\n<Breadcrumb aria-label="Pages">\n  <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>\n  <BreadcrumbItem href="/projects">Projects</BreadcrumbItem>\n  <BreadcrumbItem current icon={RiHomeLine}>\n    BoardUI\n  </BreadcrumbItem>\n</Breadcrumb>`}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Color Swatch ─────────────────────────────────────────────────────────────
function ColorSwatch({
  name,
  hex,
  label,
}: {
  name: string;
  hex: string;
  label: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(hex);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="group flex flex-col gap-2 cursor-pointer"
    >
      <div
        className="w-full h-16 rounded-2xl border border-[#e5e1d5] transition-transform group-hover:scale-105"
        style={{ backgroundColor: hex }}
      />
      <div className="text-left">
        <p className="text-xs font-semibold text-[#2c2e2a]">{name}</p>
        <p className="text-xs text-[#80827f] font-mono">
          {copied ? "Copied!" : hex}
        </p>
        <p className="text-xs text-[#80827f]">{label}</p>
      </div>
    </button>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function DesignSystemPage() {
  const [switchOn, setSwitchOn] = useState(false);
  const [checked, setChecked] = useState(false);
  const [inputVal, setInputVal] = useState("");

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#f5f1e4]">
        {/* Header */}
        <div className="border-b border-[#e5e1d5] bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
            <GDGLogoMark className="w-8 h-8" />
            <div>
              <h1 className="text-sm font-bold text-[#2c2e2a] tracking-tight">
                GDG AJCE Design System
              </h1>
              <p className="text-xs text-[#80827f]">
                Component Library · shadcn/ui + GDG Brand Tokens
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="grass">v2.0</Badge>
              <Badge variant="sky">shadcn/ui</Badge>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">

          {/* ── COLOR SYSTEM ── */}
          <Section
            title="Color System"
            description="GDG AJCE Warm Paper design tokens — the single source of truth for all UI."
          >
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold text-[#80827f] mb-3 uppercase tracking-widest">
                  Foundation
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                  <ColorSwatch name="Cream Paper" hex="#f5f1e4" label="Canvas / BG" />
                  <ColorSwatch name="Pure White" hex="#ffffff" label="Cards / Surfaces" />
                  <ColorSwatch name="Sandstone" hex="#e0dbce" label="Muted fills" />
                  <ColorSwatch name="Ink Black" hex="#2c2e2a" label="Primary text" />
                  <ColorSwatch name="Stone Gray" hex="#80827f" label="Muted text" />
                  <ColorSwatch name="Hairline" hex="#d5d5d4" label="Borders" />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#80827f] mb-3 uppercase tracking-widest">
                  Brand Accents
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                  <ColorSwatch name="Fresh Grass" hex="#8ed462" label="Primary accent" />
                  <ColorSwatch name="Coral Pop" hex="#ff705d" label="CTA / Alerts" />
                  <ColorSwatch name="Sky Pop" hex="#2ba0ff" label="Secondary / Info" />
                  <ColorSwatch name="Sunshine" hex="#ffd600" label="Highlights" />
                  <ColorSwatch name="Google Blue" hex="#4285F4" label="Google brand" />
                  <ColorSwatch name="Google Red" hex="#EA4335" label="Google brand" />
                </div>
              </div>
            </div>
          </Section>

          {/* ── TYPOGRAPHY ── */}
          <Section
            title="Typography"
            description="Inter at every scale — from 9px micro-labels to 215px display."
          >
            <div className="space-y-4">
              <div className="p-6 bg-white rounded-3xl border border-[#e5e1d5] space-y-6 overflow-hidden">
                <div className="overflow-hidden">
                  <p className="text-[80px] sm:text-[120px] font-black leading-none tracking-[-0.065em] text-[#2c2e2a]">
                    GDG.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-4xl font-bold tracking-tight text-[#2c2e2a]">
                    Heading Large — Build with Google
                  </p>
                  <p className="text-2xl font-semibold text-[#2c2e2a]">
                    Heading Medium — Innovate Together
                  </p>
                  <p className="text-xl font-medium text-[#2c2e2a]">
                    Heading Small — Learn. Connect. Grow.
                  </p>
                  <p className="text-base text-[#2c2e2a]">
                    Body — The GDG on Campus AJCE community empowers students
                    with Google technologies.
                  </p>
                  <p className="text-sm text-[#80827f]">
                    Body Small — Join 500+ members exploring AI, Cloud, Android,
                    and Web development.
                  </p>
                  <p className="text-xs text-[#80827f] font-semibold uppercase tracking-widest">
                    Micro Label — Google Developer Groups
                  </p>
                </div>
              </div>
            </div>
          </Section>

          {/* ── BUTTONS ── */}
          <Section
            title="Buttons"
            description="Pill-shaped buttons with GDG brand variants. All use rounded-[50px] by default."
          >
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                <Button>Default</Button>
                <Button variant="coral">Coral</Button>
                <Button variant="grass">Grass</Button>
                <Button variant="sky">Sky</Button>
                <Button variant="google">Google</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon">
                  <Plus />
                </Button>
                <Button size="pill">
                  <Sparkles className="h-4 w-4" /> With Icon
                </Button>
              </div>
              <div className="flex flex-wrap gap-3 items-center">
                <Button disabled>Disabled</Button>
                <Button variant="coral">
                  <Heart className="h-4 w-4" /> Like
                </Button>
                <Button variant="grass">
                  <CheckCircle className="h-4 w-4" /> Register
                </Button>
                <Button variant="sky">
                  <ArrowRight className="h-4 w-4" /> Learn More
                </Button>
              </div>
              <CodeSnippet
                code={`import { Button } from "@/components/ui/Button"\n\n<Button variant="coral" size="lg">Register Now</Button>\n<Button variant="grass"><CheckCircle /> Confirm</Button>`}
              />
            </div>
          </Section>

          {/* ── BADGES & CHIPS ── */}
          <Section
            title="Badges & Chips"
            description="Status indicators, tags, and category labels."
          >
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 items-center p-6 bg-white rounded-3xl border border-[#e5e1d5]">
                <Badge>Default</Badge>
                <Badge variant="grass">Grass</Badge>
                <Badge variant="coral">Coral</Badge>
                <Badge variant="sky">Sky</Badge>
                <Badge variant="yellow">Yellow</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="google">Google</Badge>
                <Badge dot variant="grass">
                  Live
                </Badge>
                <Badge dot variant="coral">
                  Closed
                </Badge>
                <Badge dot variant="sky">
                  Online
                </Badge>
              </div>
              {/* Chip: children-based, colors: blue|green|yellow|red|purple|slate */}
              <div className="flex flex-wrap gap-2 items-center p-6 bg-white rounded-3xl border border-[#e5e1d5]">
                <Chip color="blue">Android</Chip>
                <Chip color="green">Web Dev</Chip>
                <Chip color="red">Cloud</Chip>
                <Chip color="yellow">AI/ML</Chip>
                <Chip color="purple">Open Source</Chip>
                <Chip color="slate">Default</Chip>
                <Chip color="blue" variant="bold">Bold</Chip>
                <Chip color="green" variant="outline">Outline</Chip>
              </div>
            </div>
          </Section>

          {/* ── FORM ELEMENTS ── */}
          <Section
            title="Form Elements"
            description="Inputs, selects, checkboxes, switches, and labels with GDG styling."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Text Inputs</CardTitle>
                  <CardDescription>Standard and error states</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Abin Varghese"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="student@ajce.in"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="err">Error State</Label>
                    <Input
                      id="err"
                      error
                      placeholder="Invalid input"
                      defaultValue="wrong@"
                    />
                    <p className="text-xs text-[#ff705d]">
                      Please enter a valid email
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Message</Label>
                    <Textarea placeholder="Tell us about yourself..." rows={3} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Controls</CardTitle>
                  <CardDescription>
                    Checkbox, Switch, and Select
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-1.5">
                    <Label>Domain</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your domain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ai">AI / ML</SelectItem>
                        <SelectItem value="cloud">Cloud</SelectItem>
                        <SelectItem value="android">Android</SelectItem>
                        <SelectItem value="web">Web Dev</SelectItem>
                        <SelectItem value="open-source">Open Source</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="terms"
                      checked={checked}
                      onCheckedChange={(v) => setChecked(!!v)}
                    />
                    <Label htmlFor="terms" className="cursor-pointer">
                      I agree to the terms and conditions
                    </Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox id="news" defaultChecked />
                    <Label htmlFor="news" className="cursor-pointer">
                      Subscribe to GDG newsletter
                    </Label>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifs" className="cursor-pointer">
                      Enable notifications
                    </Label>
                    <Switch
                      id="notifs"
                      checked={switchOn}
                      onCheckedChange={setSwitchOn}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="public" className="cursor-pointer">
                      Public profile
                    </Label>
                    <Switch id="public" defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* ── CARDS ── */}
          <Section
            title="Cards"
            description="Bento-style cards with 36px radius — the foundation of the layout system."
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-[#8ed462]/20 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-[#5a9e30]" />
                    </div>
                    <div>
                      <CardTitle>Hackathon</CardTitle>
                      <CardDescription>48-hour challenge</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#80827f]">
                    Build innovative solutions using Google technologies. Open to
                    all AJCE students.
                  </p>
                </CardContent>
                <CardFooter className="justify-between">
                  <Badge variant="grass" dot>
                    Registrations Open
                  </Badge>
                  <Button size="sm" variant="coral">
                    Join
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-[#2ba0ff]/20 flex items-center justify-center">
                      <Star className="h-5 w-5 text-[#2ba0ff]" />
                    </div>
                    <div>
                      <CardTitle>Workshop</CardTitle>
                      <CardDescription>Google Cloud Next</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#80827f]">
                    Learn Vertex AI, BigQuery, and Cloud Run with hands-on labs
                    guided by GDEs.
                  </p>
                </CardContent>
                <CardFooter className="justify-between">
                  <Badge variant="sky" dot>
                    Upcoming
                  </Badge>
                  <Button size="sm" variant="sky">
                    Register
                  </Button>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-[#ffd600]/20 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-[#80827f]" />
                    </div>
                    <div>
                      <CardTitle>Study Jam</CardTitle>
                      <CardDescription>Google Certifications</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#80827f]">
                    Prepare for Google Cloud Associate and Professional
                    certifications together.
                  </p>
                </CardContent>
                <CardFooter className="justify-between">
                  <Badge variant="yellow" dot>
                    This Week
                  </Badge>
                  <Button size="sm">Join</Button>
                </CardFooter>
              </Card>
            </div>
          </Section>

          {/* ── TABS ── */}
          <Section
            title="Tabs"
            description="Segmented control navigation with GDG muted background."
          >
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-[#80827f]">
                      GDG on Campus AJCE is the official Google Developer Group
                      at Amal Jyothi College of Engineering, empowering students
                      with Google technologies.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="events" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-[#80827f]">
                      60+ events hosted — hackathons, workshops, study jams, and
                      speaker sessions.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="members" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-[#80827f]">
                      500+ active members across all branches and years at AJCE.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="gallery" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-[#80827f]">
                      Memories from MindMarket, SlushArena, SkyHack, and more.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </Section>

          {/* ── ALERTS ── */}
          <Section
            title="Alerts"
            description="Contextual feedback using Google brand colors."
          >
            <div className="space-y-3">
              <Alert
                title="Information"
                description="Your registration for SkyHack 2026 has been received. Check your email for confirmation."
                variant="info"
              />
              <Alert
                title="Success"
                description="Certificate generated successfully! Download it from your profile."
                variant="success"
              />
              <Alert
                title="Warning"
                description="Registration closes in 2 hours. Complete your profile to secure your spot."
                variant="warning"
              />
              <Alert
                title="Error"
                description="Payment failed. Please check your UPI ID and try again."
                variant="error"
              />
            </div>
          </Section>

          {/* ── DIALOGS & OVERLAYS ── */}
          <Section
            title="Dialogs & Overlays"
            description="Modal dialogs, dropdowns, and tooltips."
          >
            <div className="flex flex-wrap gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">Open Dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Register for SkyHack</DialogTitle>
                    <DialogDescription>
                      Fill in your details to register for the 48-hour
                      hackathon.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    <div className="space-y-1.5">
                      <Label>Team Name</Label>
                      <Input placeholder="Team Innovators" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Domain</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose domain" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ai">AI / ML</SelectItem>
                          <SelectItem value="web">Web Dev</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button variant="coral">Register</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-1.5" /> Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="h-4 w-4 mr-2" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="h-4 w-4 mr-2" /> Notifications
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-[#ff705d]">
                    <LogOut className="h-4 w-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Like this event</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Star className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Star / Bookmark</TooltipContent>
              </Tooltip>
            </div>
          </Section>

          {/* ── STATUS ── */}
          <Section
            title="Status Indicators"
            description="Real-time status dots and separators."
          >
            {/*
              StatusDot props:
                color: "green" | "yellow" | "red" | "blue" | "gray"
                ping?: boolean
            */}
            <div className="p-6 bg-white rounded-3xl border border-[#e5e1d5] space-y-4">
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <StatusDot color="green" ping />
                  <span className="text-sm text-[#2c2e2a]">Active / Live</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusDot color="yellow" />
                  <span className="text-sm text-[#2c2e2a]">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusDot color="gray" />
                  <span className="text-sm text-[#2c2e2a]">Inactive</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusDot color="red" />
                  <span className="text-sm text-[#2c2e2a]">Error</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusDot color="blue" />
                  <span className="text-sm text-[#2c2e2a]">Info / Online</span>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-4 text-sm text-[#80827f]">
                <span>Left</span>
                <Separator orientation="vertical" className="h-4" />
                <span>Center</span>
                <Separator orientation="vertical" className="h-4" />
                <span>Right</span>
              </div>
            </div>
          </Section>

          {/* ── BORDER RADII ── */}
          <Section
            title="Border Radii"
            description="GDG's radius hierarchy — from inner items to full pill buttons."
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {[
                { label: "10px", class: "rounded-[10px]", role: "sm" },
                { label: "16px", class: "rounded-[16px]", role: "md" },
                { label: "20px", class: "rounded-[20px]", role: "lg" },
                { label: "28px", class: "rounded-[28px]", role: "inner items" },
                { label: "36px", class: "rounded-[36px]", role: "bento cards" },
                { label: "50px", class: "rounded-[50px]", role: "pills / buttons" },
              ].map((r) => (
                <div key={r.label} className="flex flex-col gap-2">
                  <div
                    className={`${r.class} h-16 bg-[#2c2e2a] flex items-center justify-center`}
                  >
                    <span className="text-white text-xs font-mono font-bold">
                      {r.label}
                    </span>
                  </div>
                  <p className="text-xs text-[#80827f] text-center">{r.role}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* ── BOARDUI ADVANCED DATA TABLE ── */}
          <Section
            title="BoardUI Advanced Data Table"
            description="TanStack-powered data table with sorting, multi-row selection, price/product filtering, density toggling, and pagination."
          >
            <div className="w-full overflow-hidden rounded-3xl border border-[#d5d5d4] p-6 bg-white shadow-xs">
              <DataTableExample />
            </div>
          </Section>

          {/* ── BOARDUI TREE VIEW ── */}
          <Section
            title="BoardUI Tree View"
            description="Nested folders and structured navigation with expandable branches, selection, guide lines, and keyboard navigation."
          >
            <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#d5d5d4] p-5 bg-white shadow-xs">
              <TreeView
                aria-label="Project files tree"
                defaultExpandedKeys={["src", "components"]}
                defaultSelectedKeys={["components"]}
                className="w-full border-0 bg-transparent p-0"
              >
                <TreeViewItem id="src" label="src">
                  <TreeViewItem id="components" label="components">
                    <TreeViewItem id="button" label="button.tsx" />
                    <TreeViewItem id="input" label="input.tsx" />
                    <TreeViewItem id="tree-view-item" label="tree-view.tsx" trailingContent="New" />
                  </TreeViewItem>
                  <TreeViewItem id="hooks" label="hooks">
                    <TreeViewItem id="use-auth" label="use-auth.ts" />
                    <TreeViewItem id="use-theme" label="use-theme.ts" />
                  </TreeViewItem>
                  <TreeViewItem id="page" label="page.tsx" />
                </TreeViewItem>
                <TreeViewItem id="public" label="public">
                  <TreeViewItem id="logo" label="logo.svg" />
                  <TreeViewItem id="favicon" label="favicon.ico" />
                </TreeViewItem>
                <TreeViewItem id="readme" label="README.md" trailingContent="Doc" />
                <TreeViewItem id="package" label="package.json" />
              </TreeView>
            </div>
          </Section>

          {/* ── BOARDUI DATE PICKER & RANGE PICKER ── */}
          <Section
            title="BoardUI Date Picker & Range Picker"
            description="Figma-faithful date and dual-month range calendars on React Aria with Motion animations, editable day chips, and quick-select presets."
          >
            <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-[#d5d5d4] p-6 bg-white shadow-xs">
              <DatePickerShowcase />
            </div>
          </Section>

          {/* ── BOARDUI TIME FIELD ── */}
          <Section
            title="BoardUI Time Field"
            description="Segment-by-segment typed time input with 12/24 hour cycles, comparison validation, and customizable icons on React Aria."
          >
            <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-[#d5d5d4] p-6 bg-white shadow-xs">
              <TimeFieldShowcase />
            </div>
          </Section>

          {/* ── BOARDUI TAG GROUP ── */}
          <Section
            title="BoardUI Tag Group"
            description="Selectable or removable tags in Chip's colors, with keyboard navigation, empty states, and dismiss handles on React Aria's TagGroup."
          >
            <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-[#d5d5d4] p-6 bg-white shadow-xs">
              <TagGroupShowcase />
            </div>
          </Section>

          {/* ── BOARDUI TABS ── */}
          <Section
            title="BoardUI Tabs"
            description="Underline and indicator tabs built on React Aria with roving tabindex, automatic keyboard activation, icons, and dynamic count badges."
          >
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-[#d5d5d4] p-6 bg-white shadow-xs">
              <BoardUITabsShowcase />
            </div>
          </Section>

          {/* ── BOARDUI SKELETON ── */}
          <Section
            title="BoardUI Skeleton"
            description="Content placeholders with smooth sweeping sheen animations (bui-skeleton), rect/text/circle shapes, SkeletonText multi-line paragraphs, and isLoaded blur-in transitions."
          >
            <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-[#d5d5d4] p-6 bg-white shadow-xs">
              <BoardUISkeletonShowcase />
            </div>
          </Section>

          {/* ── BOARDUI LINK BUTTON ── */}
          <Section
            title="BoardUI Link Button"
            description="Inline text actions styled like a link, sized on the same scale as Button (medium, small, xs) without the container, supporting href navigation or onClick triggers with Remix icons."
          >
            <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-[#d5d5d4] p-6 bg-white shadow-xs">
              <BoardUILinkButtonShowcase />
            </div>
          </Section>

          {/* ── BOARDUI BREADCRUMB ── */}
          <Section
            title="BoardUI Breadcrumb"
            description="Trail of ancestor pages with automatic ChevronRightSmall separators, leading Remix icons, interactive hover pills, and semantic aria-current active page styling."
          >
            <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-[#d5d5d4] p-6 bg-white shadow-xs">
              <BoardUIBreadcrumbShowcase />
            </div>
          </Section>

          {/* ── IMPORT GUIDE ── */}
          <Section
            title="Usage Guide"
            description="How to import and use components from the GDG AJCE component library."
          >
            <div className="space-y-4">
              <CodeSnippet
                code={`// Primitives
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/Badge"

// Layout & Containers
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// Navigation
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

// Overlays
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Controls
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"

// Feedback — both are DEFAULT exports
import Alert from "@/components/ui/Alert"
import StatusDot from "@/components/ui/StatusDot"   // color: "green"|"yellow"|"red"|"blue"|"gray", ping?: boolean
import Chip from "@/components/ui/Chip"              // children, color: "blue"|"green"|"yellow"|"red"|"purple"|"slate", variant?: "subtle"|"bold"|"outline"

// GDG-specific
import GDGLogoMark from "@/components/ui/GDGLogoMark"
import GDGFullLogo from "@/components/ui/GDGFullLogo"

// BoardUI Foundation Components
import { Breadcrumb, BreadcrumbItem } from "@/components/base/breadcrumb/breadcrumb"
import { DatePicker } from "@/components/base/date-picker/date-picker"
import { DateRangePicker } from "@/components/base/date-picker/date-range-picker"
import { LinkButton } from "@/components/base/buttons/link-button"
import { Tabs, TabList, Tab, TabPanel } from "@/components/base/tabs/tabs"
import { TimeField } from "@/components/base/time-field/time-field"
import { TagGroup, Tag } from "@/components/base/tag-group/tag-group"
import { Skeleton, SkeletonText } from "@/components/base/skeleton/skeleton"`}
              />
            </div>
          </Section>

          {/* Footer */}
          <div className="text-center py-8 border-t border-[#e5e1d5] space-y-2">
            <div className="flex items-center justify-center gap-2">
              <GDGLogoMark className="w-5 h-5" />
              <p className="text-sm font-semibold text-[#2c2e2a]">
                GDG on Campus AJCE
              </p>
            </div>
            <p className="text-xs text-[#80827f]">
              Component Library built on shadcn/ui + Radix UI + Tailwind CSS v4
              · Warm Paper Design System
            </p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { RiRefreshLine, RiErrorWarningLine, RiSparkling2Line, RiCheckLine } from "@remixicon/react";
import { Button } from "@/components/base/buttons/button";
import { InputBase } from "@/components/base/input/input";
import { cx } from "@/utils/cx";
import { dialogSurface } from "./surface";
import { FieldLabel, Spinner, textAreaClass } from "../ui";
import { getErrorMessage } from "../types";

interface SubjectIdea {
  text: string;
  style: string;
  emoji: string;
}

function storedGeminiKey(): string | undefined {
  try {
    return window.localStorage.getItem("gdg_gemini_api_key") || undefined;
  } catch {
    return undefined;
  }
}

async function callGemini<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/mail-sender/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey: storedGeminiKey(), ...body }),
  });
  const data = (await res.json()) as T & { success?: boolean; error?: string };
  if (!data.success) throw new Error(data.error || "Gemini request failed.");
  return data;
}

/* ------------------------------------------------------------------ */

interface SubjectIdeasDialogProps {
  open: boolean;
  initialTopic: string;
  onOpenChange: (open: boolean) => void;
  onPick: (subject: string) => void;
}

export function SubjectIdeasDialog({ open, initialTopic, onOpenChange, onPick }: SubjectIdeasDialogProps) {
  const [topic, setTopic] = useState(initialTopic);
  const [ideas, setIdeas] = useState<SubjectIdea[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (t: string) => {
    if (!t.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const data = await callGemini<{ subjects: SubjectIdea[] }>({ action: "generate-subjects", topic: t });
      setIdeas(data.subjects ?? []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setTopic(initialTopic);
    setIdeas([]);
    void generate(initialTopic);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cx(dialogSurface, "max-w-lg")}>
        <DialogHeader>
          <DialogTitle className="text-title-3-semibold text-text-primary">Subject line ideas</DialogTitle>
          <DialogDescription className="text-body-regular text-text-secondary">Gemini suggests five options. Pick one to use it.</DialogDescription>
        </DialogHeader>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void generate(topic);
          }}
        >
          <InputBase
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            aria-label="What is this email about?"
            placeholder="What is this email about?"
           
          />
          <Button type="submit" variant="secondary" disabled={busy || !topic.trim()} aria-label="Regenerate ideas">
            {busy ? <Spinner className="size-4" aria-hidden /> : <RiRefreshLine className="size-4" aria-hidden />}
          </Button>
        </form>
        <div className="max-h-80 space-y-2 overflow-y-auto" aria-busy={busy}>
          {error && (
            <p className="flex items-center gap-2 rounded-xl bg-notification-error-background px-3 py-2 text-xs text-text-primary">
              <RiErrorWarningLine className="size-4 shrink-0 text-text-error-primary" aria-hidden /> {error}
            </p>
          )}
          {busy && ideas.length === 0 && (
            <p className="flex items-center justify-center gap-2 py-8 text-xs text-text-secondary">
              <Spinner className="size-4" aria-hidden /> Writing ideas…
            </p>
          )}
          {ideas.map((idea) => (
            <button
              key={idea.text}
              type="button"
              onClick={() => {
                onPick(idea.text);
                onOpenChange(false);
              }}
              className="flex w-full items-start gap-3 rounded-2xl border border-separator-border px-3 py-2.5 text-left transition hover:bg-background-secondary-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring"
            >
              <span aria-hidden className="text-base leading-5">
                {idea.emoji}
              </span>
              <span>
                <span className="block text-sm font-medium text-text-primary">{idea.text}</span>
                <span className="text-[11px] text-text-secondary">{idea.style}</span>
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */

const AI_GOALS = [
  { id: "more_engaging", label: "More engaging", desc: "Livelier tone, community energy" },
  { id: "condense", label: "Shorter", desc: "Cut fluff, keep dates and links" },
  { id: "improve_cta", label: "Stronger call-to-action", desc: "Clearer buttons and RSVPs" },
  { id: "add_guidelines", label: "Add guidelines / FAQ", desc: "Eligibility, prerequisites" },
  { id: "urgent_countdown", label: "Add urgency", desc: "Limited seats, final hours" },
  { id: "custom", label: "Custom instruction", desc: "Tell Gemini exactly what to do" },
] as const;

interface AiAssistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  getCurrentHtml: () => Promise<string | null>;
  onApply: (html: string, summary: string) => void;
}

export function AiAssistDialog({ open, onOpenChange, getCurrentHtml, onApply }: AiAssistDialogProps) {
  const [goal, setGoal] = useState<string>("more_engaging");
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  const needsText = goal === "custom" && !instruction.trim();

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      const html = await getCurrentHtml();
      if (!html) throw new Error("The editor isn't ready yet.");
      const data = await callGemini<{ updatedHtml: string; summary?: string }>({
        action: "update-editor-content",
        content: html,
        instruction,
        goal,
      });
      onApply(data.updatedHtml, data.summary || "Content updated by Gemini.");
      onOpenChange(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent className={cx(dialogSurface, "max-w-xl")}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-title-3-semibold text-text-primary">
            <RiSparkling2Line className="size-5 text-sunshine-pop" aria-hidden /> AI assist
          </DialogTitle>
          <DialogDescription className="text-body-regular text-text-secondary">
            Rewrites the copy in the editor. Merge tags are preserved. Nothing is saved until you press Save.
          </DialogDescription>
        </DialogHeader>
        <div role="radiogroup" aria-label="What should Gemini do?" className="grid gap-2 sm:grid-cols-2">
          {AI_GOALS.map((g) => {
            const selected = goal === g.id;
            return (
              <button
                key={g.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setGoal(g.id)}
                className={cx(
                  "rounded-2xl border px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring",
                  selected ? "border-text-primary bg-background-secondary-default" : "border-separator-border hover:bg-background-secondary-default"
                )}
              >
                <span className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
                  {selected && <RiCheckLine className="size-3.5" aria-hidden />}
                  {g.label}
                </span>
                <span className="text-[11px] text-text-secondary">{g.desc}</span>
              </button>
            );
          })}
        </div>
        <div>
          <FieldLabel htmlFor="ai-instruction" hint={goal === "custom" ? "Required" : "Optional"}>
            Instructions
          </FieldLabel>
          <textarea
            className={textAreaClass}
            id="ai-instruction"
            rows={3}
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="e.g. Mention that laptops are mandatory and doors close at 9:30 AM."
          />
        </div>
        {error && (
          <p className="flex items-center gap-2 rounded-xl bg-notification-error-background px-3 py-2 text-xs text-text-primary">
            <RiErrorWarningLine className="size-4 shrink-0 text-text-error-primary" aria-hidden /> {error}
          </p>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button variant="primary" onClick={run} disabled={busy || needsText}>
            {busy ? <Spinner className="size-4" aria-hidden /> : <RiSparkling2Line className="size-4" aria-hidden />}
            {busy ? "Rewriting…" : "Apply to editor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

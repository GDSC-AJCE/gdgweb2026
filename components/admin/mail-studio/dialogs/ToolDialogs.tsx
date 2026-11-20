"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  toast,
} from "@/components/ui";
import { RiCheckboxCircleFill, RiErrorWarningLine, RiFileCopyLine } from "@remixicon/react";
import { Button } from "@/components/base/buttons/button";
import { InputBase } from "@/components/base/input/input";
import { cx } from "@/utils/cx";
import { dialogSurface } from "./surface";
import { FieldLabel, Spinner } from "../ui";
import { getErrorMessage } from "../types";

interface BaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ResultNote({ ok, text }: { ok: boolean; text: string }) {
  return (
    <p
      role="status"
      className={cx(
        "flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs",
        ok ? "border-fresh-grass/30 bg-fresh-grass/10 text-text-primary" : "border-coral-pop/30 bg-notification-error-background text-text-primary"
      )}
    >
      {ok ? <RiCheckboxCircleFill className="size-4 shrink-0" aria-hidden /> : <RiErrorWarningLine className="size-4 shrink-0" aria-hidden />}
      {text}
    </p>
  );
}

/* ------------------------------------------------------------------ */

interface TestEmailDialogProps extends BaseProps {
  defaultEmail: string;
  templateName: string;
  onSend: (to: string) => Promise<string>;
}

export function TestEmailDialog({ open, onOpenChange, defaultEmail, templateName, onSend }: TestEmailDialogProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (open) {
      setResult(null);
      setEmail((curr) => curr || defaultEmail);
    }
  }, [open, defaultEmail]);

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const submit = async () => {
    if (!valid) return;
    setBusy(true);
    setResult(null);
    try {
      setResult({ ok: true, text: await onSend(email.trim()) });
    } catch (err) {
      setResult({ ok: false, text: getErrorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cx(dialogSurface, "max-w-md")}>
        <DialogHeader>
          <DialogTitle className="text-title-3-semibold text-text-primary">Send a test email</DialogTitle>
          <DialogDescription className="text-body-regular text-text-secondary">
            Sends the saved version of <strong>{templateName}</strong> with sample data, prefixed “[TEST]”.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <div>
            <FieldLabel htmlFor="test-email-to">Send to</FieldLabel>
            <InputBase
              id="test-email-to"
              type="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@amaljyothi.ac.in"
             
            />
          </div>
          {result && <ResultNote ok={result.ok} text={result.text} />}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button type="submit" variant="primary" disabled={!valid || busy}>
              {busy && <Spinner className="size-4" aria-hidden />}
              Send test
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */

const APPS_SCRIPT_CODE = `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    if (data.action === "ping") {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        remainingDailyQuota: MailApp.getRemainingDailyEmails()
      })).setMimeType(ContentService.MimeType.JSON);
    }
    MailApp.sendEmail({
      to: data.to,
      subject: data.subject,
      htmlBody: data.html,
      name: data.name || "GDG on Campus AJCE"
    });
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      remainingDailyQuota: MailApp.getRemainingDailyEmails()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied.`);
  } catch {
    toast.error("Clipboard is unavailable in this browser.");
  }
}

export function SetupGuideDialog({ open, onOpenChange, senderEmail }: BaseProps & { senderEmail: string }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cx(dialogSurface, "flex max-h-[88vh] max-w-2xl flex-col")}>
        <DialogHeader>
          <DialogTitle className="text-title-3-semibold text-text-primary">Apps Script Gateway setup</DialogTitle>
          <DialogDescription className="text-body-regular text-text-secondary">Sends through our Google Workspace account — no app passwords needed.</DialogDescription>
        </DialogHeader>
        <ol className="list-decimal space-y-1.5 pl-5 text-xs text-text-primary">
          <li>Open script.google.com while signed in as {senderEmail} and create a project.</li>
          <li>Paste the code below and save.</li>
          <li>
            Deploy → New deployment → Web app. <strong>Execute as: Me</strong>, <strong>Who has access: Anyone</strong>.
          </li>
          <li>Copy the /exec URL into Delivery → Web App URL, then Test connection.</li>
        </ol>
        <pre className="min-h-0 flex-1 overflow-auto rounded-2xl bg-slate-950 p-4 font-mono text-[11px] leading-relaxed text-slate-100">
          {APPS_SCRIPT_CODE}
        </pre>
        <DialogFooter>
          <Button variant="secondary" onClick={() => copyText(APPS_SCRIPT_CODE, "Script")}>
            <RiFileCopyLine className="size-4" aria-hidden /> Copy code
          </Button>
          <Button variant="primary" onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */

export function ExportHtmlDialog({ open, onOpenChange, html }: BaseProps & { html: string }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cx(dialogSurface, "flex max-h-[88vh] max-w-3xl flex-col")}>
        <DialogHeader>
          <DialogTitle className="text-title-3-semibold text-text-primary">Exported HTML</DialogTitle>
          <DialogDescription className="text-body-regular text-text-secondary">Merge tags like {"{{name}}"} are left in place.</DialogDescription>
        </DialogHeader>
        <textarea
          readOnly
          value={html}
          aria-label="Exported HTML"
          className="min-h-[320px] flex-1 resize-none rounded-2xl bg-slate-950 p-4 font-mono text-[11px] text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring"
        />
        <DialogFooter>
          <Button variant="secondary" onClick={() => copyText(html, "HTML")}>
            <RiFileCopyLine className="size-4" aria-hidden /> Copy HTML
          </Button>
          <Button variant="primary" onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */

interface FigmaDialogProps extends BaseProps {
  onImport: (input: { url: string; token: string; name: string }) => Promise<void>;
}

export function FigmaImportDialog({ open, onOpenChange, onImport }: FigmaDialogProps) {
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const [name, setName] = useState("Figma email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) setError(null);
  }, [open]);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      await onImport({ url: url.trim(), token: token.trim(), name: name.trim() });
      onOpenChange(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent className={cx(dialogSurface, "max-w-lg")}>
        <DialogHeader>
          <DialogTitle className="text-title-3-semibold text-text-primary">Import from Figma</DialogTitle>
          <DialogDescription className="text-body-regular text-text-secondary">The frame becomes an editable template, saved to the cloud.</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <div>
            <FieldLabel htmlFor="figma-url">Frame link</FieldLabel>
            <InputBase
              id="figma-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.figma.com/design/…?node-id=1-23"
              fieldClassName="font-mono"
            />
          </div>
          <div>
            <FieldLabel htmlFor="figma-token" hint="Optional if set on the server">
              Personal access token
            </FieldLabel>
            <InputBase
              id="figma-token"
              type="password"
              autoComplete="off"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="figd_…"
              fieldClassName="font-mono"
            />
          </div>
          <div>
            <FieldLabel htmlFor="figma-name">Save as</FieldLabel>
            <InputBase id="figma-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          {error && <ResultNote ok={false} text={error} />}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={busy || !url.trim() || !name.trim()}>
              {busy && <Spinner className="size-4" aria-hidden />}
              Import
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

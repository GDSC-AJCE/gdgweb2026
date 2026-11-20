"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TemplateRecord } from "@/lib/mail-templates";
import { getErrorMessage, type DeliverySettings, type Recipient, type SendProgress } from "./types";

const PREVIEW_DEBOUNCE_MS = 350;
const SEND_DELAY_MS = 800;

const SAMPLE_RECIPIENT = {
  name: "Rahul Sharma",
  email: "rahul@amaljyothi.ac.in",
  category: "Web Team",
  team: "Web Team",
};

/* ------------------------------------------------------------------ */
/* Live preview                                                        */
/* ------------------------------------------------------------------ */

export function useEmailPreview(
  record: TemplateRecord | null,
  sample: Recipient | undefined,
  whatsappLink: string
) {
  const [html, setHtml] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [nonce, setNonce] = useState(0);
  const seq = useRef(0);

  useEffect(() => {
    if (!record) {
      setHtml("");
      setError(null);
      return;
    }
    if (!record.content.trim()) {
      setHtml("");
      setError("This template has no HTML yet — open it in the Visual Editor and save.");
      return;
    }
    const current = ++seq.current;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const recipient = {
          ...(sample ?? SAMPLE_RECIPIENT),
          whatsapp_link: sample?.whatsapp_link || whatsappLink || undefined,
        };
        const res = await fetch("/api/mail-sender/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateName: record.id,
            templateContent: record.content,
            recipient,
            whatsappLink: whatsappLink || undefined,
          }),
        });
        const data = (await res.json()) as { success?: boolean; html?: string; error?: string };
        if (current !== seq.current) return;
        if (!data.success || !data.html) throw new Error(data.error || "Preview failed.");
        setHtml(data.html);
        setError(null);
      } catch (err) {
        if (current === seq.current) setError(getErrorMessage(err));
      } finally {
        if (current === seq.current) setLoading(false);
      }
    }, PREVIEW_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [record, sample, whatsappLink, nonce]);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);
  return { html, error, loading, refresh };
}

/* ------------------------------------------------------------------ */
/* Test + batch sending                                                */
/* ------------------------------------------------------------------ */

interface DispatchRequest {
  record: TemplateRecord;
  subject: string;
  whatsappLink: string;
  delivery: DeliverySettings;
}

function deliveryBody(delivery: DeliverySettings) {
  return {
    senderName: delivery.senderName,
    gatewayUrl: delivery.engine === "gateway" ? delivery.gatewayUrl : "",
    gatewayApiKey: delivery.gatewayApiKey,
    appPassword: delivery.engine === "password" ? delivery.appPassword : undefined,
  };
}

const IDLE_PROGRESS: SendProgress = {
  running: false,
  current: 0,
  total: 0,
  successCount: 0,
  failCount: 0,
  statusText: "",
  finished: false,
};

interface ProgressEvent {
  index: number;
  total: number;
  success: boolean;
  recipient: { name?: string; email: string };
  error?: string;
  successCount: number;
  failCount: number;
}

export function useMailSender(onRecipientResult: (email: string, ok: boolean) => void) {
  const [progress, setProgress] = useState<SendProgress>(IDLE_PROGRESS);

  const sendTest = useCallback(async (to: string, req: DispatchRequest): Promise<string> => {
    const res = await fetch("/api/mail-sender/test-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        toEmail: to,
        templateName: req.record.id,
        templateContent: req.record.content,
        subject: req.subject,
        whatsappLink: req.whatsappLink || undefined,
        ...deliveryBody(req.delivery),
      }),
    });
    const data = (await res.json()) as { success?: boolean; message?: string; error?: string };
    if (!data.success) throw new Error(data.error || "Test email failed.");
    return data.message || `Test email sent to ${to}.`;
  }, []);

  const handleEvent = useCallback(
    (type: string, payload: unknown) => {
      if (type === "start") {
        setProgress((p) => ({ ...p, statusText: "Connected — sending…" }));
      } else if (type === "progress") {
        const e = payload as ProgressEvent;
        onRecipientResult(e.recipient.email, e.success);
        setProgress((p) => ({
          ...p,
          current: e.index,
          total: e.total,
          successCount: e.successCount,
          failCount: e.failCount,
          statusText: e.success
            ? `Sent to ${e.recipient.name || e.recipient.email}`
            : `Failed for ${e.recipient.email}: ${e.error ?? "unknown error"}`,
        }));
      } else if (type === "done") {
        const e = payload as { successCount: number; failCount: number };
        setProgress((p) => ({
          ...p,
          running: false,
          finished: true,
          statusText: `Done — ${e.successCount} sent, ${e.failCount} failed.`,
        }));
      } else if (type === "cancelled") {
        setProgress((p) => ({ ...p, running: false, finished: true, statusText: "Sending stopped." }));
      }
    },
    [onRecipientResult]
  );

  const sendBatch = useCallback(
    async (recipients: Recipient[], req: DispatchRequest) => {
      setProgress({ ...IDLE_PROGRESS, running: true, total: recipients.length, statusText: "Starting…" });
      try {
        const response = await fetch("/api/mail-sender/send-batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipients: recipients.map((r) => ({
              ...r,
              whatsapp_link: r.whatsapp_link || req.whatsappLink || undefined,
            })),
            templateName: req.record.id,
            templateContent: req.record.content,
            subject: req.subject,
            delay: SEND_DELAY_MS,
            whatsappLink: req.whatsappLink || undefined,
            ...deliveryBody(req.delivery),
          }),
        });
        if (!response.ok || !response.body) {
          const data = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error || `Server responded ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() ?? "";
          for (const chunk of chunks) {
            const type = chunk.match(/^event:\s*(\w+)/m)?.[1];
            const data = chunk.match(/^data:\s*(.*)/m)?.[1];
            if (!type || !data) continue;
            try {
              handleEvent(type, JSON.parse(data));
            } catch {
              /* ignore malformed event */
            }
          }
        }
      } catch (err) {
        setProgress((p) => ({
          ...p,
          running: false,
          finished: true,
          statusText: `Sending failed: ${getErrorMessage(err)}`,
        }));
        throw err;
      } finally {
        setProgress((p) => (p.running ? { ...p, running: false, finished: true } : p));
      }
    },
    [handleEvent]
  );

  const cancel = useCallback(async () => {
    await fetch("/api/mail-sender/cancel", { method: "POST" }).catch(() => undefined);
  }, []);

  const reset = useCallback(() => setProgress(IDLE_PROGRESS), []);

  return { progress, sendTest, sendBatch, cancel, reset };
}

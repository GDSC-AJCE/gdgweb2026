"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "@/components/ui";
import { getErrorMessage, type Recipient } from "./types";

const EVENT_RECIPIENTS_KEY = "gdg_mail_studio_recipients";
const EVENT_WHATSAPP_KEY = "gdg_mail_studio_whatsapp_link";
const EVENT_TITLE_KEY = "gdg_mail_studio_event_title";

export interface SheetTab {
  name: string;
  gid: string;
}

export interface EventHandoff {
  title: string | null;
  whatsappLink: string | null;
}

interface RecipientsResponse {
  success?: boolean;
  error?: string;
  recipients?: Recipient[];
  tabs?: SheetTab[];
}

function withSelection(list: Recipient[]): Recipient[] {
  return list.map((r, idx) => ({
    ...r,
    id: typeof r.id === "number" ? r.id : idx + 1,
    status: r.status === "Sent" ? "Sent" : "Pending",
    selected: r.isValid !== false,
  }));
}

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function useRecipients() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [sheetId, setSheetId] = useState("");
  const [sheetTabs, setSheetTabs] = useState<SheetTab[]>([]);
  const [sheetTab, setSheetTab] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingTabs, setFetchingTabs] = useState(false);
  const [eventHandoff, setEventHandoff] = useState<EventHandoff>({ title: null, whatsappLink: null });

  // Recipients handed over from the Event Mailer (certificates tab).
  useEffect(() => {
    const raw = safeGet(EVENT_RECIPIENTS_KEY);
    const title = safeGet(EVENT_TITLE_KEY);
    let whatsappLink = safeGet(EVENT_WHATSAPP_KEY);

    const apply = (wa: string | null) => {
      setEventHandoff({ title, whatsappLink: wa });
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw) as Recipient[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecipients(
            withSelection(
              parsed.map((r) => ({ ...r, whatsapp_link: r.whatsapp_link || wa || undefined }))
            )
          );
        }
      } catch {
        /* ignore malformed hand-off */
      }
    };

    const eventId = new URLSearchParams(window.location.search).get("eventId");
    if (!eventId) {
      apply(whatsappLink);
      return;
    }
    getDoc(doc(db, "events", eventId))
      .then((snap) => {
        if (snap.exists()) {
          const d = snap.data();
          const wa = String(d.whatsappUrl || d.whatsappLink || d.whatsappGroup || d.postRegistrationLink || "").trim();
          if (wa) whatsappLink = wa;
        }
      })
      .catch(() => undefined)
      .finally(() => apply(whatsappLink));
  }, []);

  const postRecipients = useCallback(async (body: Record<string, unknown>) => {
    const res = await fetch("/api/mail-sender/recipients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json()) as RecipientsResponse;
    if (!data.success || !data.recipients) throw new Error(data.error || "No recipients found.");
    return data.recipients;
  }, []);

  const fetchTabs = useCallback(async () => {
    if (!sheetId.trim()) {
      toast.error("Paste a Google Sheet link first.");
      return;
    }
    setFetchingTabs(true);
    try {
      const res = await fetch("/api/mail-sender/sheet/tabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheetId }),
      });
      const data = (await res.json()) as RecipientsResponse;
      if (!data.tabs?.length) throw new Error(data.error || "No tabs found. Is the sheet shared publicly?");
      setSheetTabs(data.tabs);
      setSheetTab((curr) => (data.tabs!.some((t) => t.name === curr) ? curr : data.tabs![0].name));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setFetchingTabs(false);
    }
  }, [sheetId]);

  const loadFromSheet = useCallback(async () => {
    setLoading(true);
    try {
      const gid = sheetTabs.find((t) => t.name === sheetTab)?.gid;
      const list = await postRecipients({ sheetId, sheetName: sheetTab, gid });
      setRecipients(withSelection(list));
      toast.success(`Loaded ${list.length} recipients.`);
    } catch (err) {
      toast.error(`Sheet import failed: ${getErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  }, [postRecipients, sheetId, sheetTab, sheetTabs]);

  const loadFromCsv = useCallback(
    async (csv: string) => {
      if (!csv.trim()) return;
      setLoading(true);
      try {
        const list = await postRecipients({ csvData: csv });
        setRecipients(withSelection(list));
        toast.success(`Parsed ${list.length} recipients.`);
      } catch (err) {
        toast.error(`Could not parse: ${getErrorMessage(err)}`);
      } finally {
        setLoading(false);
      }
    },
    [postRecipients]
  );

  const loadFromFile = useCallback(
    async (file: File) => {
      try {
        const XLSX = await import("xlsx");
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const first = workbook.Sheets[workbook.SheetNames[0]];
        await loadFromCsv(XLSX.utils.sheet_to_csv(first));
      } catch (err) {
        toast.error(`Could not read file: ${getErrorMessage(err)}`);
      }
    },
    [loadFromCsv]
  );

  const setSelected = useCallback((ids: "all" | "none" | number[], value = true) => {
    setRecipients((prev) =>
      prev.map((r) => {
        if (ids === "all") return { ...r, selected: r.isValid !== false };
        if (ids === "none") return { ...r, selected: false };
        return ids.includes(r.id) ? { ...r, selected: value } : r;
      })
    );
  }, []);

  const markStatus = useCallback((email: string, status: Recipient["status"]) => {
    setRecipients((prev) => prev.map((r) => (r.email === email ? { ...r, status } : r)));
  }, []);

  const clear = useCallback(() => {
    setRecipients([]);
    try {
      window.localStorage.removeItem(EVENT_RECIPIENTS_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const selected = useMemo(() => recipients.filter((r) => r.selected), [recipients]);

  return {
    recipients,
    selected,
    sheetId,
    setSheetId,
    sheetTabs,
    sheetTab,
    setSheetTab,
    loading,
    fetchingTabs,
    eventHandoff,
    fetchTabs,
    loadFromSheet,
    loadFromCsv,
    loadFromFile,
    setSelected,
    markStatus,
    clear,
  };
}

export type RecipientsState = ReturnType<typeof useRecipients>;

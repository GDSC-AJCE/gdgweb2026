"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "@/components/ui";
import { getErrorMessage, type DeliverySettings, type GatewayStatus } from "./types";

const DEFAULT_SETTINGS: DeliverySettings = {
  engine: "gateway",
  gatewayUrl: "",
  gatewayApiKey: "gdgajce",
  senderName: "GDG on Campus AJCE",
  senderEmail: "dsc@amaljyothi.ac.in",
  appPassword: "",
};

export interface DeliveryConfigExtras {
  sheetId?: string;
  sheetName?: string;
  defaultSubject?: string;
  hasServerAppPassword?: boolean;
}

export interface DeliverySettingsState {
  settings: DeliverySettings;
  update: (patch: Partial<DeliverySettings>) => void;
  gatewayStatus: GatewayStatus;
  testGateway: () => Promise<void>;
  save: (extras?: DeliveryConfigExtras) => Promise<void>;
  saving: boolean;
  serverExtras: DeliveryConfigExtras;
  isConfigured: boolean;
}

export function useDeliverySettings(): DeliverySettingsState {
  const [settings, setSettings] = useState<DeliverySettings>(DEFAULT_SETTINGS);
  const [serverExtras, setServerExtras] = useState<DeliveryConfigExtras>({});
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus>({
    tested: false,
    online: false,
    loading: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/mail-sender/config", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: (Record<string, string> & { hasAppPassword?: boolean }) | null) => {
        if (cancelled || !data) return;
        setSettings((prev) => ({
          ...prev,
          gatewayUrl: data.gatewayUrl || prev.gatewayUrl,
          gatewayApiKey: data.gatewayApiKey || prev.gatewayApiKey,
          senderName: data.senderName || prev.senderName,
          senderEmail: data.senderEmail || prev.senderEmail,
          engine: data.gatewayUrl ? "gateway" : prev.engine,
        }));
        setServerExtras({
          sheetId: data.sheetId,
          sheetName: data.sheetName,
          defaultSubject: data.defaultSubject,
          hasServerAppPassword: Boolean(data.hasAppPassword),
        });
      })
      .catch(() => {
        /* defaults stay in place; the delivery card shows it's unconfigured */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback((patch: Partial<DeliverySettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    if (patch.gatewayUrl !== undefined || patch.gatewayApiKey !== undefined) {
      setGatewayStatus({ tested: false, online: false, loading: false });
    }
  }, []);

  const testGateway = useCallback(async () => {
    setGatewayStatus({ tested: false, online: false, loading: true });
    try {
      const res = await fetch("/api/mail-sender/gateway/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gatewayUrl: settings.gatewayUrl, gatewayApiKey: settings.gatewayApiKey }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string; remainingDailyQuota?: number };
      setGatewayStatus({
        tested: true,
        online: Boolean(data.success),
        loading: false,
        message: data.success
          ? `Gateway online · ${data.remainingDailyQuota ?? "—"} emails left today`
          : data.error || "Gateway connection failed",
      });
    } catch (err) {
      setGatewayStatus({ tested: true, online: false, loading: false, message: getErrorMessage(err) });
    }
  }, [settings.gatewayUrl, settings.gatewayApiKey]);

  const save = useCallback(
    async (extras?: DeliveryConfigExtras) => {
      setSaving(true);
      try {
        const res = await fetch("/api/mail-sender/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gatewayUrl: settings.gatewayUrl,
            gatewayApiKey: settings.gatewayApiKey,
            senderName: settings.senderName,
            senderEmail: settings.senderEmail,
            appPassword: settings.appPassword,
            ...extras,
          }),
        });
        const data = (await res.json()) as { success?: boolean; error?: string };
        if (!data.success) throw new Error(data.error || "Server rejected the settings.");
        toast.success("Delivery settings saved.");
      } catch (err) {
        toast.error(`Settings not saved: ${getErrorMessage(err)}`);
      } finally {
        setSaving(false);
      }
    },
    [settings]
  );

  const isConfigured =
    settings.engine === "gateway"
      ? settings.gatewayUrl.trim().startsWith("https://")
      : Boolean(
          settings.senderEmail.trim() &&
            (settings.appPassword.trim() || serverExtras.hasServerAppPassword)
        );

  return { settings, update, gatewayStatus, testGateway, save, saving, serverExtras, isConfigured };
}

export type StudioView = "compose" | "editor" | "ai";

export type SaveState = "idle" | "saving" | "saved" | "error";

export interface Recipient {
  id: number;
  name: string;
  email: string;
  category: string;
  team: string;
  time: string;
  time_slot: string;
  date: string;
  meet_link?: string;
  whatsapp_link?: string;
  status: "Pending" | "Sent" | "Failed";
  isValid: boolean;
  selected?: boolean;
}

export type DeliveryEngine = "gateway" | "password";

export interface DeliverySettings {
  engine: DeliveryEngine;
  gatewayUrl: string;
  gatewayApiKey: string;
  senderName: string;
  senderEmail: string;
  appPassword: string;
}

export interface GatewayStatus {
  tested: boolean;
  online: boolean;
  loading: boolean;
  message?: string;
}

export interface SendProgress {
  running: boolean;
  current: number;
  total: number;
  successCount: number;
  failCount: number;
  statusText: string;
  finished: boolean;
}

export const MERGE_TAGS: ReadonlyArray<{ tag: string; label: string }> = [
  { tag: "{{name}}", label: "Recipient name" },
  { tag: "{{email}}", label: "Recipient email" },
  { tag: "{{team}}", label: "Team / domain" },
  { tag: "{{category}}", label: "Category" },
  { tag: "{{date}}", label: "Date" },
  { tag: "{{time_slot}}", label: "Time slot" },
  { tag: "{{meet_link}}", label: "Google Meet link" },
  { tag: "{{whatsapp_link}}", label: "WhatsApp group link" },
];

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Something went wrong.";
}

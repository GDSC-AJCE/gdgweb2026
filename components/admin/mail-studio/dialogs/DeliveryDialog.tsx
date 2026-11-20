"use client";

import {
  RiCheckboxCircleFill,
  RiCodeSSlashLine,
  RiErrorWarningLine,
  RiExternalLinkLine,
  RiFlashlightLine,
  RiKey2Line,
  RiSave3Line,
  RiSignalTowerLine,
} from "@remixicon/react";
import { Button } from "@/components/base/buttons/button";
import { InputBase } from "@/components/base/input/input";
import { SegmentedControl, SegmentedControlItem } from "@/components/base/segmented-control/segmented-control";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui";
import { cx } from "@/utils/cx";
import type { DeliverySettingsState } from "../useDeliverySettings";
import { FieldLabel, Spinner } from "../ui";
import { dialogSurface } from "./surface";

interface DeliveryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: DeliverySettingsState;
  onSave: () => void;
  onShowSetupGuide: () => void;
}

export function DeliveryDialog({ open, onOpenChange, state, onSave, onShowSetupGuide }: DeliveryDialogProps) {
  const { settings, update, gatewayStatus } = state;
  const isGateway = settings.engine === "gateway";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cx(dialogSurface, "max-w-xl")}>
        <DialogHeader>
          <DialogTitle className="text-title-3-semibold text-text-primary">Delivery settings</DialogTitle>
          <DialogDescription className="text-body-regular text-text-secondary">
            How campaign emails leave the chapter’s Google account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <SegmentedControl
            aria-label="Delivery method"
            selectedKeys={[settings.engine]}
            onSelectionChange={(keys) => {
              const next = Array.from(keys)[0];
              if (next === "gateway" || next === "password") update({ engine: next });
            }}
          >
            <SegmentedControlItem id="gateway">
              <span className="inline-flex items-center gap-1.5">
                <RiFlashlightLine className="size-4" aria-hidden /> Apps Script Gateway
              </span>
            </SegmentedControlItem>
            <SegmentedControlItem id="password">
              <span className="inline-flex items-center gap-1.5">
                <RiKey2Line className="size-4" aria-hidden /> Gmail App Password
              </span>
            </SegmentedControlItem>
          </SegmentedControl>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="sender-name">Sender name</FieldLabel>
              <InputBase id="sender-name" value={settings.senderName} onChange={(e) => update({ senderName: e.target.value })} />
            </div>
            <div>
              <FieldLabel htmlFor="sender-email" hint={isGateway ? "Set by the script owner" : undefined}>
                Sender email
              </FieldLabel>
              <InputBase
                id="sender-email"
                type="email"
                value={settings.senderEmail}
                onChange={(e) => update({ senderEmail: e.target.value })}
                readOnly={isGateway}
              />
            </div>
          </div>

          {isGateway ? (
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_150px]">
              <div>
                <FieldLabel htmlFor="gateway-url" hint="ends with /exec">
                  Web App URL
                </FieldLabel>
                <InputBase
                  id="gateway-url"
                  type="url"
                  value={settings.gatewayUrl}
                  onChange={(e) => update({ gatewayUrl: e.target.value })}
                  fieldClassName="font-mono"
                />
              </div>
              <div>
                <FieldLabel htmlFor="gateway-key">API key</FieldLabel>
                <InputBase
                  id="gateway-key"
                  value={settings.gatewayApiKey}
                  onChange={(e) => update({ gatewayApiKey: e.target.value })}
                  fieldClassName="font-mono"
                />
              </div>
            </div>
          ) : (
            <div>
              <FieldLabel
                htmlFor="app-password"
                hint={
                  <a
                    href="https://myaccount.google.com/apppasswords"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-0.5 text-text-primary underline-offset-2 hover:underline"
                  >
                    Create one <RiExternalLinkLine className="size-3" aria-hidden />
                  </a>
                }
              >
                App password
              </FieldLabel>
              <InputBase
                id="app-password"
                type="password"
                autoComplete="off"
                value={settings.appPassword}
                onChange={(e) => update({ appPassword: e.target.value })}
                placeholder={state.serverExtras.hasServerAppPassword ? "Using the server’s password" : "16 characters"}
                fieldClassName="font-mono"
              />
            </div>
          )}

          {gatewayStatus.tested && gatewayStatus.message && (
            <p
              role="status"
              className={cx(
                "flex items-center gap-2 rounded-2xl px-3 py-2.5 text-body-regular",
                gatewayStatus.online
                  ? "bg-notification-success-background text-notification-success-foreground"
                  : "bg-notification-error-background text-notification-error-foreground",
              )}
            >
              {gatewayStatus.online ? (
                <RiCheckboxCircleFill className="size-4 shrink-0" aria-hidden />
              ) : (
                <RiErrorWarningLine className="size-4 shrink-0" aria-hidden />
              )}
              {gatewayStatus.message}
            </p>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-separator-border pt-4">
          {isGateway ? (
            <Button variant="ghost" size="small" leadingIcon={RiCodeSSlashLine} onClick={onShowSetupGuide}>
              Setup guide
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            {isGateway && (
              <Button
                variant="secondary"
                size="small"
                leadingIcon={gatewayStatus.loading ? Spinner : RiSignalTowerLine}
                onClick={state.testGateway}
                disabled={gatewayStatus.loading}
              >
                Test connection
              </Button>
            )}
            <Button variant="primary" size="small" leadingIcon={state.saving ? Spinner : RiSave3Line} onClick={onSave} disabled={state.saving}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

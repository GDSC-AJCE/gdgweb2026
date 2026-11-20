"use client";

import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { Button } from "@/components/base/buttons/button";
import { InputBase } from "@/components/base/input/input";
import { cx } from "@/utils/cx";
import { dialogSurface } from "./surface";
import { slugifyTemplateId } from "@/lib/mail-templates";
import { FieldLabel, Spinner } from "../ui";

interface NameDialogProps {
  open: boolean;
  mode: "create" | "rename";
  initialName?: string;
  existingIds: string[];
  currentId?: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => Promise<boolean>;
}

export function TemplateNameDialog({
  open,
  mode,
  initialName = "",
  existingIds,
  currentId,
  onOpenChange,
  onSubmit,
}: NameDialogProps) {
  const [name, setName] = useState(initialName);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setName(initialName);
  }, [open, initialName]);

  const slug = slugifyTemplateId(name);
  const clash = mode === "create" && slug && existingIds.includes(slug) && slug !== currentId;
  const valid = slug.length > 0 && !clash;

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    const ok = await onSubmit(name.trim());
    setBusy(false);
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !busy && onOpenChange(o)}>
      <DialogContent className={cx(dialogSurface, "max-w-md")}>
        <DialogHeader>
          <DialogTitle className="text-title-3-semibold text-text-primary">{mode === "create" ? "New template" : "Rename template"}</DialogTitle>
          <DialogDescription className="text-body-regular text-text-secondary">
            {mode === "create"
              ? "Starts with a simple layout you can design in the visual editor."
              : "Only the display name changes; sending history is unaffected."}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
          className="space-y-2"
        >
          <FieldLabel htmlFor="template-name-input">Template name</FieldLabel>
          <InputBase
            id="template-name-input"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Workshop invite"
            aria-invalid={Boolean(clash)}
            aria-describedby="template-name-help"
           
          />
          <p id="template-name-help" className="text-[11px] text-text-secondary">
            {clash ? (
              <span className="text-text-error-primary">A template with this name already exists.</span>
            ) : slug && mode === "create" ? (
              <>
                ID: <code className="font-mono">{slug}</code>
              </>
            ) : (
              " "
            )}
          </p>
          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={!valid || busy}>
              {busy && <Spinner className="size-4" aria-hidden />}
              {mode === "create" ? "Create & design" : "Save name"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteDialogProps {
  templateName: string | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteTemplateDialog({ templateName, onOpenChange, onConfirm }: DeleteDialogProps) {
  return (
    <AlertDialog open={templateName !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{templateName}”?</AlertDialogTitle>
          <AlertDialogDescription>
            It will disappear from Mail Studio for every admin. This can’t be undone from the UI.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground">
            Delete template
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

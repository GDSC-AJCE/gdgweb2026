"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "success" | "warning" | "info";
    loading?: boolean;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "warning",
    loading = false
}: ConfirmationModalProps) {
    useBodyScrollLock(isOpen);

    if (!isOpen) return null;

    const typeStyles = {
        danger: {
            iconBg: "bg-coral-pop/10 border-coral-pop/30",
            iconColor: "text-coral-pop",
            btnVariant: "destructive" as const,
        },
        success: {
            iconBg: "bg-fresh-grass/10 border-fresh-grass/30",
            iconColor: "text-fresh-grass",
            btnVariant: "grass" as const,
        },
        warning: {
            iconBg: "bg-sunshine-pop/10 border-sunshine-pop/40",
            iconColor: "text-sunshine-pop",
            btnVariant: "default" as const,
        },
        info: {
            iconBg: "bg-sky-pop/10 border-sky-pop/30",
            iconColor: "text-sky-pop",
            btnVariant: "default" as const,
        }
    };

    const styles = typeStyles[type];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !loading && onClose()}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-md bg-card border border-border rounded-bento shadow-2xl p-7 text-left overflow-hidden text-card-foreground"
            >
                <div className="flex items-start justify-between mb-5">
                    <div className={cn("w-12 h-12 rounded-2xl border flex items-center justify-center", styles.iconBg)}>
                        {type === "success" ? (
                            <CheckCircle className={cn("w-6 h-6", styles.iconColor)} />
                        ) : type === "info" ? (
                            <Info className={cn("w-6 h-6", styles.iconColor)} />
                        ) : (
                            <AlertTriangle className={cn("w-6 h-6", styles.iconColor)} />
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition disabled:opacity-50 cursor-pointer"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2 tracking-tight">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">{message}</p>

                <div className="flex gap-3 justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={styles.btnVariant}
                        size="sm"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? "Processing..." : confirmText}
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}

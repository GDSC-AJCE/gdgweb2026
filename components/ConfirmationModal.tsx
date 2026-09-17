"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { AlertTriangle, CheckCircle, Info, X } from "lucide-react";

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
            iconBg: "bg-[#EA4335]/10 border-[#EA4335]/30",
            iconColor: "text-[#EA4335]",
            buttonBg: "bg-[#EA4335] hover:bg-[#D93025] text-white",
        },
        success: {
            iconBg: "bg-[#34A853]/10 border-[#34A853]/30",
            iconColor: "text-[#34A853]",
            buttonBg: "bg-[#34A853] hover:bg-[#2D9247] text-white",
        },
        warning: {
            iconBg: "bg-[#FBBC04]/10 border-[#FBBC04]/30",
            iconColor: "text-[#FBBC04]",
            buttonBg: "bg-[#FBBC04] hover:bg-[#F29900] text-[#2c2e2a]",
        },
        info: {
            iconBg: "bg-[#4285F4]/10 border-[#4285F4]/30",
            iconColor: "text-[#4285F4]",
            buttonBg: "bg-[#2c2e2a] hover:bg-[#1a1a1a] text-white",
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
                className="relative w-full max-w-md bg-[#ffffff] border border-[#d5d5d4] rounded-3xl shadow-xs p-7 text-left overflow-hidden"
            >
                <div className="flex items-start justify-between mb-5">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${styles.iconBg}`}>
                        {type === "success" ? (
                            <CheckCircle className={`w-6 h-6 ${styles.iconColor}`} />
                        ) : type === "info" ? (
                            <Info className={`w-6 h-6 ${styles.iconColor}`} />
                        ) : (
                            <AlertTriangle className={`w-6 h-6 ${styles.iconColor}`} />
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="p-2 text-[#80827f] hover:text-[#2c2e2a] rounded-full hover:bg-[#f5f1e4] transition disabled:opacity-50 cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <h3 className="text-xl font-bold text-[#2c2e2a] mb-2 tracking-tight">{title}</h3>
                <p className="text-[#80827f] text-sm leading-relaxed mb-6">{message}</p>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-5 py-2.5 rounded-[50px] border border-[#d5d5d4] text-[#80827f] font-medium text-sm hover:bg-[#f5f1e4] transition disabled:opacity-50 cursor-pointer"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-6 py-2.5 rounded-[50px] font-medium text-sm transition shadow-xs disabled:opacity-50 cursor-pointer ${styles.buttonBg}`}
                    >
                        {loading ? "Processing..." : confirmText}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

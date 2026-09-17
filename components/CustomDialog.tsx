"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    AlertTriangle,
    CheckCircle,
    Info,
    HelpCircle,
    X
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CustomDialogProps {
    isOpen: boolean;
    type: "alert" | "confirm" | "prompt";
    title: string;
    message: string;
    defaultValue?: string;
    onClose: (value: any) => void;
}

export default function CustomDialog({
    isOpen,
    type,
    title,
    message,
    defaultValue = "",
    onClose
}: CustomDialogProps) {
    const [inputValue, setInputValue] = useState(defaultValue);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && type === "prompt") {
            setInputValue(defaultValue);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, type, defaultValue]);

    const handleConfirm = () => {
        if (type === "prompt") {
            onClose(inputValue);
        } else if (type === "confirm") {
            onClose(true);
        } else {
            onClose(undefined);
        }
    };

    const handleCancel = () => {
        if (type === "confirm") {
            onClose(false);
        } else if (type === "prompt") {
            onClose(null);
        } else {
            onClose(undefined);
        }
    };

    const getIcon = () => {
        switch (type) {
            case "alert":
                return <Info className="w-6 h-6 text-[#4285F4]" />;
            case "confirm":
                return <HelpCircle className="w-6 h-6 text-[#FBBC04]" />;
            case "prompt":
                return <AlertTriangle className="w-6 h-6 text-[#EA4335]" />;
            default:
                return <Info className="w-6 h-6 text-[#4285F4]" />;
        }
    };

    const getIconBg = () => {
        switch (type) {
            case "alert":
                return "bg-[#4285F4]/10 border-[#4285F4]/30";
            case "confirm":
                return "bg-[#FBBC04]/10 border-[#FBBC04]/30";
            case "prompt":
                return "bg-[#EA4335]/10 border-[#EA4335]/30";
            default:
                return "bg-[#4285F4]/10 border-[#4285F4]/30";
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleCancel}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        transition={{ type: "spring", damping: 25, stiffness: 320 }}
                        className="relative w-full max-w-md bg-[#ffffff] border border-[#d5d5d4] rounded-3xl shadow-xs p-7 text-left overflow-hidden"
                    >
                        {/* Google top accent line */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC04] to-[#34A853]" />

                        <div className="flex items-start justify-between mb-5">
                            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${getIconBg()}`}>
                                {getIcon()}
                            </div>
                            <button
                                onClick={handleCancel}
                                className="p-2 text-[#80827f] hover:text-[#2c2e2a] rounded-full hover:bg-[#f5f1e4] transition cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <h3 className="text-xl font-bold text-[#2c2e2a] mb-2 tracking-tight">{title}</h3>
                        <p className="text-[#80827f] text-sm leading-relaxed mb-6">{message}</p>

                        {type === "prompt" && (
                            <div className="mb-6">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                                    className="w-full px-4 py-3 rounded-xl bg-[#f5f1e4] border border-[#d5d5d4] text-[#2c2e2a] text-sm focus:outline-none focus:border-[#4285F4] focus:bg-[#ffffff] transition placeholder:text-[#80827f]"
                                    placeholder="Enter value..."
                                />
                            </div>
                        )}

                        <div className="flex gap-3 justify-end">
                            {(type === "confirm" || type === "prompt") && (
                                <button
                                    onClick={handleCancel}
                                    className="px-5 py-2.5 rounded-[50px] border border-[#d5d5d4] text-[#80827f] font-medium text-sm hover:bg-[#f5f1e4] transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                onClick={handleConfirm}
                                className="px-6 py-2.5 rounded-[50px] bg-[#2c2e2a] hover:bg-[#1a1a1a] text-white font-medium text-sm shadow-xs transition cursor-pointer"
                            >
                                {type === "alert" ? "OK" : "Confirm"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

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
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

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
                return <Info className="w-6 h-6 text-sky-pop" />;
            case "confirm":
                return <HelpCircle className="w-6 h-6 text-sunshine-pop" />;
            case "prompt":
                return <AlertTriangle className="w-6 h-6 text-coral-pop" />;
            default:
                return <Info className="w-6 h-6 text-sky-pop" />;
        }
    };

    const getIconBg = () => {
        switch (type) {
            case "alert":
                return "bg-sky-pop/10 border-sky-pop/30";
            case "confirm":
                return "bg-sunshine-pop/10 border-sunshine-pop/30";
            case "prompt":
                return "bg-coral-pop/10 border-coral-pop/30";
            default:
                return "bg-sky-pop/10 border-sky-pop/30";
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
                        className="relative w-full max-w-md bg-card border border-border rounded-bento shadow-2xl p-7 text-left overflow-hidden text-card-foreground"
                    >
                        {/* Google top accent line */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-google-blue via-google-red via-google-yellow to-google-green" />

                        <div className="flex items-start justify-between mb-5">
                            <div className={cn("w-12 h-12 rounded-2xl border flex items-center justify-center", getIconBg())}>
                                {getIcon()}
                            </div>
                            <button
                                onClick={handleCancel}
                                className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition cursor-pointer"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <h3 className="text-xl font-bold text-foreground mb-2 tracking-tight">{title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-6">{message}</p>

                        {type === "prompt" && (
                            <div className="mb-6">
                                <Input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                                    placeholder="Enter value..."
                                />
                            </div>
                        )}

                        <div className="flex gap-3 justify-end">
                            {(type === "confirm" || type === "prompt") && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </Button>
                            )}
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleConfirm}
                            >
                                {type === "alert" ? "OK" : "Confirm"}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

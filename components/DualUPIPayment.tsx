"use client";

import { useState } from "react";
import { Copy, Check, QrCode, Smartphone, ShieldCheck } from "lucide-react";
import GoogleBadge from "./GoogleBadge";

const PAYMENT_METHODS = [
    {
        type: "primary" as const,
        label: "Primary UPI Gateway",
        helper: "Recommended for fast processing",
        upiId: "gdgcommunity@okaxis",
    },
    {
        type: "backup" as const,
        label: "Backup UPI Gateway",
        helper: "Use if primary is down or busy",
        upiId: "gdgtreasury@okicici",
    },
] as const;

interface PaymentCardProps {
    method: (typeof PAYMENT_METHODS)[number];
    isPrimary: boolean;
    amount: number;
}

function PaymentCard({ method, isPrimary, amount }: PaymentCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(method.upiId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            const el = document.createElement("textarea");
            el.value = method.upiId;
            document.body.appendChild(el);
            el.select();
            document.execCommand("copy");
            document.body.removeChild(el);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div
            className={`flex flex-col gap-3 rounded-2xl border p-5 transition-all ${
                isPrimary
                    ? "border-[#4285F4]/40 bg-[#4285F4]/5"
                    : "border-[#d5d5d4] bg-[#f5f1e4]"
            }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <QrCode className={`w-4 h-4 ${isPrimary ? "text-[#4285F4]" : "text-[#80827f]"}`} />
                    <span className="text-xs font-bold text-[#2c2e2a] tracking-tight">
                        {method.label}
                    </span>
                </div>
                {isPrimary ? (
                    <GoogleBadge label="RECOMMENDED" variant="blue" size="sm" />
                ) : (
                    <span className="text-[10px] text-[#80827f] font-mono">BACKUP</span>
                )}
            </div>

            <p className="text-[11px] text-[#80827f] leading-snug">
                {method.helper}
            </p>

            <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#80827f]">
                    <span>UPI ID</span>
                    <span>Tap to copy</span>
                </div>
                <button
                    type="button"
                    onClick={handleCopy}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-[#ffffff] border border-[#d5d5d4] rounded-xl hover:border-[#2c2e2a]/40 transition group cursor-pointer"
                >
                    <span className="text-[#2c2e2a] font-mono text-xs font-semibold truncate pr-2">
                        {method.upiId}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-[#80827f] group-hover:text-[#2c2e2a] transition shrink-0">
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5 text-[#34A853]" />
                                <span className="text-[11px] text-[#34A853] font-semibold">Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5" />
                                <span className="text-[11px]">Copy</span>
                            </>
                        )}
                    </div>
                </button>
            </div>
        </div>
    );
}

interface DualUPIPaymentProps {
    amount: number;
    payeeName?: string;
}

export default function DualUPIPayment({
    amount,
    payeeName = "GDG Community",
}: DualUPIPaymentProps) {
    return (
        <div className="space-y-4">
            {/* Header with Amount */}
            <div className="p-5 rounded-2xl bg-[#ffffff] border border-[#d5d5d4] flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-[10px] font-mono font-medium text-[#80827f] uppercase tracking-widest">
                            Payable Amount
                        </p>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-[#FBBC04] bg-[#FBBC04]/10 border border-[#FBBC04]/20 uppercase">
                            Final
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-[#2c2e2a] tracking-tight">
                        ₹{amount.toLocaleString("en-IN")}
                    </p>
                </div>
                <div className="text-right">
                    <GoogleBadge label="UPI SECURE" variant="green" size="sm" />
                    <p className="text-xs text-[#80827f] mt-1.5 truncate max-w-[150px] font-medium">
                        {payeeName}
                    </p>
                </div>
            </div>

            {/* Instruction Callout */}
            <div className="p-4 rounded-2xl bg-[#4285F4]/10 border border-[#4285F4]/20 text-xs text-[#2c2e2a] leading-relaxed flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#4285F4] shrink-0 mt-0.5" />
                <div>
                    Pay exactly <strong className="text-[#2c2e2a]">₹{amount.toLocaleString("en-IN")}</strong> to the Primary UPI. After completing the payment, note down the 12-digit UTR or Transaction ID and enter it below.
                </div>
            </div>

            {/* Gateway Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((method) => (
                    <PaymentCard
                        key={method.type}
                        method={method}
                        isPrimary={method.type === "primary"}
                        amount={amount}
                    />
                ))}
            </div>
        </div>
    );
}

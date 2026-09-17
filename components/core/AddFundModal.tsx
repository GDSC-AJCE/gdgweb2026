"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, ArrowUpCircle, ArrowDownCircle, Coins } from "lucide-react";

interface AddFundModalProps {
    onClose: () => void;
    onSubmit: (data: any) => void;
    processing: boolean;
}

export default function AddFundModal({ onClose, onSubmit, processing }: AddFundModalProps) {
    const [formData, setFormData] = useState({
        amount: "",
        type: "expense" as "expense" | "income",
        reason: "",
        destination: "",
        date: new Date().toISOString().split("T")[0]
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.amount || isNaN(Number(formData.amount))) newErrors.amount = "Enter valid amount";
        if (!formData.reason.trim()) newErrors.reason = "Reason is required";
        if (formData.type === "expense" && !formData.destination.trim()) newErrors.destination = "Payee/Vendor is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        onSubmit({
            ...formData,
            amount: Number(formData.amount)
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-md bg-[#18191b] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5"
            >
                <div className="flex justify-between items-center pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-[#4285F4]" />
                        <h3 className="text-base font-bold text-white tracking-tight">Record Transaction</h3>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    {/* Type Toggle */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900 border border-zinc-700 rounded-2xl">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: "expense" })}
                            className={`flex items-center justify-center gap-2 py-2 rounded-xl font-bold uppercase tracking-wider transition ${
                                formData.type === "expense"
                                    ? "bg-[#EA4335] text-white shadow-md"
                                    : "text-zinc-400 hover:text-zinc-200"
                            }`}
                        >
                            <ArrowDownCircle className="w-4 h-4" />
                            Expense
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: "income" })}
                            className={`flex items-center justify-center gap-2 py-2 rounded-xl font-bold uppercase tracking-wider transition ${
                                formData.type === "income"
                                    ? "bg-[#34A853] text-white shadow-md"
                                    : "text-zinc-400 hover:text-zinc-200"
                            }`}
                        >
                            <ArrowUpCircle className="w-4 h-4" />
                            Income
                        </button>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Amount (INR)</label>
                        <div className="relative">
                            <span className="absolute left-3.5 top-3 text-zinc-500 font-bold">₹</span>
                            <input
                                type="number"
                                required
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="0"
                                className="w-full pl-8 pr-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-700 text-white text-base font-bold focus:outline-none focus:border-[#4285F4]"
                            />
                        </div>
                        {errors.amount && <p className="text-red-400 text-[10px] mt-1">{errors.amount}</p>}
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Reason / Description</label>
                        <input
                            type="text"
                            required
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            placeholder="e.g. Stickers & Badges for DevFest"
                            className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-[#4285F4]"
                        />
                        {errors.reason && <p className="text-red-400 text-[10px] mt-1">{errors.reason}</p>}
                    </div>

                    {/* Destination / Source */}
                    <div>
                        <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                            {formData.type === "expense" ? "Vendor / Payee Name" : "Source / Sponsor"}
                        </label>
                        <input
                            type="text"
                            value={formData.destination}
                            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                            placeholder={formData.type === "expense" ? "e.g. PrintShop / Swag Maker" : "e.g. Google Sponsorship / Workshop Tickets"}
                            className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-[#4285F4]"
                        />
                    </div>

                    {/* Date */}
                    <div>
                        <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Date</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-[#4285F4]"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-2 border-t border-white/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-full border border-zinc-700 text-zinc-300 text-xs font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2 rounded-full bg-[#4285F4] hover:bg-[#3367D6] disabled:opacity-50 text-white font-semibold text-xs transition shadow-md"
                        >
                            {processing ? "Saving..." : "Save Entry"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

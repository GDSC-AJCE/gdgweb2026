"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
    Coins, 
    ArrowUpRight, 
    ArrowDownRight, 
    Plus, 
    Search, 
    Calendar, 
    RefreshCw, 
    Building2,
    DollarSign
} from "lucide-react";
import GoogleBadge from "../GoogleBadge";

interface FundTrackerProps {
    funds: any[];
    loading: boolean;
    onAddClick: () => void;
    onRefresh: () => void;
    isWriter?: boolean;
}

export default function FundTracker({ funds, loading, onAddClick, onRefresh, isWriter }: FundTrackerProps) {
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState<"all" | "expense" | "income">("all");

    const totalIncome = funds
        .filter(f => f.type === "income")
        .reduce((acc, curr) => acc + (curr.amount || 0), 0);
    
    const totalExpense = funds
        .filter(f => f.type === "expense")
        .reduce((acc, curr) => acc + (curr.amount || 0), 0);
    
    const balance = totalIncome - totalExpense;

    const filteredFunds = funds.filter(f => {
        const matchesSearch = 
            (f.reason || "").toLowerCase().includes(search.toLowerCase()) ||
            (f.destination || "").toLowerCase().includes(search.toLowerCase()) ||
            (f.performedByName || "").toLowerCase().includes(search.toLowerCase());
        const matchesType = filterType === "all" || f.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-6">
            {/* Stats Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Available Balance */}
                <div className="p-6 rounded-3xl bg-[#18191b] border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-5 opacity-5 text-white">
                        <Coins className="w-24 h-24" />
                    </div>
                    <div className="relative z-10 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold tracking-wider">Treasury Balance</span>
                            <GoogleBadge label="LIVE LEDGER" variant={balance >= 0 ? "green" : "red"} size="sm" />
                        </div>
                        <p className="text-3xl font-bold text-white tracking-tight">
                            ₹{balance.toLocaleString("en-IN")}
                        </p>
                        <p className="text-[11px] text-zinc-500 font-mono">Net community reserves</p>
                    </div>
                </div>

                {/* Total Inflow */}
                <div className="p-6 rounded-3xl bg-[#18191b] border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-5 opacity-5 text-[#34A853]">
                        <ArrowUpRight className="w-24 h-24" />
                    </div>
                    <div className="relative z-10 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold tracking-wider">Total Income</span>
                            <span className="w-2 h-2 rounded-full bg-[#34A853]" />
                        </div>
                        <p className="text-3xl font-bold text-[#34A853] tracking-tight">
                            ₹{totalIncome.toLocaleString("en-IN")}
                        </p>
                        <p className="text-[11px] text-zinc-500 font-mono">Ticket sales & sponsorships</p>
                    </div>
                </div>

                {/* Total Outflow */}
                <div className="p-6 rounded-3xl bg-[#18191b] border border-white/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-5 opacity-5 text-[#EA4335]">
                        <ArrowDownRight className="w-24 h-24" />
                    </div>
                    <div className="relative z-10 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold tracking-wider">Total Expenses</span>
                            <span className="w-2 h-2 rounded-full bg-[#EA4335]" />
                        </div>
                        <p className="text-3xl font-bold text-zinc-200 tracking-tight">
                            ₹{totalExpense.toLocaleString("en-IN")}
                        </p>
                        <p className="text-[11px] text-zinc-500 font-mono">Logistics, snacks, swag & tools</p>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="flex items-center gap-3 flex-1 max-w-md">
                    <div className="relative w-full">
                        <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by reason, vendor, or organizer..."
                            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-zinc-900 border border-zinc-750 text-white text-xs focus:outline-none focus:border-[#4285F4] transition"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex rounded-2xl bg-zinc-900 p-1 border border-zinc-750 text-xs">
                        {(["all", "income", "expense"] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setFilterType(t)}
                                className={`px-3 py-1 rounded-xl font-medium capitalize transition ${
                                    filterType === t
                                        ? "bg-white/10 text-white"
                                        : "text-zinc-400 hover:text-zinc-200"
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={onRefresh}
                        className="p-2 rounded-2xl bg-zinc-900 border border-zinc-750 text-zinc-400 hover:text-white transition"
                        title="Refresh"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>

                    {isWriter && (
                        <button
                            onClick={onAddClick}
                            className="px-4 py-2 rounded-2xl bg-[#4285F4] hover:bg-[#3367D6] text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-md"
                        >
                            <Plus className="w-4 h-4" />
                            Add Transaction
                        </button>
                    )}
                </div>
            </div>

            {/* Transaction Ledger Table */}
            <div className="bg-[#18191b] border border-white/10 rounded-3xl overflow-hidden">
                <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-900/80 border-b border-white/10 text-zinc-400 font-mono text-[10px] uppercase">
                        <tr>
                            <th className="p-4">Type</th>
                            <th className="p-4">Reason / Description</th>
                            <th className="p-4">Party / Vendor</th>
                            <th className="p-4">Date</th>
                            <th className="p-4 text-right pr-6">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-zinc-500">
                                    Loading ledger entries...
                                </td>
                            </tr>
                        ) : filteredFunds.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-zinc-500">
                                    No transactions found.
                                </td>
                            </tr>
                        ) : (
                            filteredFunds.map((fund) => {
                                const isIncome = fund.type === "income";
                                return (
                                    <tr key={fund.id} className="hover:bg-white/[0.02] transition">
                                        <td className="p-4">
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                                                    isIncome
                                                        ? "bg-[#34A853]/15 text-[#34A853] border border-[#34A853]/30"
                                                        : "bg-[#EA4335]/15 text-[#EA4335] border border-[#EA4335]/30"
                                                }`}
                                            >
                                                {isIncome ? "Income" : "Expense"}
                                            </span>
                                        </td>
                                        <td className="p-4 font-medium text-white max-w-[260px] truncate">
                                            {fund.reason}
                                        </td>
                                        <td className="p-4 text-zinc-400">
                                            {fund.destination || fund.source || "—"}
                                        </td>
                                        <td className="p-4 font-mono text-zinc-400 text-[11px]">
                                            {fund.date || (fund.createdAt?.toDate ? fund.createdAt.toDate().toLocaleDateString() : "—")}
                                        </td>
                                        <td className="p-4 text-right pr-6 font-bold font-mono text-sm">
                                            <span className={isIncome ? "text-[#34A853]" : "text-white"}>
                                                {isIncome ? "+" : "-"}₹{(fund.amount || 0).toLocaleString("en-IN")}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

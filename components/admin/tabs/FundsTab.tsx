"use client";

import React, { useState } from "react";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Receipt,
  FileSpreadsheet,
} from "lucide-react";
import AddFundModal from "@/components/core/AddFundModal";
import * as XLSX from "xlsx";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface FundsTabProps {
  funds: any[];
  onRefresh: () => void;
  adminName?: string;
}

export default function FundsTab({
  funds,
  onRefresh,
  adminName = "Admin",
}: FundsTabProps) {
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleAddFund = async (data: any) => {
    try {
      setSubmitting(true);
      await addDoc(collection(db, "funds"), {
        title: data.reason,
        amount: Number(data.amount),
        type: data.type,
        destination: data.destination || "",
        date: data.date,
        createdAt: Timestamp.now(),
        createdBy: adminName,
      });
      await addDoc(collection(db, "auditLogs"), {
        action: `Added treasury record: ${data.type.toUpperCase()} INR ${data.amount} for ${data.reason}`,
        admin: adminName,
        target: "Funds",
        timestamp: Timestamp.now(),
      });
      setIsAddModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      alert("Failed to record fund transaction.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalIncome = funds
    .filter((f) => f.type === "credit" || f.type === "income")
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const totalExpense = funds
    .filter((f) => f.type === "debit" || f.type === "expense")
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const netBalance = totalIncome - totalExpense;

  const filteredFunds = funds.filter((f) => {
    if (filter === "income") return f.type === "credit" || f.type === "income";
    if (filter === "expense") return f.type === "debit" || f.type === "expense";
    return true;
  });

  const exportLedger = () => {
    if (funds.length === 0) {
      alert("No financial records to export.");
      return;
    }

    const data = funds.map((f: any, i: number) => ({
      "No.": i + 1,
      Title: f.title || f.description || "",
      Type: (f.type === "credit" || f.type === "income") ? "Income" : "Expense",
      Amount: `INR ${f.amount || 0}`,
      Category: f.category || "General",
      Date: f.date ? new Date(f.date).toLocaleDateString() : "",
      "Receipt URL": f.receiptUrl || "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Treasury Ledger");
    XLSX.writeFile(wb, "GDG_AJCE_Treasury_Ledger.xlsx");
  };

  return (
    <div className="space-y-6 select-none">
      {/* SUMMARY KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-[32px] bg-white border border-[#d5d5d4] shadow-xs">
          <span className="text-xs font-mono font-bold text-[#80827f] uppercase">NET BALANCE</span>
          <h3 className={`text-3xl font-bold mt-2 ${netBalance >= 0 ? "text-[#34A853]" : "text-[#EA4335]"}`}>
            ₹{netBalance.toLocaleString()}
          </h3>
          <p className="text-xs text-[#80827f] mt-1">Available treasury reserves</p>
        </div>

        <div className="p-6 rounded-[32px] bg-white border border-[#d5d5d4] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#80827f] uppercase">TOTAL INFLOW</span>
            <ArrowDownLeft className="w-4 h-4 text-[#34A853]" />
          </div>
          <h3 className="text-3xl font-bold text-[#2c2e2a] mt-2">
            ₹{totalIncome.toLocaleString()}
          </h3>
          <p className="text-xs text-[#80827f] mt-1">Sponsorships & ticket allocations</p>
        </div>

        <div className="p-6 rounded-[32px] bg-white border border-[#d5d5d4] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-[#80827f] uppercase">TOTAL DISBURSEMENTS</span>
            <ArrowUpRight className="w-4 h-4 text-[#EA4335]" />
          </div>
          <h3 className="text-3xl font-bold text-[#2c2e2a] mt-2">
            ₹{totalExpense.toLocaleString()}
          </h3>
          <p className="text-xs text-[#80827f] mt-1">Event swag, cloud hosting & logistics</p>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[32px] bg-white border border-[#d5d5d4] shadow-xs">
        <div>
          <h3 className="text-base font-bold text-[#2c2e2a]">Treasury Ledger ({funds.length})</h3>
          <p className="text-xs text-[#80827f]">Transparent accounting of chapter receipts and expenses.</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Filter Pills */}
          <div className="flex items-center p-1 rounded-full bg-[#f5f1e4] border border-[#d5d5d4]">
            {(["all", "income", "expense"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition ${
                  filter === f
                    ? "bg-white text-[#2c2e2a] shadow-xs"
                    : "text-[#80827f] hover:text-[#2c2e2a]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={exportLedger}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[50px] bg-[#f5f1e4] hover:bg-[#eae5d7] border border-[#d5d5d4] text-xs font-medium text-[#2c2e2a] transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#34A853]" />
            <span>Export XLSX</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-[50px] bg-[#2c2e2a] hover:bg-[#141414] text-white text-xs font-semibold shadow-md transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Entry</span>
          </button>
        </div>
      </div>

      {/* LEDGER TABLE */}
      <div className="rounded-[32px] bg-white border border-[#d5d5d4] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f5f1e4] border-b border-[#d5d5d4] font-mono text-[#80827f] uppercase">
              <tr>
                <th className="px-6 py-3.5">Transaction</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5f1e4]">
              {filteredFunds.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-xs text-[#80827f]">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                filteredFunds.map((entry, idx) => {
                  const isIncome = entry.type === "credit" || entry.type === "income";

                  return (
                    <tr key={entry.id || idx} className="hover:bg-[#f5f1e4]/50 transition">
                      <td className="px-6 py-4">
                        <p className="font-bold text-[#2c2e2a]">{entry.title || entry.description || "General Entry"}</p>
                        <p className="text-[10px] text-[#80827f] font-mono">ID: {entry.id?.substring(0, 8) || "REC"}</p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#f5f1e4] border border-[#d5d5d4] font-mono text-[10px] font-bold">
                          {entry.category || "Operations"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-[#80827f]">
                        {entry.date ? new Date(entry.date).toLocaleDateString() : "Recent"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`font-mono text-sm font-bold ${
                            isIncome ? "text-[#34A853]" : "text-[#EA4335]"
                          }`}
                        >
                          {isIncome ? "+" : "-"} ₹{Number(entry.amount || 0).toLocaleString()}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        {entry.receiptUrl ? (
                          <a
                            href={entry.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[#2ba0ff] hover:underline"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>View</span>
                          </a>
                        ) : (
                          <span className="text-[10px] text-[#80827f] font-mono">No receipt</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD ENTRY MODAL */}
      {isAddModalOpen && (
        <AddFundModal
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddFund}
          processing={submitting}
        />
      )}
    </div>
  );
}

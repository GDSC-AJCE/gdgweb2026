"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Mail,
    Phone,
    Clock,
    CheckCircle2,
    XCircle,
    Trash2,
    Sparkles,
    Send
} from "lucide-react";
import GoogleBadge from "../GoogleBadge";

interface ExecomApplicationCardProps {
    app: any;
    onViewDetails: (app: any) => void;
    onStatusChange: (appId: string, appName: string, appEmail: string, currentStatus: string, newStatus: string) => void;
    onDelete: (appId: string) => void;
    onEmail: (app: any) => void;
    processing: boolean;
    isWriter?: boolean;
}

export default function ExecomApplicationCard({
    app,
    onViewDetails,
    onStatusChange,
    onDelete,
    onEmail,
    processing,
    isWriter = true
}: ExecomApplicationCardProps) {
    const statusVariant = app.status === "accepted" ? "green" : app.status === "rejected" ? "red" : "yellow";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="group relative bg-[#18191b] border border-white/10 rounded-3xl overflow-hidden hover:border-[#4285F4]/40 transition-all flex flex-col h-full shadow-md"
        >
            {/* Clickable Card Body */}
            <div 
                onClick={() => onViewDetails(app)}
                className="p-5 cursor-pointer flex-1 space-y-4"
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-white">
                            {app.name?.substring(0, 2).toUpperCase() || "GD"}
                        </div>
                        <div>
                            <h4 className="font-bold text-sm text-white group-hover:text-[#4285F4] transition">
                                {app.name}
                            </h4>
                            <p className="text-[11px] text-zinc-400 font-mono">
                                {app.semester} &bull; {app.department}
                            </p>
                        </div>
                    </div>
                    <GoogleBadge
                        label={app.status || "PENDING"}
                        variant={statusVariant as any}
                        size="sm"
                    />
                </div>

                {/* Contact row */}
                <div className="space-y-1.5 text-xs text-zinc-400 font-mono">
                    <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span className="truncate">{app.email}</span>
                    </div>
                    {app.phone && (
                        <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                            <span>{app.phone}</span>
                        </div>
                    )}
                </div>

                {/* Track tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                    {app.interests?.map((interest: string) => {
                        let label = interest;
                        if (interest === "content-creation") label = "Creative";
                        if (interest === "non-technical") label = "Management";
                        
                        return (
                            <span key={interest} className="px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300 capitalize">
                                {label}
                            </span>
                        );
                    })}
                </div>
            </div>

            {/* Actions Bar */}
            {isWriter && (
                <div className="px-4 py-3 bg-zinc-900/80 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onStatusChange(app.id, app.name, app.email, app.status, "accepted"); }}
                            disabled={processing || app.status === "accepted"}
                            className={`p-1.5 rounded-xl transition ${app.status === "accepted" ? "text-[#34A853] bg-[#34A853]/15" : "text-zinc-400 hover:text-[#34A853] hover:bg-[#34A853]/10"}`}
                            title="Accept Candidate"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onStatusChange(app.id, app.name, app.email, app.status, "rejected"); }}
                            disabled={processing || app.status === "rejected"}
                            className={`p-1.5 rounded-xl transition ${app.status === "rejected" ? "text-[#EA4335] bg-[#EA4335]/15" : "text-zinc-400 hover:text-[#EA4335] hover:bg-[#EA4335]/10"}`}
                            title="Reject Candidate"
                        >
                            <XCircle className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onStatusChange(app.id, app.name, app.email, app.status, "pending"); }}
                            disabled={processing || app.status === "pending"}
                            className={`p-1.5 rounded-xl transition ${app.status === "pending" ? "text-[#FBBC04] bg-[#FBBC04]/15" : "text-zinc-400 hover:text-[#FBBC04] hover:bg-[#FBBC04]/10"}`}
                            title="Mark Pending"
                        >
                            <Clock className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onEmail(app); }}
                            className="p-1.5 rounded-xl text-zinc-400 hover:text-[#4285F4] hover:bg-[#4285F4]/10 transition"
                            title="Send Email"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onDelete(app.id); }}
                            disabled={processing}
                            className="p-1.5 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition"
                            title="Delete Application"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

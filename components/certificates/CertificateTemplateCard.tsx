"use client";

import { motion } from "framer-motion";
import {
    Pencil,
    Trash2,
    Award
} from "lucide-react";
import GoogleBadge from "../GoogleBadge";

interface CertificateTemplateCardProps {
    template: {
        id: string;
        name: string;
        backgroundUrl: string;
        elements: any[];
    };
    onEdit: () => void;
    onDelete: () => void;
    onIssue: () => void;
}

export default function CertificateTemplateCard({
    template,
    onEdit,
    onDelete,
    onIssue
}: CertificateTemplateCardProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group relative bg-[#1e1f20] border border-white/10 rounded-2xl overflow-hidden hover:border-[#4285F4]/40 transition-all shadow-md"
        >
            {/* Thumbnail Preview */}
            <div className="aspect-[1754/1240] relative overflow-hidden bg-zinc-950">
                {template.backgroundUrl ? (
                    <img
                        src={template.backgroundUrl}
                        alt={template.name}
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600">
                        <Award className="w-12 h-12" />
                    </div>
                )}

                {/* Hover overlay actions */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                    <button
                        onClick={onEdit}
                        className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
                        title="Edit Template"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onIssue}
                        className="p-2.5 rounded-xl bg-[#4285F4] hover:bg-[#3367D6] text-white transition flex items-center gap-1.5 px-3 font-semibold text-xs"
                        title="Issue Certificates"
                    >
                        <Award className="w-4 h-4" />
                        <span>Issue</span>
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition"
                        title="Delete Template"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Template Info */}
            <div className="p-4 flex items-center justify-between">
                <div>
                    <h4 className="font-bold text-white text-sm truncate max-w-[200px]">{template.name}</h4>
                    <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        {template.elements?.length || 0} layout elements
                    </p>
                </div>
                <GoogleBadge label="TEMPLATE" variant="blue" size="sm" />
            </div>
        </motion.div>
    );
}

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    Trash2,
    ChevronUp,
    ChevronDown,
    FileText,
    Hash,
    Phone,
    Mail,
    ListFilter,
    Users,
    CheckSquare,
    User
} from "lucide-react";
import Badge from "./ui/Badge";

export interface FormField {
    id: string;
    type: "text" | "textarea" | "radio" | "checkbox" | "select" | "number" | "email" | "phone";
    label: string;
    required: boolean;
    options?: string[];
    placeholder?: string;
}

export interface TeamMemberField {
    id: string;
    label: string;
    type: "text" | "email" | "phone" | "number" | "select";
    required: boolean;
    placeholder?: string;
    options?: string[];
}

export interface TeamConfig {
    enabled: boolean;
    minMembers: number;
    maxMembers: number;
    teamNameRequired?: boolean;
    memberFields: TeamMemberField[];
}

interface CustomFormBuilderProps {
    fields: FormField[];
    onChange: (fields: FormField[]) => void;
    teamConfig?: TeamConfig;
    onTeamConfigChange?: (config: TeamConfig) => void;
    eventType?: "solo" | "team";
    onEventTypeChange?: (type: "solo" | "team") => void;
    hideParticipationFormat?: boolean;
}

const fieldTypeLabels: Record<FormField["type"], string> = {
    text: "Short Text",
    textarea: "Paragraph Text",
    radio: "Single Choice (Radio)",
    checkbox: "Multiple Choice (Checkbox)",
    select: "Dropdown Menu",
    number: "Numeric Input",
    email: "Email Address",
    phone: "Phone Number"
};

export default function CustomFormBuilder({
    fields,
    onChange,
    teamConfig,
    onTeamConfigChange,
    eventType = "solo",
    onEventTypeChange,
    hideParticipationFormat = false
}: CustomFormBuilderProps) {
    const [expandedField, setExpandedField] = useState<string | null>(null);

    const generateId = () => `field_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const currentTeamConfig: TeamConfig = teamConfig || {
        enabled: eventType === "team",
        minMembers: 2,
        maxMembers: 4,
        teamNameRequired: true,
        memberFields: [
            { id: "member_name", label: "Full Name", type: "text", required: true, placeholder: "Teammate name" },
            { id: "member_email", label: "Email Address", type: "email", required: true, placeholder: "teammate@example.com" },
            { id: "member_phone", label: "Phone Number", type: "phone", required: false, placeholder: "+91 XXXXX XXXXX" }
        ]
    };

    const handleFormatChange = (type: "solo" | "team") => {
        if (onEventTypeChange) onEventTypeChange(type);
        if (onTeamConfigChange) {
            onTeamConfigChange({
                ...currentTeamConfig,
                enabled: type === "team"
            });
        }
    };

    const addField = (type: FormField["type"]) => {
        const newField: FormField = {
            id: generateId(),
            type,
            label: `Question ${fields.length + 1}`,
            required: false,
            placeholder: type === "text" || type === "textarea" ? "Your answer" : "",
            options: ["radio", "checkbox", "select"].includes(type) ? ["Option 1", "Option 2"] : []
        };
        onChange([...fields, newField]);
        setExpandedField(newField.id);
    };

    const removeField = (id: string) => {
        onChange(fields.filter(f => f.id !== id));
        if (expandedField === id) setExpandedField(null);
    };

    const updateField = (id: string, updates: Partial<FormField>) => {
        onChange(fields.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const moveField = (index: number, direction: "up" | "down") => {
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= fields.length) return;
        const newFields = [...fields];
        const temp = newFields[index];
        newFields[index] = newFields[targetIndex];
        newFields[targetIndex] = temp;
        onChange(newFields);
    };

    return (
        <div className="space-y-6">
            {/* Event Participation Type Selector - only for events */}
            {!hideParticipationFormat && (
                <div className="p-5 rounded-[28px] bg-[#f5f1e4] border border-[#d5d5d4] space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-bold text-[#2c2e2a] tracking-tight">Participation Format</h4>
                            <p className="text-xs text-[#80827f] mt-0.5">Determine if participants register individually or as a squad.</p>
                        </div>
                        <Badge label="FORMAT" variant="blue" dot={true} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => handleFormatChange("solo")}
                            className={`p-4 rounded-[24px] border text-left transition-all duration-200 cursor-pointer ${
                                eventType === "solo"
                                    ? "bg-white border-2 border-[#2ba0ff] text-[#2c2e2a] shadow-xs"
                                    : "bg-white/60 border-[#d5d5d4] text-[#80827f] hover:border-[#2c2e2a]/30 hover:bg-white"
                            }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-bold text-[#2c2e2a] flex items-center gap-1.5">
                                    <User className="w-4 h-4 text-[#2ba0ff]" />
                                    Individual / Solo
                                </span>
                                {eventType === "solo" && (
                                    <span className="w-2 h-2 rounded-full bg-[#2ba0ff]" />
                                )}
                            </div>
                            <span className="text-xs text-[#80827f]">Each attendee registers and checks in separately.</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleFormatChange("team")}
                            className={`p-4 rounded-[24px] border text-left transition-all duration-200 cursor-pointer ${
                                eventType === "team"
                                    ? "bg-white border-2 border-[#8ed462] text-[#2c2e2a] shadow-xs"
                                    : "bg-white/60 border-[#d5d5d4] text-[#80827f] hover:border-[#2c2e2a]/30 hover:bg-white"
                            }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-bold text-[#2c2e2a] flex items-center gap-1.5">
                                    <Users className="w-4 h-4 text-[#8ed462]" />
                                    Team / Hackathon
                                </span>
                                {eventType === "team" && (
                                    <span className="w-2 h-2 rounded-full bg-[#8ed462]" />
                                )}
                            </div>
                            <span className="text-xs text-[#80827f]">Team leader registers and manages teammates.</span>
                        </button>
                    </div>

                    {eventType === "team" && onTeamConfigChange && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="pt-4 border-t border-[#d5d5d4] grid grid-cols-2 gap-3"
                        >
                            <div>
                                <label className="text-[10px] font-mono uppercase text-[#80827f] font-semibold block mb-1.5">Min Team Size</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={currentTeamConfig.maxMembers}
                                    value={currentTeamConfig.minMembers}
                                    onChange={(e) => onTeamConfigChange({
                                        ...currentTeamConfig,
                                        minMembers: Math.max(1, parseInt(e.target.value) || 1)
                                    })}
                                    className="w-full px-4 py-2.5 rounded-[50px] bg-white border border-[#d5d5d4] text-xs font-semibold text-[#2c2e2a] focus:outline-none focus:border-[#2ba0ff]"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-mono uppercase text-[#80827f] font-semibold block mb-1.5">Max Team Size</label>
                                <input
                                    type="number"
                                    min={currentTeamConfig.minMembers}
                                    max={10}
                                    value={currentTeamConfig.maxMembers}
                                    onChange={(e) => onTeamConfigChange({
                                        ...currentTeamConfig,
                                        maxMembers: Math.max(currentTeamConfig.minMembers, parseInt(e.target.value) || 4)
                                    })}
                                    className="w-full px-4 py-2.5 rounded-[50px] bg-white border border-[#d5d5d4] text-xs font-semibold text-[#2c2e2a] focus:outline-none focus:border-[#2ba0ff]"
                                />
                            </div>
                        </motion.div>
                    )}
                </div>
            )}

            {/* Custom Question Builder */}
            <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                        <h4 className="text-sm font-bold text-[#2c2e2a] tracking-tight">Custom Questions</h4>
                        <p className="text-xs text-[#80827f]">Collect tailored information and responses from applicants.</p>
                    </div>
                    <Badge label={`${fields.length} Questions`} variant="neutral" dot={false} />
                </div>

                {/* Quick Add Buttons at Top */}
                <div className="p-3.5 rounded-[24px] bg-[#f5f1e4] border border-[#d5d5d4] flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[11px] font-mono uppercase text-[#80827f] font-semibold flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5 text-[#2ba0ff]" /> Quick Add:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                        <button
                            type="button"
                            onClick={() => addField("text")}
                            className="px-3 py-1.5 rounded-[50px] bg-white hover:border-[#2c2e2a]/40 border border-[#d5d5d4] text-[11px] font-semibold text-[#2c2e2a] transition flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer"
                        >
                            <FileText className="w-3 h-3 text-[#2ba0ff]" /> Short Text
                        </button>
                        <button
                            type="button"
                            onClick={() => addField("textarea")}
                            className="px-3 py-1.5 rounded-[50px] bg-white hover:border-[#2c2e2a]/40 border border-[#d5d5d4] text-[11px] font-semibold text-[#2c2e2a] transition flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer"
                        >
                            <FileText className="w-3 h-3 text-[#ff705d]" /> Paragraph
                        </button>
                        <button
                            type="button"
                            onClick={() => addField("select")}
                            className="px-3 py-1.5 rounded-[50px] bg-white hover:border-[#2c2e2a]/40 border border-[#d5d5d4] text-[11px] font-semibold text-[#2c2e2a] transition flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer"
                        >
                            <ListFilter className="w-3 h-3 text-[#fbbc04]" /> Dropdown
                        </button>
                        <button
                            type="button"
                            onClick={() => addField("checkbox")}
                            className="px-3 py-1.5 rounded-[50px] bg-white hover:border-[#2c2e2a]/40 border border-[#d5d5d4] text-[11px] font-semibold text-[#2c2e2a] transition flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer"
                        >
                            <CheckSquare className="w-3 h-3 text-[#8ed462]" /> Checkbox
                        </button>
                        <button
                            type="button"
                            onClick={() => addField("number")}
                            className="px-3 py-1.5 rounded-[50px] bg-white hover:border-[#2c2e2a]/40 border border-[#d5d5d4] text-[11px] font-semibold text-[#2c2e2a] transition flex items-center gap-1 shadow-2xs active:scale-95 cursor-pointer"
                        >
                            <Hash className="w-3 h-3 text-[#80827f]" /> Number
                        </button>
                    </div>
                </div>

                {/* Field List */}
                <div className="space-y-3">
                    {fields.map((field, idx) => (
                        <div
                            key={field.id}
                            className="p-4 rounded-[24px] bg-[#f5f1e4] border border-[#d5d5d4] space-y-3 transition-colors hover:border-[#80827f]"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className="w-6 h-6 rounded-full bg-white border border-[#d5d5d4] text-[11px] font-mono font-bold flex items-center justify-center text-[#2c2e2a] shrink-0">
                                        {idx + 1}
                                    </span>
                                    <span className="text-xs font-bold text-[#2c2e2a] truncate">
                                        {field.label || "Untitled Question"}
                                    </span>
                                    <span className="text-[10px] text-[#80827f] font-mono px-2.5 py-0.5 rounded-[50px] bg-white border border-[#d5d5d4] shrink-0">
                                        {fieldTypeLabels[field.type]}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => moveField(idx, "up")}
                                        disabled={idx === 0}
                                        className="w-7 h-7 rounded-full bg-white border border-[#d5d5d4] flex items-center justify-center text-[#80827f] hover:text-[#2c2e2a] hover:border-[#2c2e2a]/30 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                                        title="Move up"
                                    >
                                        <ChevronUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveField(idx, "down")}
                                        disabled={idx === fields.length - 1}
                                        className="w-7 h-7 rounded-full bg-white border border-[#d5d5d4] flex items-center justify-center text-[#80827f] hover:text-[#2c2e2a] hover:border-[#2c2e2a]/30 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                                        title="Move down"
                                    >
                                        <ChevronDown className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => removeField(field.id)}
                                        className="w-7 h-7 rounded-full bg-white border border-[#ff705d]/30 flex items-center justify-center text-[#ff705d] hover:bg-[#ff705d]/10 transition ml-1 cursor-pointer"
                                        title="Remove question"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Field Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#d5d5d4]">
                                <div>
                                    <label className="text-[10px] font-mono uppercase text-[#80827f] font-semibold block mb-1">Question Title</label>
                                    <input
                                        type="text"
                                        value={field.label}
                                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                                        placeholder="e.g. GitHub Profile or Dietary preference"
                                        className="w-full px-4 py-2 rounded-[50px] bg-white border border-[#d5d5d4] text-[#2c2e2a] text-xs font-medium focus:outline-none focus:border-[#2ba0ff]"
                                    />
                                </div>
                                <div className="flex items-center justify-between sm:justify-end pt-2 sm:pt-4">
                                    <label className="flex items-center gap-2 text-xs font-medium text-[#2c2e2a] cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={field.required}
                                            onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                            className="w-4 h-4 rounded border-[#d5d5d4] text-[#2ba0ff] focus:ring-0 cursor-pointer accent-[#2ba0ff]"
                                        />
                                        <span>Mandatory / Required</span>
                                    </label>
                                </div>
                            </div>

                            {/* Options Editor for Select/Radio/Checkbox */}
                            {["radio", "checkbox", "select"].includes(field.type) && (
                                <div className="space-y-2 pt-2 border-t border-[#d5d5d4]">
                                    <label className="text-[10px] font-mono uppercase text-[#80827f] font-semibold block">Options</label>
                                    <div className="flex flex-wrap gap-2">
                                        {field.options?.map((opt, oIdx) => (
                                            <div key={oIdx} className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#d5d5d4] rounded-[50px] text-xs text-[#2c2e2a]">
                                                <span>{opt}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = field.options?.filter((_, i) => i !== oIdx);
                                                        updateField(field.id, { options: updated });
                                                    }}
                                                    className="text-[#80827f] hover:text-[#ff705d] ml-1 cursor-pointer font-bold"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-1">
                                        <input
                                            type="text"
                                            id={`new-opt-${field.id}`}
                                            placeholder="Type option and press Enter to add..."
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    const input = e.currentTarget;
                                                    if (input.value.trim()) {
                                                        const current = field.options || [];
                                                        updateField(field.id, { options: [...current, input.value.trim()] });
                                                        input.value = "";
                                                    }
                                                }
                                            }}
                                            className="w-full px-4 py-2 rounded-[50px] bg-white border border-[#d5d5d4] text-[#2c2e2a] text-xs placeholder:text-[#80827f] focus:outline-none focus:border-[#2ba0ff]"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Add Question Toolbar */}
                <div className="p-4 rounded-[24px] bg-[#f5f1e4] border border-[#d5d5d4] space-y-2.5">
                    <p className="text-[11px] font-mono uppercase text-[#80827f] font-semibold">Add Question Type:</p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => addField("text")}
                            className="px-4 py-2 rounded-[50px] bg-white hover:border-[#2c2e2a]/40 border border-[#d5d5d4] text-xs font-semibold text-[#2c2e2a] transition flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
                        >
                            <FileText className="w-3.5 h-3.5 text-[#2ba0ff]" /> Short Text
                        </button>
                        <button
                            type="button"
                            onClick={() => addField("textarea")}
                            className="px-4 py-2 rounded-[50px] bg-white hover:border-[#2c2e2a]/40 border border-[#d5d5d4] text-xs font-semibold text-[#2c2e2a] transition flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
                        >
                            <FileText className="w-3.5 h-3.5 text-[#ff705d]" /> Paragraph
                        </button>
                        <button
                            type="button"
                            onClick={() => addField("select")}
                            className="px-4 py-2 rounded-[50px] bg-white hover:border-[#2c2e2a]/40 border border-[#d5d5d4] text-xs font-semibold text-[#2c2e2a] transition flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
                        >
                            <ListFilter className="w-3.5 h-3.5 text-[#fbbc04]" /> Dropdown
                        </button>
                        <button
                            type="button"
                            onClick={() => addField("checkbox")}
                            className="px-4 py-2 rounded-[50px] bg-white hover:border-[#2c2e2a]/40 border border-[#d5d5d4] text-xs font-semibold text-[#2c2e2a] transition flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
                        >
                            <CheckSquare className="w-3.5 h-3.5 text-[#8ed462]" /> Checkbox
                        </button>
                        <button
                            type="button"
                            onClick={() => addField("number")}
                            className="px-4 py-2 rounded-[50px] bg-white hover:border-[#2c2e2a]/40 border border-[#d5d5d4] text-xs font-semibold text-[#2c2e2a] transition flex items-center gap-1.5 shadow-xs active:scale-95 cursor-pointer"
                        >
                            <Hash className="w-3.5 h-3.5 text-[#80827f]" /> Number
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

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
    ListFilter,
    Users,
    CheckSquare,
    User
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/checkbox";

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
                <div className="p-5 rounded-2xl bg-[#faf8f4] border border-[#d5d5d4] space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-bold text-[#2c2e2a] tracking-tight">Participation Format</h4>
                            <p className="text-xs text-[#80827f] mt-0.5">Determine if participants register individually or as a squad.</p>
                        </div>
                        <Badge variant="outline">FORMAT</Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <button
                            type="button"
                            onClick={() => handleFormatChange("solo")}
                            className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                                eventType === "solo"
                                    ? "bg-white border-2 border-[#4285F4] text-[#2c2e2a] shadow-sm"
                                    : "bg-white/70 border-[#d5d5d4] text-[#80827f] hover:border-[#2c2e2a]/30 hover:bg-white"
                            }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-bold text-[#2c2e2a] flex items-center gap-2">
                                    <User className="w-4 h-4 text-[#4285F4]" />
                                    Individual / Solo
                                </span>
                                {eventType === "solo" && (
                                    <span className="w-2 h-2 rounded-full bg-[#4285F4]" />
                                )}
                            </div>
                            <span className="text-xs text-[#80827f]">Each attendee registers and checks in separately.</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleFormatChange("team")}
                            className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                                eventType === "team"
                                    ? "bg-white border-2 border-[#34A853] text-[#2c2e2a] shadow-sm"
                                    : "bg-white/70 border-[#d5d5d4] text-[#80827f] hover:border-[#2c2e2a]/30 hover:bg-white"
                            }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-bold text-[#2c2e2a] flex items-center gap-2">
                                    <Users className="w-4 h-4 text-[#34A853]" />
                                    Team / Squad
                                </span>
                                {eventType === "team" && (
                                    <span className="w-2 h-2 rounded-full bg-[#34A853]" />
                                )}
                            </div>
                            <span className="text-xs text-[#80827f]">Team leader registers and manages teammates.</span>
                        </button>
                    </div>

                    {eventType === "team" && onTeamConfigChange && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="pt-4 border-t border-[#d5d5d4] grid grid-cols-2 gap-4"
                        >
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-[#2c2e2a]">Min Team Size</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={currentTeamConfig.maxMembers}
                                    value={currentTeamConfig.minMembers}
                                    onChange={(e) => onTeamConfigChange({
                                        ...currentTeamConfig,
                                        minMembers: Math.max(1, parseInt(e.target.value) || 1)
                                    })}
                                    className="font-bold"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold text-[#2c2e2a]">Max Team Size</Label>
                                <Input
                                    type="number"
                                    min={currentTeamConfig.minMembers}
                                    max={10}
                                    value={currentTeamConfig.maxMembers}
                                    onChange={(e) => onTeamConfigChange({
                                        ...currentTeamConfig,
                                        maxMembers: Math.max(currentTeamConfig.minMembers, parseInt(e.target.value) || 4)
                                    })}
                                    className="font-bold"
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
                    <Badge variant="outline">{fields.length} Questions</Badge>
                </div>

                {/* Quick Add Buttons at Top */}
                <div className="p-3.5 rounded-2xl bg-[#faf8f4] border border-[#d5d5d4] flex items-center justify-between flex-wrap gap-2 shadow-2xs">
                    <span className="text-xs font-semibold text-[#80827f] flex items-center gap-1.5">
                        <Plus className="w-3.5 h-3.5 text-[#4285F4]" /> Quick Add:
                    </span>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addField("text")}
                            className="h-8 gap-1.5 text-xs rounded-lg"
                        >
                            <FileText className="w-3.5 h-3.5 text-[#4285F4]" /> Short Text
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addField("textarea")}
                            className="h-8 gap-1.5 text-xs rounded-lg"
                        >
                            <FileText className="w-3.5 h-3.5 text-[#EA4335]" /> Paragraph
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addField("select")}
                            className="h-8 gap-1.5 text-xs rounded-lg"
                        >
                            <ListFilter className="w-3.5 h-3.5 text-[#FBBC04]" /> Dropdown
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addField("checkbox")}
                            className="h-8 gap-1.5 text-xs rounded-lg"
                        >
                            <CheckSquare className="w-3.5 h-3.5 text-[#34A853]" /> Checkbox
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addField("number")}
                            className="h-8 gap-1.5 text-xs rounded-lg"
                        >
                            <Hash className="w-3.5 h-3.5 text-[#80827f]" /> Number
                        </Button>
                    </div>
                </div>

                {/* Field List */}
                <div className="space-y-3">
                    {fields.map((field, idx) => (
                        <div
                            key={field.id}
                            className="p-4.5 rounded-2xl bg-white border border-[#d5d5d4] space-y-3.5 transition-all shadow-xs hover:border-[#a0a29f]"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                    <span className="w-6 h-6 rounded-lg bg-[#ebe7dc] text-[11px] font-mono font-bold flex items-center justify-center text-[#2c2e2a] shrink-0">
                                        {idx + 1}
                                    </span>
                                    <span className="text-xs font-bold text-[#2c2e2a] truncate">
                                        {field.label || "Untitled Question"}
                                    </span>
                                    <Badge variant="secondary" className="text-[10px] shrink-0 font-normal">
                                        {fieldTypeLabels[field.type]}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => moveField(idx, "up")}
                                        disabled={idx === 0}
                                        className="w-7 h-7 rounded-lg bg-white border border-[#d5d5d4] flex items-center justify-center text-[#80827f] hover:text-[#2c2e2a] hover:border-[#2c2e2a]/40 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer shadow-2xs"
                                        title="Move up"
                                    >
                                        <ChevronUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveField(idx, "down")}
                                        disabled={idx === fields.length - 1}
                                        className="w-7 h-7 rounded-lg bg-white border border-[#d5d5d4] flex items-center justify-center text-[#80827f] hover:text-[#2c2e2a] hover:border-[#2c2e2a]/40 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer shadow-2xs"
                                        title="Move down"
                                    >
                                        <ChevronDown className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => removeField(field.id)}
                                        className="w-7 h-7 rounded-lg bg-white border border-[#EA4335]/30 flex items-center justify-center text-[#EA4335] hover:bg-[#EA4335]/10 transition ml-1 cursor-pointer shadow-2xs"
                                        title="Remove question"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Field Details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#d5d5d4]">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold text-[#2c2e2a]">Question Title</Label>
                                    <Input
                                        type="text"
                                        value={field.label}
                                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                                        placeholder="e.g. GitHub Profile or Dietary preference"
                                    />
                                </div>
                                <div className="flex items-center justify-between sm:justify-end pt-3 sm:pt-6">
                                    <label className="flex items-center gap-2.5 text-xs font-semibold text-[#2c2e2a] cursor-pointer">
                                        <Checkbox
                                            checked={field.required}
                                            onCheckedChange={(c) => updateField(field.id, { required: Boolean(c) })}
                                        />
                                        <span>Mandatory / Required</span>
                                    </label>
                                </div>
                            </div>

                            {/* Options Editor for Select/Radio/Checkbox */}
                            {["radio", "checkbox", "select"].includes(field.type) && (
                                <div className="space-y-2 pt-2 border-t border-[#d5d5d4]">
                                    <Label className="text-xs font-semibold text-[#80827f]">Options</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {field.options?.map((opt, oIdx) => (
                                            <div key={oIdx} className="flex items-center gap-2 px-3 py-1 bg-[#faf8f4] border border-[#d5d5d4] rounded-lg text-xs font-medium text-[#2c2e2a]">
                                                <span>{opt}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = field.options?.filter((_, i) => i !== oIdx);
                                                        updateField(field.id, { options: updated });
                                                    }}
                                                    className="text-[#80827f] hover:text-[#EA4335] cursor-pointer font-bold text-sm"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-1">
                                        <Input
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
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Add Question Toolbar */}
                <div className="p-4 rounded-2xl bg-[#faf8f4] border border-[#d5d5d4] space-y-3 shadow-2xs">
                    <p className="text-xs font-semibold text-[#80827f]">Add Question Type:</p>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addField("text")}
                            className="gap-1.5"
                        >
                            <FileText className="w-3.5 h-3.5 text-[#4285F4]" /> Short Text
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addField("textarea")}
                            className="gap-1.5"
                        >
                            <FileText className="w-3.5 h-3.5 text-[#EA4335]" /> Paragraph
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addField("select")}
                            className="gap-1.5"
                        >
                            <ListFilter className="w-3.5 h-3.5 text-[#FBBC04]" /> Dropdown
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addField("checkbox")}
                            className="gap-1.5"
                        >
                            <CheckSquare className="w-3.5 h-3.5 text-[#34A853]" /> Checkbox
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addField("number")}
                            className="gap-1.5"
                        >
                            <Hash className="w-3.5 h-3.5 text-[#80827f]" /> Number
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

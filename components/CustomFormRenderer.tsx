"use client";

import React from "react";
import { FormField } from "./CustomFormBuilder";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown } from "lucide-react";

export interface TeamMemberEntry {
    [fieldId: string]: any;
}

export function MemberFieldsForm({
    member,
    index,
    memberFields,
    onChange,
    errors
}: {
    member: any;
    index: number;
    memberFields: any[];
    onChange: (fieldId: string, value: any) => void;
    errors?: Record<string, string>;
}) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {memberFields.map((mField) => (
                <div key={mField.id} className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#2c2e2a] flex items-center justify-between">
                        <span>{mField.label}</span>
                        {mField.required && <span className="text-[#EA4335] text-[10px] font-mono">*Required</span>}
                    </Label>
                    {mField.type === "select" ? (
                        <div className="relative">
                            <select
                                value={member[mField.id] || ""}
                                onChange={(e) => onChange(mField.id, e.target.value)}
                                className="flex h-10 w-full rounded-xl border border-[#d5d5d4] bg-white px-3.5 py-2 text-sm text-[#2c2e2a] shadow-xs transition-all duration-200 focus-visible:outline-none focus-visible:border-[#4285F4] focus-visible:ring-3 focus-visible:ring-[#4285F4]/20 hover:border-[#a0a29f] cursor-pointer appearance-none pr-10"
                            >
                                <option value="">Select option...</option>
                                {mField.options?.map((opt: string, oIdx: number) => (
                                    <option key={oIdx} value={opt}>{opt}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#80827f] pointer-events-none" />
                        </div>
                    ) : (
                        <Input
                            type={mField.type === "number" ? "number" : mField.type === "email" ? "email" : mField.type === "phone" ? "tel" : "text"}
                            placeholder={mField.placeholder || ""}
                            value={member[mField.id] || ""}
                            onChange={(e) => onChange(mField.id, e.target.value)}
                            error={Boolean(errors?.[`member_${index}_${mField.id}`])}
                        />
                    )}
                    {errors?.[`member_${index}_${mField.id}`] && (
                        <p className="text-[#EA4335] text-[11px] font-medium mt-0.5">{errors[`member_${index}_${mField.id}`]}</p>
                    )}
                </div>
            ))}
        </div>
    );
}

export function CustomFieldsForm({
    fields,
    values,
    onChange,
    errors
}: {
    fields: FormField[];
    values: Record<string, any>;
    onChange: (values: Record<string, any>) => void;
    errors?: Record<string, string>;
}) {
    const handleChange = (fieldId: string, value: any) => {
        onChange({ ...values, [fieldId]: value });
    };

    const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
        const current = values[fieldId] || [];
        const updated = checked
            ? [...current, option]
            : current.filter((v: string) => v !== option);
        onChange({ ...values, [fieldId]: updated });
    };

    return (
        <div className="space-y-4">
            {fields.map((field) => (
                <div key={field.id} className="space-y-1.5">
                    <Label className="text-xs font-semibold text-[#2c2e2a] flex items-center justify-between">
                        <span>{field.label}</span>
                        {field.required && <span className="text-[#EA4335] text-[10px] font-mono">*Required</span>}
                    </Label>

                    {/* Text Input */}
                    {field.type === "text" && (
                        <Input
                            type="text"
                            placeholder={field.placeholder || "Your answer"}
                            value={values[field.id] || ""}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            error={Boolean(errors?.[field.id])}
                        />
                    )}

                    {/* Textarea */}
                    {field.type === "textarea" && (
                        <Textarea
                            rows={3}
                            placeholder={field.placeholder || "Enter details..."}
                            value={values[field.id] || ""}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            error={Boolean(errors?.[field.id])}
                        />
                    )}

                    {/* Number */}
                    {field.type === "number" && (
                        <Input
                            type="number"
                            placeholder={field.placeholder || "0"}
                            value={values[field.id] || ""}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            error={Boolean(errors?.[field.id])}
                        />
                    )}

                    {/* Email */}
                    {field.type === "email" && (
                        <Input
                            type="email"
                            placeholder={field.placeholder || "email@example.com"}
                            value={values[field.id] || ""}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            error={Boolean(errors?.[field.id])}
                        />
                    )}

                    {/* Phone */}
                    {field.type === "phone" && (
                        <Input
                            type="tel"
                            placeholder={field.placeholder || "+91 XXXXX XXXXX"}
                            value={values[field.id] || ""}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            error={Boolean(errors?.[field.id])}
                        />
                    )}

                    {/* Select Dropdown */}
                    {field.type === "select" && (
                        <div className="relative">
                            <select
                                value={values[field.id] || ""}
                                onChange={(e) => handleChange(field.id, e.target.value)}
                                className="flex h-10 w-full rounded-xl border border-[#d5d5d4] bg-white px-3.5 py-2 text-sm text-[#2c2e2a] shadow-xs transition-all duration-200 focus-visible:outline-none focus-visible:border-[#4285F4] focus-visible:ring-3 focus-visible:ring-[#4285F4]/20 hover:border-[#a0a29f] cursor-pointer appearance-none pr-10"
                            >
                                <option value="">Select option...</option>
                                {field.options?.map((opt, oIdx) => (
                                    <option key={oIdx} value={opt}>{opt}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#80827f] pointer-events-none" />
                        </div>
                    )}

                    {/* Radio Options */}
                    {field.type === "radio" && (
                        <div className="space-y-2 pt-1">
                            {field.options?.map((opt, oIdx) => {
                                const isChecked = values[field.id] === opt;
                                return (
                                    <label
                                        key={oIdx}
                                        onClick={() => handleChange(field.id, opt)}
                                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition text-xs font-medium ${
                                            isChecked
                                                ? "bg-[#4285F4]/5 border-[#4285F4] text-[#2c2e2a] shadow-2xs"
                                                : "bg-white border-[#d5d5d4] hover:border-[#a0a29f] text-[#2c2e2a]"
                                        }`}
                                    >
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                                            isChecked ? "border-[#4285F4] bg-[#4285F4]" : "border-[#d5d5d4] bg-white"
                                        }`}>
                                            {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                        </div>
                                        <span>{opt}</span>
                                    </label>
                                );
                            })}
                        </div>
                    )}

                    {/* Checkbox Options */}
                    {field.type === "checkbox" && (
                        <div className="space-y-2 pt-1">
                            {field.options?.map((opt, oIdx) => {
                                const checked = (values[field.id] || []).includes(opt);
                                return (
                                    <label
                                        key={oIdx}
                                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition text-xs font-medium ${
                                            checked
                                                ? "bg-[#4285F4]/5 border-[#4285F4] text-[#2c2e2a] shadow-2xs"
                                                : "bg-white border-[#d5d5d4] hover:border-[#a0a29f] text-[#2c2e2a]"
                                        }`}
                                    >
                                        <Checkbox
                                            checked={checked}
                                            onCheckedChange={(c) => handleCheckboxChange(field.id, opt, Boolean(c))}
                                        />
                                        <span>{opt}</span>
                                    </label>
                                );
                            })}
                        </div>
                    )}

                    {errors?.[field.id] && (
                        <p className="text-[#EA4335] text-[11px] font-medium mt-0.5">{errors[field.id]}</p>
                    )}
                </div>
            ))}
        </div>
    );
}

export default function CustomFormRenderer(props: any) {
    return <CustomFieldsForm {...props} />;
}

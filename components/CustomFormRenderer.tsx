"use client";

import { FormField } from "./CustomFormBuilder";

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {memberFields.map((mField) => (
                <div key={mField.id} className="space-y-1.5">
                    <label className="text-[10px] font-mono font-medium text-[#80827f] uppercase tracking-wider flex items-center justify-between">
                        <span>{mField.label}</span>
                        {mField.required && <span className="text-[#EA4335] text-[9px] font-mono">*Required</span>}
                    </label>
                    {mField.type === "select" ? (
                        <select
                            value={member[mField.id] || ""}
                            onChange={(e) => onChange(mField.id, e.target.value)}
                            className="w-full bg-[#f5f1e4] border border-[#d5d5d4] focus:border-[#4285F4] focus:bg-[#ffffff] rounded-2xl px-3.5 py-2.5 text-[#2c2e2a] text-xs outline-none transition cursor-pointer"
                        >
                            <option value="">Select option...</option>
                            {mField.options?.map((opt: string, oIdx: number) => (
                                <option key={oIdx} value={opt}>{opt}</option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type={mField.type === "number" ? "number" : mField.type === "email" ? "email" : mField.type === "phone" ? "tel" : "text"}
                            placeholder={mField.placeholder || ""}
                            value={member[mField.id] || ""}
                            onChange={(e) => onChange(mField.id, e.target.value)}
                            className="w-full bg-[#f5f1e4] border border-[#d5d5d4] focus:border-[#4285F4] focus:bg-[#ffffff] rounded-2xl px-3.5 py-2.5 text-[#2c2e2a] text-xs outline-none transition placeholder:text-[#80827f]"
                        />
                    )}
                    {errors?.[`member_${index}_${mField.id}`] && (
                        <p className="text-[#EA4335] text-[10px] mt-0.5">{errors[`member_${index}_${mField.id}`]}</p>
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
                    <label className="text-[10px] font-mono font-medium text-[#80827f] uppercase tracking-wider flex items-center justify-between">
                        <span>{field.label}</span>
                        {field.required && <span className="text-[#EA4335] text-[9px] font-mono">*Required</span>}
                    </label>

                    {/* Text Input */}
                    {field.type === "text" && (
                        <input
                            type="text"
                            placeholder={field.placeholder || "Your answer"}
                            value={values[field.id] || ""}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            className="w-full bg-[#f5f1e4] border border-[#d5d5d4] focus:border-[#4285F4] focus:bg-[#ffffff] rounded-2xl px-4 py-3 text-[#2c2e2a] text-xs outline-none transition placeholder:text-[#80827f]"
                        />
                    )}

                    {/* Textarea */}
                    {field.type === "textarea" && (
                        <textarea
                            rows={3}
                            placeholder={field.placeholder || "Enter details..."}
                            value={values[field.id] || ""}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            className="w-full bg-[#f5f1e4] border border-[#d5d5d4] focus:border-[#4285F4] focus:bg-[#ffffff] rounded-2xl px-4 py-3 text-[#2c2e2a] text-xs outline-none transition placeholder:text-[#80827f] resize-none"
                        />
                    )}

                    {/* Number */}
                    {field.type === "number" && (
                        <input
                            type="number"
                            placeholder={field.placeholder || "0"}
                            value={values[field.id] || ""}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            className="w-full bg-[#f5f1e4] border border-[#d5d5d4] focus:border-[#4285F4] focus:bg-[#ffffff] rounded-2xl px-4 py-3 text-[#2c2e2a] text-xs outline-none transition"
                        />
                    )}

                    {/* Email */}
                    {field.type === "email" && (
                        <input
                            type="email"
                            placeholder={field.placeholder || "email@example.com"}
                            value={values[field.id] || ""}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            className="w-full bg-[#f5f1e4] border border-[#d5d5d4] focus:border-[#4285F4] focus:bg-[#ffffff] rounded-2xl px-4 py-3 text-[#2c2e2a] text-xs outline-none transition placeholder:text-[#80827f]"
                        />
                    )}

                    {/* Phone */}
                    {field.type === "phone" && (
                        <input
                            type="tel"
                            placeholder={field.placeholder || "+91 XXXXX XXXXX"}
                            value={values[field.id] || ""}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            className="w-full bg-[#f5f1e4] border border-[#d5d5d4] focus:border-[#4285F4] focus:bg-[#ffffff] rounded-2xl px-4 py-3 text-[#2c2e2a] text-xs outline-none transition placeholder:text-[#80827f]"
                        />
                    )}

                    {/* Select Dropdown */}
                    {field.type === "select" && (
                        <select
                            value={values[field.id] || ""}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            className="w-full bg-[#f5f1e4] border border-[#d5d5d4] focus:border-[#4285F4] focus:bg-[#ffffff] rounded-2xl px-4 py-3 text-[#2c2e2a] text-xs outline-none transition cursor-pointer"
                        >
                            <option value="">Select option...</option>
                            {field.options?.map((opt, oIdx) => (
                                <option key={oIdx} value={opt}>{opt}</option>
                            ))}
                        </select>
                    )}

                    {/* Radio Options */}
                    {field.type === "radio" && (
                        <div className="space-y-2 pt-1">
                            {field.options?.map((opt, oIdx) => (
                                <label
                                    key={oIdx}
                                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#f5f1e4] border border-[#d5d5d4] hover:border-[#2c2e2a]/40 cursor-pointer transition text-xs text-[#2c2e2a]"
                                >
                                    <input
                                        type="radio"
                                        name={field.id}
                                        value={opt}
                                        checked={values[field.id] === opt}
                                        onChange={() => handleChange(field.id, opt)}
                                        className="text-[#4285F4] focus:ring-0"
                                    />
                                    <span>{opt}</span>
                                </label>
                            ))}
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
                                        className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#f5f1e4] border border-[#d5d5d4] hover:border-[#2c2e2a]/40 cursor-pointer transition text-xs text-[#2c2e2a]"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={(e) => handleCheckboxChange(field.id, opt, e.target.checked)}
                                            className="rounded text-[#4285F4] focus:ring-0"
                                        />
                                        <span>{opt}</span>
                                    </label>
                                );
                            })}
                        </div>
                    )}

                    {errors?.[field.id] && (
                        <p className="text-[#EA4335] text-[10px] mt-0.5">{errors[field.id]}</p>
                    )}
                </div>
            ))}
        </div>
    );
}

export default function CustomFormRenderer(props: any) {
    return <CustomFieldsForm {...props} />;
}

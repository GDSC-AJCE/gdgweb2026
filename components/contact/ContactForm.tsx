"use client";

import { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useDialog } from "@/context/DialogContext";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";

export default function ContactForm() {
    const dialog = useDialog();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.email.trim() || !formData.subject || !formData.message.trim()) {
            dialog.alert("Please fill in all fields before submitting.", "Missing Information");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            dialog.alert("Please provide a valid email address.", "Invalid Email");
            return;
        }

        setSubmitting(true);
        try {
            await addDoc(collection(db, "contactFormResponses"), {
                name: formData.name.trim(),
                email: formData.email.trim(),
                subject: formData.subject,
                message: formData.message.trim(),
                submittedAt: Timestamp.now(),
                isRead: false,
                replied: false,
            });

            dialog.alert("Your inquiry has been received! A member of the GDG team will get in touch shortly.", "Inquiry Sent");
            setFormData({ name: "", email: "", subject: "", message: "" });
        } catch (error) {
            console.error("Error submitting contact form:", error);
            dialog.alert("Failed to deliver your message. Please try again or email us directly.", "Error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 select-none">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#2c2e2a]">Name *</label>
                    <input
                        type="text"
                        placeholder="Alex Developer"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-[#f5f1e4] border border-[#d5d5d4] hover:border-[#2c2e2a]/40 focus:border-[#2c2e2a] rounded-2xl px-4 py-2.5 text-xs text-[#2c2e2a] placeholder-[#80827f] outline-none transition"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#2c2e2a]">Email *</label>
                    <input
                        type="email"
                        placeholder="alex@gmail.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-[#f5f1e4] border border-[#d5d5d4] hover:border-[#2c2e2a]/40 focus:border-[#2c2e2a] rounded-2xl px-4 py-2.5 text-xs text-[#2c2e2a] placeholder-[#80827f] outline-none transition"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#2c2e2a]">Subject *</label>
                <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#f5f1e4] border border-[#d5d5d4] hover:border-[#2c2e2a]/40 focus:border-[#2c2e2a] rounded-2xl px-4 py-2.5 text-xs text-[#2c2e2a] outline-none transition cursor-pointer"
                >
                    <option value="" disabled>Select inquiry reason</option>
                    <option value="Partnership & Sponsorship">Partnership & Sponsorship</option>
                    <option value="Speaker Invitation">Speaker Invitation</option>
                    <option value="Event Inquiry">Event Inquiry</option>
                    <option value="Mentorship & Codelabs">Mentorship & Codelabs</option>
                    <option value="General Question">General Question</option>
                </select>
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#2c2e2a]">Message *</label>
                <textarea
                    rows={4}
                    placeholder="Tell us what's on your mind..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#f5f1e4] border border-[#d5d5d4] hover:border-[#2c2e2a]/40 focus:border-[#2c2e2a] rounded-2xl p-3 text-xs text-[#2c2e2a] placeholder-[#80827f] outline-none transition resize-none"
                />
            </div>

            <button
                type="submit"
                disabled={submitting}
                className="group w-full py-3.5 bg-[#ff705d] hover:bg-[#ee6350] text-white font-medium text-[15px] rounded-[50px] transition-all shadow-xs flex items-center justify-center gap-2.5 disabled:opacity-50 active:scale-98 cursor-pointer hover:-translate-y-[1px]"
            >
                <PaperAirplaneIcon className="w-4 h-4" />
                <span>{submitting ? "Sending..." : "Submit Message"}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffffff] transition-all duration-300 group-hover:scale-125" />
            </button>
        </form>
    );
}

"use client";

import { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useDialog } from "@/context/DialogContext";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
        <div className="space-y-2">
          <Label htmlFor="contact-name" className="text-xs font-semibold text-[#2c2e2a]">
            Name <span className="text-[#EA4335]">*</span>
          </Label>
          <Input
            id="contact-name"
            type="text"
            placeholder="Alex Developer"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="h-11 bg-white rounded-xl border-[#d5d5d4] text-sm text-[#2c2e2a]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-email" className="text-xs font-semibold text-[#2c2e2a]">
            Email <span className="text-[#EA4335]">*</span>
          </Label>
          <Input
            id="contact-email"
            type="email"
            placeholder="alex@gmail.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="h-11 bg-white rounded-xl border-[#d5d5d4] text-sm text-[#2c2e2a]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold text-[#2c2e2a]">
          Subject <span className="text-[#EA4335]">*</span>
        </Label>
        <Select
          value={formData.subject}
          onValueChange={(val) => setFormData({ ...formData, subject: val })}
        >
          <SelectTrigger className="h-11 bg-white rounded-xl border-[#d5d5d4] text-sm text-[#2c2e2a]">
            <SelectValue placeholder="Select inquiry reason" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Partnership & Sponsorship">Partnership & Sponsorship</SelectItem>
            <SelectItem value="Speaker Invitation">Speaker Invitation</SelectItem>
            <SelectItem value="Event Inquiry">Event Inquiry</SelectItem>
            <SelectItem value="Mentorship & Codelabs">Mentorship & Codelabs</SelectItem>
            <SelectItem value="General Question">General Question</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message" className="text-xs font-semibold text-[#2c2e2a]">
          Message <span className="text-[#EA4335]">*</span>
        </Label>
        <Textarea
          id="contact-message"
          rows={4}
          placeholder="Tell us what's on your mind..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="min-h-[110px] bg-white rounded-xl border-[#d5d5d4] text-sm text-[#2c2e2a]"
        />
      </div>

      <Button
        type="submit"
        variant="google"
        disabled={submitting}
        className="w-full h-12 bg-[#ff705d] hover:bg-[#ee6350] text-white font-medium text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
      >
        <Send className="w-4 h-4" />
        <span>{submitting ? "Sending..." : "Submit Message"}</span>
      </Button>
    </form>
  );
}

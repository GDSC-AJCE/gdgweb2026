"use client";

import { useState } from "react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Users, Sparkles, Send, Clock, Briefcase, Award } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/Button";

interface MembershipApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginRequired: () => void;
}

const teams = [
  {
    id: "ai_ml",
    name: "AI & Machine Learning",
    description: "Gemini API, TensorFlow, Vertex AI, agents, and computer vision projects",
    icon: "✨",
    color: "#4285F4"
  },
  {
    id: "cloud",
    name: "Cloud & DevOps",
    description: "Google Cloud Platform, Docker, Kubernetes, CI/CD, and serverless architectures",
    icon: "☁️",
    color: "#34A853"
  },
  {
    id: "mobile_web",
    name: "Mobile & Web",
    description: "Flutter, Android (Jetpack Compose), Next.js, React, and modern UI engineering",
    icon: "📱",
    color: "#EA4335"
  },
  {
    id: "design",
    name: "UI/UX & Branding",
    description: "Design systems, visual storytelling, prototypes, and community media assets",
    icon: "🎨",
    color: "#FBBC04"
  },
  {
    id: "community",
    name: "Operations & Outreach",
    description: "Event organizing, speaker relations, hackathons, and developer engagement",
    icon: "🚀",
    color: "#9333EA"
  }
];

export default function MembershipApplicationModal({
  isOpen,
  onClose,
  onLoginRequired
}: MembershipApplicationModalProps) {
  const { user, userData } = useAuth();

  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [whyJoin, setWhyJoin] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("");
  const [availability, setAvailability] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      onLoginRequired();
      return;
    }

    if (!selectedTeam) {
      setError("Please select a domain or team track");
      return;
    }

    if (!whyJoin.trim()) {
      setError("Please share your motivation for joining GDG");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await addDoc(collection(db, "membershipApplications"), {
        userId: user.uid,
        name: user.displayName || userData?.displayName || "Anonymous",
        email: user.email,
        photoURL: user.photoURL || null,
        department: userData?.department || "",
        college: userData?.college || "",
        graduationYear: userData?.graduationYear || "",
        phoneNumber: userData?.phoneNumber || "",
        team: selectedTeam,
        teamName: teams.find((t) => t.id === selectedTeam)?.name || selectedTeam,
        whyJoin: whyJoin.trim(),
        skills: skills.trim(),
        experience: experience.trim(),
        availability: availability.trim(),
        status: "pending",
        submittedAt: Timestamp.now(),
        reviewedAt: null,
        reviewedBy: null,
        reviewNote: null
      });

      setSuccess(true);
    } catch (err) {
      console.error("Error submitting application:", err);
      setError("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setSelectedTeam("");
      setWhyJoin("");
      setSkills("");
      setExperience("");
      setAvailability("");
      setError("");
      setSuccess(false);
      onClose();
    }
  };

  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-[#2c2e2a]/50 backdrop-blur-sm"
      />

      <motion.div
        data-scroll-allow
        data-lenis-prevent
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        className="relative w-full max-w-2xl bg-white border border-[#d5d5d4] rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#e5e1d5] flex justify-between items-center bg-[#faf9f6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4285F4]/10 border border-[#4285F4]/20 flex items-center justify-center text-[#4285F4]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#2c2e2a]">Apply for GDG Membership</h3>
              <p className="text-xs text-[#80827f]">Join the Google Developer Groups chapter community</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="w-9 h-9 rounded-xl border border-[#d5d5d4] hover:bg-[#f5f1e4] flex items-center justify-center text-[#80827f] hover:text-[#2c2e2a] transition disabled:opacity-50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 px-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#34A853]/10 border border-[#34A853]/20 flex items-center justify-center mx-auto mb-4 text-[#34A853]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-[#2c2e2a] mb-2">Application Submitted!</h3>
              <p className="text-[#80827f] mb-6 max-w-sm mx-auto text-xs leading-relaxed">
                Thank you for applying to join GDG AJCE! Our team leads will review your application and follow up via email.
              </p>
              <Button
                variant="google"
                onClick={handleClose}
                className="px-6 h-11 rounded-xl font-semibold text-xs"
              >
                Done
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Track Selection */}
              <div className="space-y-2.5">
                <Label className="text-xs font-semibold text-[#2c2e2a]">
                  Select Your Track / Domain <span className="text-[#EA4335]">*</span>
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {teams.map((team) => {
                    const isSelected = selectedTeam === team.id;
                    return (
                      <button
                        key={team.id}
                        type="button"
                        onClick={() => setSelectedTeam(team.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#4285F4]/5 border-[#4285F4] shadow-sm ring-1 ring-[#4285F4]"
                            : "bg-[#faf9f6] border-[#d5d5d4] hover:border-[#2c2e2a]/40 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 mb-1">
                          <span className="text-base">{team.icon}</span>
                          <span className={`font-semibold text-sm ${isSelected ? "text-[#4285F4]" : "text-[#2c2e2a]"}`}>
                            {team.name}
                          </span>
                        </div>
                        <p className="text-xs text-[#80827f] pl-6 line-clamp-2 leading-relaxed">{team.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Why Join */}
              <div className="space-y-2">
                <Label htmlFor="membership-why-join" className="text-xs font-semibold text-[#2c2e2a]">
                  Why do you want to join GDG? <span className="text-[#EA4335]">*</span>
                </Label>
                <Textarea
                  id="membership-why-join"
                  value={whyJoin}
                  onChange={(e) => setWhyJoin(e.target.value)}
                  placeholder="Tell us about your enthusiasm for Google technologies and community growth..."
                  className="min-h-[100px] bg-white rounded-xl border-[#d5d5d4] text-sm text-[#2c2e2a]"
                  required
                />
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label htmlFor="membership-skills" className="text-xs font-semibold text-[#2c2e2a]">
                  Relevant Skills & Technologies
                </Label>
                <Input
                  id="membership-skills"
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Flutter, Android, Python, Firebase, Figma, Cloud Run..."
                  className="h-11 bg-white rounded-xl border-[#d5d5d4] text-sm text-[#2c2e2a]"
                />
              </div>

              {/* Experience */}
              <div className="space-y-2">
                <Label htmlFor="membership-experience" className="text-xs font-semibold text-[#2c2e2a]">
                  Prior Experience / Projects
                </Label>
                <Textarea
                  id="membership-experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="GitHub repositories, portfolio links, or previous club activities..."
                  className="min-h-[90px] bg-white rounded-xl border-[#d5d5d4] text-sm text-[#2c2e2a]"
                />
              </div>

              {/* Availability */}
              <div className="space-y-2">
                <Label htmlFor="membership-availability" className="text-xs font-semibold text-[#2c2e2a]">
                  Estimated Weekly Commitment
                </Label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#80827f] pointer-events-none" />
                  <Input
                    id="membership-availability"
                    type="text"
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    placeholder="e.g., 5-8 hours per week"
                    className="pl-10 h-11 bg-white rounded-xl border-[#d5d5d4] text-sm text-[#2c2e2a]"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-[#EA4335]/10 border border-[#EA4335]/20 text-[#EA4335] text-xs font-medium">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-3 border-t border-[#e5e1d5]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={submitting}
                  className="h-11 px-5 rounded-xl border-[#d5d5d4] text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="google"
                  disabled={submitting}
                  className="h-11 px-6 rounded-xl text-xs font-semibold shadow-sm"
                >
                  <Send className="w-3.5 h-3.5 mr-2" />
                  <span>{submitting ? "Submitting..." : "Submit Application"}</span>
                </Button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Check, AlertCircle, ArrowLeft, HeartHandshake } from "lucide-react";
import { YellowHexagon, BlueWavyRosette } from "@/components/newsletter/NewsletterShapes";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please provide a valid email address.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to unsubscribe");
      }

      setUnsubscribed(true);
    } catch (err: any) {
      setError(err.message || "Failed to unsubscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#d5d5d4] rounded-[36px] p-8 sm:p-12 max-w-md w-full shadow-sm text-center space-y-6 relative overflow-hidden">
      {/* Top Google 4-Color Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-50%-[#FBBC04] to-[#34A853]" />

      <div className="w-14 h-14 rounded-full bg-[#f5f1e4] flex items-center justify-center mx-auto text-[#2c2e2a]">
        {unsubscribed ? (
          <Check className="w-6 h-6 text-[#34A853]" />
        ) : (
          <Mail className="w-6 h-6 text-[#80827f]" />
        )}
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-[#2c2e2a] tracking-tight">
          {unsubscribed ? "You've been unsubscribed" : "Unsubscribe from GDG Tech Pulse"}
        </h1>
        <p className="text-xs sm:text-sm text-[#80827f] leading-relaxed">
          {unsubscribed
            ? "We're sorry to see you go! You will no longer receive weekly developer updates at this address."
            : "We respect your inbox. Confirm your email below to stop receiving the weekly Monday briefing."}
        </p>
      </div>

      {!unsubscribed ? (
        <form onSubmit={handleUnsubscribe} className="space-y-4 text-left">
          <div>
            <label className="text-xs font-semibold text-[#80827f] uppercase tracking-wider block mb-1.5">
              Subscriber Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@amaljyothi.ac.in"
              required
              className="w-full px-4 py-3 bg-[#f5f1e4]/50 border border-[#d5d5d4] rounded-[18px] text-xs text-[#2c2e2a] outline-none focus:border-[#2c2e2a] transition"
            />
          </div>

          {error && (
            <div className="p-3 bg-[#EA4335]/10 border border-[#EA4335] rounded-xl text-[#EA4335] text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-full bg-[#EA4335] hover:bg-[#d9382b] text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            {loading ? "Unsubscribing..." : "Unsubscribe Me"}
          </button>
        </form>
      ) : (
        <div className="space-y-4 pt-2">
          <p className="text-xs text-[#80827f]">
            Unsubscribed by mistake? You can always{" "}
            <Link href="/newsletter" className="text-[#4285F4] underline font-semibold">
              re-subscribe anytime
            </Link>
            .
          </p>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#2c2e2a] text-white text-xs font-semibold rounded-full hover:opacity-90 transition w-full"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to GDG AJCE Homepage
          </Link>
        </div>
      )}
    </div>
  );
}

export default function NewsletterUnsubscribePage() {
  return (
    <div className="relative min-h-screen bg-[#f5f1e4] flex items-center justify-center p-6 text-[#2c2e2a] overflow-hidden">
      {/* Subtle Background Shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-12 left-12 opacity-40">
          <YellowHexagon />
        </div>
        <div className="absolute bottom-12 right-12 opacity-40">
          <BlueWavyRosette />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Suspense fallback={
          <div className="bg-white p-6 rounded-full border border-[#d5d5d4] text-xs font-semibold text-center">
            Loading preferences...
          </div>
        }>
          <UnsubscribeContent />
        </Suspense>
      </div>
    </div>
  );
}

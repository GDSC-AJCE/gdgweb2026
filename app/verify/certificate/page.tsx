"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

function VerifyCertificateRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");

  useEffect(() => {
    if (id) {
      router.replace(`/verify/${encodeURIComponent(id)}`);
    }
  }, [id, router]);

  if (!id) {
    return (
      <div className="min-h-screen bg-[#f5f1e4] flex items-center justify-center p-6 text-[#2c2e2a]">
        <div className="p-8 rounded-[32px] bg-white border border-[#d5d5d4] max-w-md w-full text-center shadow-xs">
          <h2 className="text-xl font-bold text-[#2c2e2a] mb-2">Certificate Verification</h2>
          <p className="text-xs text-[#80827f] mb-6">
            Please provide a valid certificate credential ID to verify authenticity.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem("certId") as HTMLInputElement)?.value.trim();
              if (input) router.push(`/verify/${encodeURIComponent(input)}`);
            }}
            className="space-y-3"
          >
            <input
              type="text"
              name="certId"
              placeholder="e.g. GDG-2026-N8N-4892"
              required
              className="w-full px-4 py-2.5 rounded-full bg-[#f5f1e4] border border-[#d5d5d4] text-xs text-[#2c2e2a] font-mono placeholder-[#80827f] focus:outline-hidden focus:border-[#2ba0ff]"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-full bg-[#2c2e2a] hover:bg-black text-white text-xs font-semibold transition"
            >
              Verify Certificate
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f1e4] flex items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}

export default function VerifyCertificatePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5f1e4] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      <VerifyCertificateRedirect />
    </Suspense>
  );
}

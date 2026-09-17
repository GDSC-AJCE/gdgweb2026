"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";

export default function CoreRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f5f1e4] flex items-center justify-center p-6 text-[#2c2e2a]">
      <div className="bg-white border border-[#d5d5d4] p-8 rounded-[32px] max-w-md w-full text-center shadow-sm">
        <div className="w-12 h-12 rounded-[16px] bg-[#2ba0ff]/10 text-[#2ba0ff] flex items-center justify-center mx-auto mb-4">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-medium tracking-tight text-[#2c2e2a] mb-2">
          Redirecting to Admin Panel...
        </h1>
        <p className="text-xs text-[#2c2e2a]/60 mb-6">
          The GDG management console has been upgraded to the modern MindMarket Admin Panel.
        </p>
        <Link
          href="/admin"
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#2c2e2a] text-white text-xs font-medium rounded-[50px] hover:opacity-90 transition w-full"
        >
          Go to Admin Panel
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

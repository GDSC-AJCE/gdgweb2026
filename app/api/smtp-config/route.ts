import { NextRequest, NextResponse } from "next/server";
import { getResendConfig, RESEND_COOKIE_NAME, LEGACY_SMTP_COOKIE_NAME } from "@/lib/resend";

export async function GET(req: NextRequest) {
    const resendCfg = getResendConfig(req.cookies);

    if (resendCfg.configured) {
        const maskedKey = resendCfg.apiKey
            ? `${resendCfg.apiKey.slice(0, 7)}...${resendCfg.apiKey.slice(-4)}`
            : "";
        return NextResponse.json({
            configured: true,
            provider: "resend",
            viaEnv: resendCfg.viaEnv,
            from: resendCfg.from,
            apiKeyMasked: maskedKey,
            // Fallback backward-compat fields
            host: "api.resend.com",
            user: resendCfg.from,
        });
    }

    return NextResponse.json({ 
        configured: false, 
        provider: "resend",
        from: process.env.RESEND_FROM || "GDG Community <onboarding@resend.dev>" 
    });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const apiKey = (body.apiKey || body.pass || "").trim();
        const from = (body.from || body.user || "GDG Community <onboarding@resend.dev>").trim();

        if (!apiKey) {
            return NextResponse.json({ error: "Resend API Key is required (starts with re_)." }, { status: 400 });
        }

        const cfg = { apiKey, from, provider: "resend" };
        const res = NextResponse.json({ success: true, provider: "resend" });

        const cookieOptions = {
            httpOnly: true,
            sameSite: "strict" as const,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 30, // 30 days
        };

        res.cookies.set(RESEND_COOKIE_NAME, JSON.stringify(cfg), cookieOptions);
        res.cookies.set(LEGACY_SMTP_COOKIE_NAME, JSON.stringify(cfg), cookieOptions);

        return res;
    } catch (err: any) {
        return NextResponse.json({ error: err.message ?? "Failed to save Resend config." }, { status: 500 });
    }
}

export async function DELETE() {
    const res = NextResponse.json({ success: true });
    res.cookies.set(RESEND_COOKIE_NAME, "", { maxAge: 0, path: "/" });
    res.cookies.set(LEGACY_SMTP_COOKIE_NAME, "", { maxAge: 0, path: "/" });
    return res;
}

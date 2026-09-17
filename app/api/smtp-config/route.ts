import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "gdg_smtp_cfg";

interface SmtpConfig {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
    secure: boolean;
}

export async function GET(req: NextRequest) {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return NextResponse.json({
            configured: true,
            viaEnv: true,
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587"),
            user: process.env.SMTP_USER,
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            secure: process.env.SMTP_SECURE === "true",
        });
    }

    const raw = req.cookies.get(COOKIE_NAME)?.value;
    if (!raw) {
        return NextResponse.json({ configured: false });
    }
    try {
        const cfg: SmtpConfig = JSON.parse(raw);
        return NextResponse.json({
            configured: !!(cfg.host && cfg.user && cfg.pass),
            host: cfg.host,
            port: cfg.port,
            user: cfg.user,
            from: cfg.from,
            secure: cfg.secure,
        });
    } catch {
        return NextResponse.json({ configured: false });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body: SmtpConfig = await req.json();
        const { host, port, user, pass, from, secure } = body;

        if (!host?.trim()) return NextResponse.json({ error: "SMTP host is required." }, { status: 400 });
        if (!user?.trim()) return NextResponse.json({ error: "SMTP username is required." }, { status: 400 });
        if (!pass?.trim()) return NextResponse.json({ error: "SMTP password is required." }, { status: 400 });

        const cfg: SmtpConfig = {
            host: host.trim(),
            port: port || 587,
            user: user.trim(),
            pass: pass.trim(),
            from: from?.trim() || user.trim(),
            secure: secure ?? false,
        };

        const res = NextResponse.json({ success: true });

        res.cookies.set(COOKIE_NAME, JSON.stringify(cfg), {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
        });

        return res;
    } catch (err: any) {
        return NextResponse.json({ error: err.message ?? "Failed to save config." }, { status: 500 });
    }
}

export async function DELETE() {
    const res = NextResponse.json({ success: true });
    res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
    return res;
}

import { NextRequest, NextResponse } from "next/server";
import { renderEmailWithEmailMd } from "@/lib/resend";

export async function POST(req: NextRequest) {
    try {
        const { markdownBody } = await req.json();
        
        if (!markdownBody) {
            return new NextResponse("<p style='font-family:sans-serif;color:#888;padding:20px;'>Empty markdown preview</p>", { 
                headers: { "Content-Type": "text/html" },
                status: 400 
            });
        }

        const substituted = markdownBody
            .replace(/\{\{name\}\}/g, "Alex Developer")
            .replace(/\{\{time\}\}/g, "Friday, October 24 at 4:30 PM")
            .replace(/\{\{link\}\}/g, "https://meet.google.com/abc-defg-hij");

        const { html } = renderEmailWithEmailMd(substituted);

        return new NextResponse(html, {
            headers: { "Content-Type": "text/html" },
        });
    } catch (err: any) {
        return new NextResponse(
            `<p style='font-family:sans-serif;color:#EA4335;padding:20px;'>Preview render failed: ${err.message}</p>`, 
            { 
                headers: { "Content-Type": "text/html" },
                status: 500 
            }
        );
    }
}

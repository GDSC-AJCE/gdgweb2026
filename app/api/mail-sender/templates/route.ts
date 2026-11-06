import { NextResponse } from "next/server";
import { listTemplates } from "@/lib/mailer";

export async function GET() {
  try {
    const templates = listTemplates();
    return NextResponse.json({ success: true, templates });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

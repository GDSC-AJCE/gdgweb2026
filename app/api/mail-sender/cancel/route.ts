import { NextResponse } from "next/server";
import { cancelBatch } from "@/lib/mailer";

export async function POST() {
  cancelBatch();
  return NextResponse.json({ success: true, message: "Cancellation signal received." });
}

import { NextResponse } from "next/server";
import { cancelBatch } from "../send-batch/route";

export async function POST() {
  cancelBatch();
  return NextResponse.json({ success: true, message: "Cancellation signal received." });
}

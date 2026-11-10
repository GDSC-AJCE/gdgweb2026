// app/api/mail-sender/gemini/route.ts
// API route for Gemini AI Email Generation & Studio Assist

import { NextRequest, NextResponse } from "next/server";
import {
  generateEmailWithGemini,
  generateSubjectLines,
  polishEmailContent,
  testGeminiConnection,
  getGeminiApiKey,
} from "@/lib/gemini";

export async function GET() {
  try {
    const hasEnvKey = Boolean(getGeminiApiKey());
    let connection: { success: boolean; message: string; model?: string } = { success: false, message: "No API key configured", model: "" };

    if (hasEnvKey) {
      connection = await testGeminiConnection();
    }

    const presets = [
      {
        id: "event-announcement",
        title: "🚀 Event Announcement",
        category: "Event Announcement",
        prompt: "Announce our upcoming GDG technical workshop covering modern AI and Cloud tools at AJCE campus.",
        defaultTone: "GDG Community Energetic (Friendly, Tech-forward, Welcoming)",
      },
      {
        id: "flutter-workshop",
        title: "📱 Flutter & Mobile Jam",
        category: "Hands-on Workshop",
        prompt: "Hands-on Flutter build sprint: create your first cross-platform app with Firebase backend in 2 hours.",
        defaultTone: "GDG Community Energetic (Friendly, Tech-forward, Welcoming)",
      },
      {
        id: "gemini-hackathon",
        title: "✨ Gemini Hackathon",
        category: "Hackathon & Contest",
        prompt: "Invite students to register for the 24-hour Gemini Multimodal Hackathon with swag prizes and mentorship.",
        defaultTone: "Urgent & High-Energy",
      },
      {
        id: "shortlist-interview",
        title: "🎉 Execom Selection / Shortlisted",
        category: "Core Team Selection",
        prompt: "Congratulate candidate on being shortlisted for the GDG AJCE Core Team and provide interview slot details.",
        defaultTone: "Warm, Inspiring & Celebratory",
      },
      {
        id: "rejection-appreciation",
        title: "💌 Appreciation & Community Welcome",
        category: "Application Outcome",
        prompt: "Gentle, appreciative update for applicants not shortlisted for core team, celebrating their effort and welcoming them to active community chapters & study jams.",
        defaultTone: "Empathetic, Encouraging & Uplifting",
      },
      {
        id: "speaker-invite",
        title: "🎙️ Speaker / Mentor Invite",
        category: "Speaker Invitation",
        prompt: "Invite an esteemed alumni or Google Developer Expert to deliver a keynote or tech session at GDG AJCE.",
        defaultTone: "Professional & Executive",
      },
      {
        id: "certificate-dispatch",
        title: "📜 Certificate Dispatch",
        category: "Certificate & Recognition",
        prompt: "Dispatch participation certificates to attendees of the recent Cloud Study Jam with badge link.",
        defaultTone: "Warm & Celebratory",
      },
      {
        id: "rsvp-reminder",
        title: "⏰ RSVP / Session Reminder",
        category: "Event Reminder",
        prompt: "Friendly 24-hour reminder for tomorrow's live tech session. Highlight seat confirmation and Google Meet link.",
        defaultTone: "Urgent & Friendly",
      },
    ];

    return NextResponse.json({
      success: true,
      hasEnvKey,
      connection,
      recommendedModel: "gemini-3.8-flash",
      presets,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // 1. Test Key Action
    if (action === "test-key") {
      const { apiKey } = body;
      const testResult = await testGeminiConnection(apiKey);
      return NextResponse.json(testResult);
    }

    // 2. Generate Subject Lines Action
    if (action === "generate-subjects") {
      const { topic, category, apiKey } = body;
      if (!topic || !topic.trim()) {
        return NextResponse.json(
          { success: false, error: "Topic or email summary is required to generate subjects." },
          { status: 400 }
        );
      }
      const result = await generateSubjectLines(topic, category, apiKey);
      return NextResponse.json({ success: true, ...result });
    }

    // 3. Polish Content Action
    if (action === "polish") {
      const { content, goal, customInstruction, apiKey } = body;
      if (!content || !content.trim()) {
        return NextResponse.json(
          { success: false, error: "Content is required to polish." },
          { status: 400 }
        );
      }
      const result = await polishEmailContent(content, goal || "more_exciting", customInstruction, apiKey);
      return NextResponse.json({ success: true, ...result });
    }

    // 4. Default: Generate Full Email Action
    const {
      prompt,
      category,
      tone,
      details,
      themeColor,
      apiKey,
    } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { success: false, error: "Please provide a prompt or description of the email you want to generate." },
        { status: 400 }
      );
    }

    const emailResult = await generateEmailWithGemini({
      prompt,
      category,
      tone,
      details,
      themeColor,
      apiKey,
    });

    return NextResponse.json({
      success: true,
      data: emailResult,
    });
  } catch (err: any) {
    console.error("Gemini Mail Generator Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "An unexpected error occurred during email generation.",
      },
      { status: 500 }
    );
  }
}

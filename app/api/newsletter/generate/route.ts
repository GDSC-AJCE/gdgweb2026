import { NextRequest, NextResponse } from "next/server";
import { collection, getDocs, addDoc, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { NewsletterIssue } from "@/lib/newsletter";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { customFocus = "" } = body;

    // Determine next issue number
    const newslettersRef = collection(db, "newsletters");
    const q = query(newslettersRef, orderBy("issueNumber", "desc"), limit(1));
    const snap = await getDocs(q);

    let nextIssueNumber = 3; // Default since #1 and #2 are predefined
    if (!snap.empty) {
      const topIssue = snap.docs[0].data();
      if (typeof topIssue.issueNumber === "number") {
        nextIssueNumber = topIssue.issueNumber + 1;
      }
    }

    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const slug = `issue-${nextIssueNumber}-tech-pulse-${today.toISOString().slice(0, 10)}`;

    const generatedTitle = `GDG Tech Pulse #${nextIssueNumber}: Autonomous AI Agents, Cloud Run Scalability & Modern Web Workflows`;
    const summary = `Weekly developer radar covering multimodal agent architectures, zero-downtime serverless microservices on Google Cloud, and progressive web performance.`;

    const markdownContent = `
# GDG Tech Pulse #${nextIssueNumber}: Next-Gen Systems & Intelligent Agents

Welcome to this week's edition of **GDG Tech Pulse**! As intelligent agents become the backbone of modern developer workflows, this week's briefing explores how software engineers are building robust, production-grade applications.

---

## ⚡ Executive TL;DR
- **Autonomous Agent Workflows**: Transitioning from single-prompt LLM completions to multi-step reasoning loops with tools and memory.
- **Google Cloud Run Multi-Container Pods**: Deploy sidecar observability, logging proxies, and Redis caches seamlessly within single Cloud Run revisions.
- **Chrome 130+ Web Features**: Scroll-driven CSS animations without JavaScript overhead and WebGPU compute pipelines.
- **Campus Radar**: Ongoing DevFest sprint submissions and weekend hands-on Codelab.

---

## 🤖 1. AI & Machine Learning: The Multi-Agent Leap
Autonomous agent architectures (like Gemini Function Calling and ReAct loops) are changing how backend systems interact with databases and external APIs.

### Key Architectural Pattern:
Instead of hoping the model gives the right answer in one go:
1. **Model Reason Step**: Analyzes prompt and determines required tools.
2. **Deterministic Execution**: Server executes the specified tool (e.g. database query, API lookup).
3. **Synthesis**: Model formats verified results back to the user.

\`\`\`json
{
  "name": "query_student_records",
  "description": "Searches Firestore for registered participants in a specific workshop",
  "parameters": {
    "type": "OBJECT",
    "properties": {
      "workshopId": { "type": "STRING" },
      "verifiedOnly": { "type": "BOOLEAN" }
    }
  }
}
\`\`\`

---

## ☁️ 2. Cloud & Systems: Sidecars on Cloud Run
Google Cloud Run now fully supports multi-container instances:
- Run a reverse proxy (Nginx or Envoy) right beside your Next.js application container.
- Embed local telemetry sidecars (OpenTelemetry collectors) with zero network hops.
- Retain instantaneous auto-scaling down to zero instances during quiet nighttime hours.

---

## 📱 3. Mobile & Web: Flutter 3.24 & Impeller Engine
The Impeller rendering engine is now default across iOS and Android on Flutter, virtually eliminating shader compilation jank and bringing silky 120fps motion to cross-platform mobile apps.

---

## ⚡ 4. Open Source Gem: FastEmbed
A blazing-fast, lightweight Python/Rust library for generating vector embeddings locally on your machine without heavy PyTorch dependencies. Ideal for RAG prototypes in student projects!

---

## 🚀 5. Campus Spotlight: AJCE Codelab
Join us this Saturday in the Computer Science Lab for our **"Building Serverless RAG Applications with Firebase & Gemini"** hands-on session. Mentors will be present to help you debug and deploy your first live project!

*Until next week, keep experimenting and shipping!*  
**— The GDG AJCE Tech Team**
    `.trim();

    const newIssue: Omit<NewsletterIssue, "id"> = {
      issueNumber: nextIssueNumber,
      title: generatedTitle,
      slug,
      summary,
      publishedAt: today.toISOString(),
      status: "draft",
      readTime: "4 min read",
      tags: ["AI Agents", "Cloud Run", "Flutter", "DevFest"],
      markdownContent,
      author: {
        name: "GDG AJCE Editorial Team",
        role: "Lead Tech Curators",
      },
    };

    const docRef = await addDoc(newslettersRef, newIssue);

    return NextResponse.json({
      success: true,
      issue: { id: docRef.id, ...newIssue },
      message: `Weekly Newsletter Issue #${nextIssueNumber} generated successfully as a draft!`,
    });
  } catch (err: any) {
    console.error("[newsletter-generate]", err);
    return NextResponse.json({ error: err.message || "Failed to generate weekly newsletter draft" }, { status: 500 });
  }
}

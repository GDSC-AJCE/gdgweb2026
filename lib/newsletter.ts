import { marked } from "marked";

export type NewsletterTopic = "ai_ml" | "cloud" | "web_android" | "open_source" | "campus";

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  status: "active" | "unsubscribed";
  subscribedAt: string;
  unsubscribedAt?: string;
  topics: string[];
  source: string;
  unsubscribeToken: string;
}

export interface NewsletterIssue {
  id: string;
  issueNumber: number;
  title: string;
  slug: string;
  summary: string;
  publishedAt: string;
  status: "draft" | "scheduled" | "sent";
  sentAt?: string;
  recipientCount?: number;
  readTime: string;
  tags: string[];
  markdownContent: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
}

export const NEWSLETTER_TOPICS: { id: NewsletterTopic; label: string; icon: string; color: string }[] = [
  { id: "ai_ml", label: "AI & Machine Learning", icon: "🤖", color: "#4285F4" },
  { id: "cloud", label: "Cloud & DevOps", icon: "☁️", color: "#34A853" },
  { id: "web_android", label: "Web & Mobile (Android/Flutter)", icon: "📱", color: "#EA4335" },
  { id: "open_source", label: "Open Source & Tooling", icon: "⚡", color: "#FBBC04" },
  { id: "campus", label: "Campus & Codelabs", icon: "🚀", color: "#8ed462" },
];

export const DEFAULT_NEWSLETTERS: NewsletterIssue[] = [
  {
    id: "pulse-issue-1",
    issueNumber: 1,
    title: "GDG Tech Pulse #1: The Dawn of Gemini 2.0, Cloud Run GPU Scaling & Jetpack Compose 1.7",
    slug: "issue-1-gemini-cloud-run-compose",
    summary: "A deep dive into Gemini's multi-million token context windows, running serverless LLMs with Cloud Run GPUs, and the performance leap in Jetpack Compose 1.7.",
    publishedAt: "2026-09-15T09:00:00.000Z",
    status: "sent",
    sentAt: "2026-09-15T09:15:00.000Z",
    recipientCount: 142,
    readTime: "4 min read",
    tags: ["AI/ML", "Cloud", "Android", "Google Tech"],
    author: {
      name: "GDG AJCE Editorial Team",
      role: "Lead Tech Curators",
    },
    markdownContent: `
# Welcome to GDG Tech Pulse #1!

Welcome to the inaugural issue of **GDG Tech Pulse** — your curated weekly dispatch on developer tools, cloud infrastructure, AI advancements, and student-driven open-source innovation from **GDG on Campus AJCE**.

---

## ⚡ Executive TL;DR
- **Gemini 1.5 & Beyond**: Developers now harness native multimodal reasoning across hours of audio, thousands of pages, and video streams in Google AI Studio.
- **Cloud Run with GPUs**: Serverless deployment of open weights (Gemma 2, Llama, Whisper) without managing persistent Kubernetes nodes.
- **Android & Compose 1.7**: Massive memory allocation reductions and smoother 120Hz scroll physics.
- **Campus Radar**: DevFest Sprint registrations are officially live!

---

## 🤖 1. AI & Machine Learning Radar
### **Multimodal Context Frontiers & Function Calling**
Developers building on Google's Gemini models have begun adopting the expanded system instruction sets and structured JSON schema enforcement. 

\`\`\`typescript
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
  }
});
\`\`\`

With native structured output, building reliable AI agents that plug into student projects and backend services no longer requires fragile regex parsing.

---

## ☁️ 2. Cloud & Infrastructure
### **Serverless AI Deployments on Cloud Run**
Google Cloud Run now supports on-demand NVIDIA L4 and T4 GPU attachments. This bridges the gap between raw compute costs and serverless convenience:
- Scale to zero when your ML inference API is inactive.
- Fast boot times for containerized models using Ollama and vLLM.
- Direct VPC integration with Cloud Firestore and Firebase Auth.

---

## 📱 3. Web & Mobile Ecosystem
### **Jetpack Compose 1.7 Performance Leap**
Android developers at AJCE rejoice: Compose 1.7 introduces rewritten layout modifiers that drastically lower garbage collection pauses. Key highlights include:
1. **LazyLayout Prefetching**: Eliminates dropped frames during fast scrolling.
2. **BasicTextField2**: Now production-ready as \`TextField\` with superior text transformation pipelines.

---

## ⚡ 4. Open-Source Gem of the Week
### **Firebase Genkit**
An open-source, developer-friendly framework for building AI-powered apps with TypeScript or Go. Features local developer UI, automated telemetry, and native integrations with vector stores.

---

## 🚀 5. Campus Spotlight: DevFest Sprint
The annual GDG AJCE DevFest Hack Sprint is around the corner. Teams will have 48 hours to prototype solutions addressing UN Sustainable Development Goals using Google Cloud, Gemini API, and Flutter.

*Stay curious and keep shipping!*  
**— The GDG AJCE Team**
    `.trim(),
  },
  {
    id: "pulse-issue-2",
    issueNumber: 2,
    title: "GDG Tech Pulse #2: Gemma 2 On-Device AI, Firebase Genkit & WebAssembly Modern Horizons",
    slug: "issue-2-gemma-genkit-webassembly",
    summary: "Exploring Google's Gemma 2 2B/9B/27B lightweight open models, building verifiable GenAI workflows with Genkit, and WasmGC client performance.",
    publishedAt: "2026-09-16T10:00:00.000Z",
    status: "sent",
    sentAt: "2026-09-16T10:10:00.000Z",
    recipientCount: 168,
    readTime: "5 min read",
    tags: ["Gemini", "Gemma", "Firebase", "WebAssembly"],
    author: {
      name: "GDG AJCE Editorial Team",
      role: "Lead Tech Curators",
    },
    markdownContent: `
# GDG Tech Pulse #2: The On-Device Intelligence Shift

Welcome back! This week, the developer zeitgeist is centered on running intelligence locally, lightweight models, and high-performance web runtimes.

---

## ⚡ Executive TL;DR
- **Gemma 2 Architecture**: 2B and 9B parameter models outperforming older 30B models in reasoning and coding benchmarks.
- **MediaPipe LLM Inference**: Run Gemma 2 directly in Chrome or on Android phones with zero server latency.
- **WasmGC Acceleration**: WebAssembly Garbage Collection enables Kotlin Multiplatform and Dart/Flutter to run natively on the web at near-C++ speeds.

---

## 🤖 1. AI & Machine Learning: Gemma 2 Everywhere
Google's open-weights family **Gemma 2** brings distilled architecture innovations (sliding window attention, logit soft-capping) to everyday developer hardware. 
Using **MediaPipe**, you can run LLMs client-side in the browser:

\`\`\`javascript
import { FilesetResolver, LlmInference } from "@google/mediapipe-genai";

const genai = await FilesetResolver.forGenAiTasks(
  "https://cdn.jsdelivr.net/npm/@google/mediapipe-genai/wasm"
);
const llm = await LlmInference.createFromModelPath(genai, "/models/gemma-2b-it-gpu.bin");
const response = await llm.generateResponse("Explain recursion in 1 line:");
console.log(response);
\`\`\`

---

## ☁️ 2. Cloud & Firebase: Genkit Pipelines
Building production LLM flows requires observability and automated testing. Firebase Genkit provides a local graphical inspector where you can trace each step, inspect prompt embeddings, and benchmark model responses before deploying to Cloud Functions.

---

## 🌐 3. Web Frontier: WebAssembly Garbage Collection (WasmGC)
With Chrome, Firefox, and Safari supporting WasmGC, web applications are entering a new era. Flutter Web compilation to Wasm delivers 60fps rendering without jank, bridging mobile-quality UI into the browser.

---

## 🛠️ Code Tip of the Week: Optimistic Updates in Firestore
When creating interactive voting or like features, avoid waiting for server roundtrips. Leverage Firestore's offline cache with instantaneous optimistic state updates!

---

## 🚀 4. AJCE Community Happenings
Join us this Wednesday in the GDG Innovation Lab for our hands-on **"Build with Gemma & Android"** Codelab session. Bring your laptop and your curiosity!

*Catch you next Monday morning,*  
**— GDG AJCE Tech Team**
    `.trim(),
  },
  {
    id: "pulse-issue-3",
    issueNumber: 3,
    title: "GDG Tech Pulse #3: Autonomous Coding Agents, Firebase Data Connect & Flutter GPU Runtimes",
    slug: "issue-3-coding-agents-data-connect-flutter-gpu",
    summary: "Breaking down multi-agent developer workflows, Firebase's new relational PostgreSQL engine, and hardware-accelerated shaders in Flutter Impeller.",
    publishedAt: "2026-09-17T09:00:00.000Z",
    status: "sent",
    sentAt: "2026-09-17T09:10:00.000Z",
    recipientCount: 184,
    readTime: "4 min read",
    tags: ["Agentic AI", "Firebase", "PostgreSQL", "Flutter", "GCP"],
    author: {
      name: "GDG AJCE Editorial Team",
      role: "Lead Tech Curators",
    },
    markdownContent: `
# GDG Tech Pulse #3: Autonomous Coding & The Relational Cloud

Welcome to the 3rd edition of **GDG Tech Pulse**! This week we explore the shift towards agentic engineering loops, relational backends on Firebase, and next-gen rendering.

---

## ⚡ Executive TL;DR
- **Firebase Data Connect**: Native PostgreSQL support is now in public preview, bringing SQL schemas and type-safe GraphQL queries directly to Firebase.
- **Agentic Dev Systems**: Transitioning from passive autocomplete copilots to autonomous task executors with tool calling and self-healing terminal sessions.
- **Flutter Impeller GPU Engine**: Say goodbye to shader compilation jank on both iOS and Android.

---

## 🤖 1. AI & Autonomous Agents
### **Multi-Tool Calling & Structured Feedback Loops**
Modern developer agents do more than suggest syntax—they execute shell commands, read logs, and verify build artifacts iteratively:

\`\`\`typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const agent = ai.getGenerativeModel({
  model: "gemini-1.5-pro",
  tools: [{ functionDeclarations: [compileSchemaTool, runTestsTool] }]
});
\`\`\`

By grounding models with native execution feedback, developer toolchains eliminate hallucinations and drastically accelerate prototyping.

---

## ☁️ 2. Cloud & Database
### **Firebase Data Connect (PostgreSQL)**
Firebase developers have long loved Firestore for documents, but relational schemas (joins, foreign keys, ACID constraints) are now first-class citizens:
- Cloud SQL for PostgreSQL integration with zero boilerplate connection pooling.
- Instant TypeScript and Flutter SDK generation directly from your \`.gql\` queries.
- Row-level security rules powered by Firebase Authentication claims.

---

## 📱 3. Mobile & Cross-Platform
### **Flutter 3.24 & Impeller Shader Precision**
Impeller replaces Skia with a runtime designed specifically for modern 3D graphics APIs (Metal on iOS, Vulkan on Android). Frame rendering budgets reliably hit 120fps even during complex physics transitions.

---

## 🚀 4. Campus Spotlight: AJCE DevSprint Hackathon
Registration is filling up rapidly for our semester hackathon! Make sure your team has locked in their project track before Friday midnight.

*Keep exploring and building great software!*  
**— GDG AJCE Editorial Team**
    `.trim(),
  },
];

/**
 * Generate a production-ready, cross-client HTML email for the weekly newsletter
 */
export function renderNewsletterEmailHtml(
  issue: NewsletterIssue,
  recipientName?: string,
  unsubscribeUrl?: string
): { html: string; text: string } {
  const contentHtml = marked.parse(issue.markdownContent, { gfm: true, breaks: true }) as string;
  const greeting = recipientName && recipientName.trim() ? `Hello ${recipientName.trim()},` : "Hello Developer,";
  const defaultUnsub = unsubscribeUrl || "https://gdgajce.com/newsletter/unsubscribe";

  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${issue.title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f5f1e4;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #2c2e2a;
      line-height: 1.65;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f5f1e4;
      padding: 36px 12px;
    }
    .main-card {
      max-width: 640px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #d5d5d4;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(44, 46, 42, 0.04);
    }
    .color-bar {
      height: 6px;
      width: 100%;
      background: linear-gradient(90deg, #4285F4 25%, #EA4335 25% 50%, #FBBC04 50% 75%, #34A853 75%);
    }
    .header {
      padding: 32px 36px 20px 36px;
      border-bottom: 1px solid #f1efe8;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 50px;
      background-color: #f5f1e4;
      color: #2c2e2a;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }
    .issue-num {
      color: #4285F4;
      font-weight: 800;
    }
    .title {
      font-size: 26px;
      font-weight: 800;
      color: #2c2e2a;
      line-height: 1.25;
      margin: 0 0 10px 0;
      letter-spacing: -0.02em;
    }
    .meta {
      font-size: 13px;
      color: #80827f;
      display: flex;
      gap: 12px;
    }
    .content-body {
      padding: 32px 36px;
      font-size: 15px;
      color: #2c2e2a;
    }
    .content-body h1 {
      font-size: 22px;
      font-weight: 700;
      color: #2c2e2a;
      margin-top: 24px;
      margin-bottom: 12px;
      border-bottom: 1px solid #f1efe8;
      padding-bottom: 8px;
    }
    .content-body h2 {
      font-size: 18px;
      font-weight: 700;
      color: #2c2e2a;
      margin-top: 28px;
      margin-bottom: 10px;
    }
    .content-body h3 {
      font-size: 16px;
      font-weight: 600;
      color: #2c2e2a;
      margin-top: 20px;
      margin-bottom: 8px;
    }
    .content-body p {
      margin: 14px 0;
      line-height: 1.65;
    }
    .content-body a {
      color: #4285F4;
      text-decoration: underline;
    }
    .content-body pre {
      background: #f7f6f2;
      border: 1px solid #e5e1d5;
      border-radius: 12px;
      padding: 14px;
      overflow-x: auto;
      font-size: 13px;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
      color: #2c2e2a;
    }
    .content-body code {
      background: #f7f6f2;
      padding: 2px 6px;
      border-radius: 6px;
      font-size: 13px;
      font-family: monospace;
      color: #ea4335;
    }
    .content-body blockquote {
      border-left: 4px solid #4285F4;
      background-color: #f7f9fe;
      margin: 18px 0;
      padding: 12px 18px;
      border-radius: 0 12px 12px 0;
      color: #3c4043;
      font-style: italic;
    }
    .content-body hr {
      border: none;
      border-top: 1px solid #eae7dd;
      margin: 28px 0;
    }
    .footer {
      background-color: #fbfaf7;
      border-top: 1px solid #eae7dd;
      padding: 28px 36px;
      text-align: center;
      font-size: 12px;
      color: #80827f;
    }
    .social-links {
      margin: 14px 0;
    }
    .social-links a {
      color: #2c2e2a;
      text-decoration: none;
      margin: 0 8px;
      font-weight: 600;
    }
    .unsub-link {
      color: #80827f;
      text-decoration: underline;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main-card">
      <div class="color-bar"></div>
      <div class="header">
        <div class="badge">
          <span class="issue-num">Issue #${issue.issueNumber}</span> • GDG Tech Pulse
        </div>
        <h1 class="title">${issue.title}</h1>
        <div class="meta">
          <span>📅 ${new Date(issue.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          <span>⏱️ ${issue.readTime}</span>
          <span>🏛️ GDG AJCE</span>
        </div>
      </div>

      <div class="content-body">
        <p style="font-size: 16px; font-weight: 500; color: #2c2e2a;">${greeting}</p>
        ${contentHtml}
      </div>

      <div class="footer">
        <p style="margin: 0 0 6px 0; font-weight: 600; color: #2c2e2a;">Google Developer Groups (GDG) on Campus AJCE</p>
        <p style="margin: 0 0 12px 0;">Amal Jyothi College of Engineering • Kanjirappally, Kerala, India</p>
        
        <div class="social-links">
          <a href="https://gdgajce.com/newsletter">Web Archive</a> •
          <a href="https://gdgajce.com/programs">Programs</a> •
          <a href="https://github.com/gdgajce">GitHub</a> •
          <a href="https://instagram.com/gdgajce">Instagram</a>
        </div>

        <p style="margin: 16px 0 4px 0; color: #9aa0a6;">
          You received this email because you subscribed to weekly tech updates from GDG AJCE.
        </p>
        <a href="${defaultUnsub}" class="unsub-link">Unsubscribe or manage newsletter preferences</a>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const text = `${issue.title}\n\nIssue #${issue.issueNumber} | GDG Tech Pulse\n\n${greeting}\n\n` +
    issue.markdownContent.replace(/[#*`>_~\[\]]/g, "") +
    `\n\n---\nGDG on Campus AJCE\nUnsubscribe: ${defaultUnsub}`;

  return { html: emailHtml, text };
}

/**
 * Generate an onboarding welcome email when someone subscribes
 */
export function renderWelcomeEmailHtml(
  recipientName?: string,
  unsubscribeUrl?: string
): { html: string; text: string } {
  const nameDisplay = recipientName && recipientName.trim() ? recipientName.trim() : "Developer";
  const defaultUnsub = unsubscribeUrl || "https://gdgajce.com/newsletter/unsubscribe";

  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to GDG Tech Pulse!</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f5f1e4;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #2c2e2a;
      line-height: 1.6;
    }
    .wrapper {
      width: 100%;
      background-color: #f5f1e4;
      padding: 36px 12px;
    }
    .main-card {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #d5d5d4;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(44, 46, 42, 0.04);
    }
    .color-bar {
      height: 6px;
      width: 100%;
      background: linear-gradient(90deg, #4285F4 25%, #EA4335 25% 50%, #FBBC04 50% 75%, #34A853 75%);
    }
    .content {
      padding: 36px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 50px;
      background: #eef9e8;
      color: #2e7d32;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 14px;
    }
    h1 {
      font-size: 26px;
      font-weight: 800;
      color: #2c2e2a;
      margin: 0 0 16px 0;
      line-height: 1.25;
    }
    p {
      font-size: 15px;
      color: #4a4d47;
      margin: 14px 0;
    }
    .feature-box {
      background-color: #f7f6f2;
      border: 1px solid #e5e1d5;
      border-radius: 16px;
      padding: 20px;
      margin: 24px 0;
    }
    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 12px;
      font-size: 14px;
      color: #2c2e2a;
    }
    .feature-item:last-child {
      margin-bottom: 0;
    }
    .btn {
      display: inline-block;
      background-color: #2c2e2a;
      color: #ffffff;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      padding: 12px 28px;
      border-radius: 50px;
      margin-top: 16px;
    }
    .footer {
      background-color: #fbfaf7;
      border-top: 1px solid #eae7dd;
      padding: 24px 36px;
      text-align: center;
      font-size: 12px;
      color: #80827f;
    }
    .unsub-link {
      color: #80827f;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main-card">
      <div class="color-bar"></div>
      <div class="content">
        <div class="badge">Subscription Confirmed ✓</div>
        <h1>You're on the list, ${nameDisplay}! 🚀</h1>
        <p>
          Welcome to <strong>GDG Tech Pulse</strong>, the weekly developer briefing curated by <strong>Google Developer Groups on Campus AJCE</strong>.
        </p>
        <p>
          Every Monday morning at 9:00 AM, you'll receive a sharp 4-minute scan of what's happening across the developer universe:
        </p>

        <div class="feature-box">
          <div class="feature-item">
            <span>🤖</span>
            <div><strong>AI & Machine Learning:</strong> Gemini API, Vertex AI, Gemma on-device, and multimodal intelligence.</div>
          </div>
          <div class="feature-item">
            <span>☁️</span>
            <div><strong>Cloud & DevOps:</strong> Serverless architectures, Cloud Run, Firebase Genkit, and deployment guides.</div>
          </div>
          <div class="feature-item">
            <span>📱</span>
            <div><strong>Web & Mobile:</strong> Jetpack Compose, Flutter 3.x, Chrome Web standards, and Next.js modern patterns.</div>
          </div>
          <div class="feature-item">
            <span>🚀</span>
            <div><strong>Campus Sprints:</strong> Hackathon alerts, hands-on codelabs, and student open-source spotlights.</div>
          </div>
        </div>

        <p>
          Can't wait until next Monday? You can read our latest editions directly on our web archive:
        </p>

        <div style="text-align: center; margin: 24px 0;">
          <a href="https://gdgajce.com/newsletter" class="btn" style="color: #ffffff;">Browse Past Editions →</a>
        </div>

        <p style="font-size: 13px; color: #80827f; margin-top: 24px;">
          Have questions or want to submit an open-source project to be featured? Reply directly to this email!
        </p>
      </div>

      <div class="footer">
        <p style="margin: 0 0 6px 0; font-weight: 600; color: #2c2e2a;">GDG on Campus AJCE</p>
        <p style="margin: 0 0 10px 0;">Amal Jyothi College of Engineering • Kanjirappally, Kerala, India</p>
        <a href="${defaultUnsub}" class="unsub-link">Unsubscribe or manage preferences</a>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  const text = `Welcome to GDG Tech Pulse, ${nameDisplay}!\n\n` +
    `You are now subscribed to receive our curated weekly tech newsletter every Monday.\n\n` +
    `Read past issues online at: https://gdgajce.com/newsletter\n\n` +
    `---\nGDG on Campus AJCE\nUnsubscribe: ${defaultUnsub}`;

  return { html: emailHtml, text };
}

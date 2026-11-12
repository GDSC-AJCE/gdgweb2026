# 🤖 GDG on Campus AJCE — Universal Agent Rules & Constraints

> **Authority:** Single Source of Truth for all Autonomous Agents, Reviewers, and Coding Assistants  
> **Applies to:** Antigravity, CodeRabbit, Cursor, Claude Code, OpenAI Codex, GitHub Copilot  
> **References:** [HEAD.md](file:///d:/DEV/GDG/newwebsite/HEAD.md) (Master System Brief), [design.md](file:///d:/DEV/GDG/newwebsite/design.md) (Design Tokens & Brand System)

---

## 📌 1. Identity & Core Mission

- **Organization:** Google Developer Groups (GDG) on Campus — Amal Jyothi College of Engineering (AJCE).
- **Core Mission:** Empower students with Google technologies (AI/ML, Gemini, Cloud, Android, Web, and Open Source).
- **System Architecture:** Next.js 16 (App Router), React 19, TypeScript strict mode, Tailwind CSS v4, Google Firebase suite, and Google Gen AI (`@google/genai`).

---

## 🔒 2. Strict Architectural Invariant: 100% Google Ecosystem

> [!IMPORTANT]
> **ABSOLUTE PROHIBITION OF NON-GOOGLE BACKENDS, THIRD-PARTY DATABASES & AUTH**  
> All persistent storage, compute, authentication, and AI services must leverage Google Cloud and Firebase.

1. **Authentication:**
   - Exclusively **Google Identity / Firebase Authentication** (`lib/firebase.ts`).
   - Primary flow: Google Single Sign-On (OAuth) with domain verification (`@amaljyothi.ac.in`).
   - Secondary flow: Firebase Email/Password fallback.
   - **Forbidden:** Clerk, Auth0, Supabase Auth, AWS Cognito, NextAuth/Auth.js with non-Google providers.

2. **Database:**
   - Exclusively **Google Cloud Firestore**.
   - Collections: `events`, `registrations`, `users`, `tickets`, `certificates`, `teams`, `execom`, `audit_logs`, `leaderboard`.
   - All client queries must use Firebase Web SDK v12 (`lib/firebase.ts`).
   - Server-side routes must use Firebase Admin SDK.
   - **Forbidden:** PostgreSQL, MySQL, Supabase, MongoDB, DynamoDB, Prisma, TypeORM.

3. **Storage & Assets:**
   - Exclusively **Firebase Cloud Storage**.
   - Buckets store event banners, proof of work, member avatars, and gallery photos.

4. **Artificial Intelligence & LLMs:**
   - Exclusively **Google Gemini API** via the official SDK `@google/genai` (`lib/gemini.ts`).
   - **Forbidden:** Direct OpenAI, Anthropic, Mistral, or external proprietary LLM endpoints.

---

## 🎨 3. Design System Constraints & Brand Tokens (`design.md`)

All generated components, pages, and UI modifications must adhere strictly to the **GDG AJCE Warm Paper** design system:

| Token | Value / Spec | Role & Usage |
| :--- | :--- | :--- |
| **Foundation Canvas** | `#f5f1e4` (`Warm Cream Paper`) | Default body & page canvas across all public routes. **No dark mode. No stark digital white canvas.** |
| **Elevated Surfaces** | `#ffffff` (`Pure White`) | Bento cards, modal dialogs, and feature panels. |
| **Hairline Borders** | `#d5d5d4` / `#e5e1d5` | 1px clean separation borders on cards and sections. |
| **Fresh Grass Green** | `#8ed462` | Chapter primary brand accent and positive status highlights. |
| **Coral Pop** | `#ff705d` | Primary CTA buttons, attention dots, and urgent alerts. |
| **Sky Pop** | `#2ba0ff` | Secondary action highlights, tech chips, and badge dots. |
| **Sunshine Yellow** | `#ffd600` / `#f5e211` / `#fbbc04` | Event highlights, trophies, and celebration badges. |
| **Typography** | `Inter` (Single font family) | Micro-labels (9px) to hero display (215px) with compressed tracking (`-0.065em`). |
| **Radii: Pills / Buttons**| `50px` (`rounded-full`) | Floating navigation pill, primary action buttons, status chips. |
| **Radii: Bento Cards** | `36px` to `50px` | Feature cards, hero cards, leaderboard containers. |
| **Radii: Nested Items** | `28px` | Inner rows, contributor badges, ticket cards. |

---

## 🕸️ 4. Graphify Knowledge Graph Constraints

This repository maintains an active knowledge graph in `graphify-out/` (~1,429 nodes, ~2,031 edges).

- **Mandatory Pre-Investigation:** Before answering codebase architecture questions, refactoring modules, or modifying core routes, run:
  ```powershell
  # Query concept traversal
  & (Get-Content graphify-out\.graphify_python) -m graphify query "<question>"

  # Trace shortest path between modules
  & (Get-Content graphify-out\.graphify_python) -m graphify path "<ModuleA>" "<ModuleB>"

  # Explain specific nodes and their neighbors
  & (Get-Content graphify-out\.graphify_python) -m graphify explain "<NodeName>"
  ```
- **Post-Modification Synchronization:** After modifying or creating source files, agents must keep the knowledge graph current:
  ```powershell
  & (Get-Content graphify-out\.graphify_python) -m graphify update .
  ```
- **Architectural God Nodes:** Exercise extreme caution when modifying high-centrality files identified in `graphify-out/GRAPH_REPORT.md` (e.g., `lib/firebase.ts`, `components/programs/CreativeEventPoster.tsx`, `components/home/OngoingEventsSection.tsx`).

---

## 🐰 5. CodeRabbit ("Pod Rabbit") Agentic Review Workflow

The repository integrates **CodeRabbit** for automated PR reviews, security scanning, and agentic workflows:

- **Configuration:** Governed by [.coderabbit.yaml](file:///d:/DEV/GDG/newwebsite/.coderabbit.yaml).
- **Review Profile:** `assertive` — strictly flags architectural deviations, non-Google imports, styling mismatches, and security omissions.
- **Security Scanners:** `skillspetector` is enabled to audit agent-created tools, hooks, and external actions for supply-chain vulnerabilities.
- **Automated CI Workflow:** [.github/workflows/coderabbit.yml](file:///d:/DEV/GDG/newwebsite/.github/workflows/coderabbit.yml) runs pre-merge checks verifying the 100% Google Stack invariant and credential safety.
- **Local Review Invocation:** Agents and developers can run CodeRabbit locally via:
  ```powershell
  npx coderabbit review
  ```

---

## 🛡️ 6. Runtime & Agent Guardrails (`lib/guardrails.ts`)

All AI operations and data ingress must pass through the project's guardrails engine:

1. **Prompt Injection & Jailbreak Defense:**
   - All user-supplied prompts passed to Gemini must be validated via `validatePromptGuardrails(prompt)`.
   - Prompt length capped at 32,000 characters to prevent token denial-of-service.

2. **Credential & Secret Protection:**
   - Secret scanner actively masks Firebase tokens, Google API keys (`AIza*`), and authorization headers before logging or external transit (`maskSensitiveData()`).

3. **Gemini Safety Settings:**
   - Generative workflows must use `getStandardGeminiSafetySettings()` blocking harassment, hate speech, sexually explicit, and dangerous content.

4. **Campus Domain Guardrail:**
   - Exclusive access for student registrations validated via `validateCampusDomainGuardrail(email)` for Amal Jyothi accounts.

5. **Firestore Security Integrity:**
   - `firestore.rules` must never be altered to permit blanket unauthenticated writes (`allow write: if true;` is strictly blocked).

---

## 🚦 7. Platform Route Preservation

The following public and internal routes are critical and must never suffer breaking changes:

- `/` — Landing page with hero, ongoing programs, physics footer, and seasonal leaderboard preview.
- `/programs` — Master event directory.
- `/programs/ongoing` — Live hackathons and active workshops with countdowns.
- `/programs/past` — Concluded event archives, recap decks, and certificate claims.
- `/programs/[slug]` — Interactive registration workflow with dynamic custom fields.
- `/verify/[id]` — Public QR verification validator for tickets and badges.
- `/leaderboard` — Seasonal and monthly competition standings.
- `/profile` — Member dashboard, issued tickets, and verified certificates.
- `/core` & `/execom` — Role-protected administrative management dashboards.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

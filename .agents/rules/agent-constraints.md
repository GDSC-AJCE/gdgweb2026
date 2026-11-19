# GDG AJCE Agent Rules & Architectural Constraints

See [agents.agents.env](file:///d:/DEV/GDG/newwebsite/agents.agents.env) and [AGENTS.md](file:///d:/DEV/GDG/newwebsite/AGENTS.md) for master directives and environment configuration.

## Key Constraints & Execution Rules:
1. **Main Agent Orchestration Role:** The main agent runs as the Orchestrator, states **"orchestrate"**, and decomposes tasks.
2. **Subagent Task Delegation:** When any new task is assigned, a dedicated new subagent MUST be created to execute it.
3. **Component Library Exclusivity:**
   - **Admin Panel:** Must use the provided component library (`@/components/ui`) for ALL elements (inputs, text areas, tables, buttons, dialogs, etc.) instead of creating things from scratch.
   - **Other Sections (Hero, Landing, etc.):** Buttons, pop-up boxes/dialogs, tables, and text boxes MUST be used from `@/components/ui` only.
   - **Missing Components Permission:** If a component is NOT in the library, the agent MUST first ask the user for permission before creating any new component.
4. **Google Ecosystem Exclusivity:** All database, auth, and AI features MUST use Firebase (Firestore, Auth, Storage) and Google Gen AI (`@google/genai`). Never import third-party DB/Auth providers.
5. **Warm Cream Paper Design System:** Foundation is `#f5f1e4` (no dark mode, no stark white canvas), elevated white cards (`#ffffff`) with 36px–50px rounded corners, brand accents (`#8ed462`, `#ff705d`, `#2ba0ff`, `#ffd600`).
6. **Graphify Lifecycle:** Graphify is installed (`graphify install --platform antigravity`). Query before making architectural alterations; run `graphify update .` post-change.
7. **CodeRabbit Agentic Workflow:** Automated PR review profile set to assertive via `.coderabbit.yaml`.
8. **Safety Guardrails:** Enforce input sanitization, prompt injection checks, and PII masking via `lib/guardrails.ts`.

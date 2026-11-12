# GDG AJCE Agent Rules & Architectural Constraints

See [AGENTS.md](file:///d:/DEV/GDG/newwebsite/AGENTS.md) for master directives.

## Key Constraints:
1. **Google Ecosystem Exclusivity:** All database, auth, and AI features MUST use Firebase (Firestore, Auth, Storage) and Google Gen AI (`@google/genai`). Never import third-party DB/Auth providers.
2. **Warm Cream Paper Design System:** Foundation is `#f5f1e4` (no dark mode, no stark white canvas), elevated white cards (`#ffffff`) with 36px–50px rounded corners, brand accents (`#8ed462`, `#ff705d`, `#2ba0ff`, `#ffd600`).
3. **Graphify Navigation:** Query `graphify-out/graph.json` before making architectural alterations; run `graphify update .` post-change.
4. **CodeRabbit Agentic Workflow:** Automated PR review profile set to assertive via `.coderabbit.yaml`.
5. **Safety Guardrails:** Enforce input sanitization, prompt injection checks, and PII masking via `lib/guardrails.ts`.

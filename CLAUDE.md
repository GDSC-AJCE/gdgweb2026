# Claude Code Rules — GDG on Campus AJCE

See [AGENTS.md](file:///d:/DEV/GDG/newwebsite/AGENTS.md) for complete invariants, architecture, and constraints.

## Invariants & Guardrails
- **100% Google Ecosystem:** Exclusively Cloud Firestore, Firebase Auth (Google SSO), Firebase Storage, and Google Gemini API (`@google/genai`). Never introduce third-party auth or databases.
- **Design System:** Warm Cream Paper canvas (`#f5f1e4`), pure white cards (`#ffffff`), rounded geometry (`36px`–`50px`), and brand colors (Grass Green `#8ed462`, Coral Pop `#ff705d`, Sky Pop `#2ba0ff`, Sunshine Yellow `#ffd600`).
- **CodeRabbit Workflow:** `.coderabbit.yaml` defines assertive PR reviews, SkillSpector security checks, and stack integrity gates.
- **Runtime Guardrails:** All user prompts and AI generation must validate through `lib/guardrails.ts`.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

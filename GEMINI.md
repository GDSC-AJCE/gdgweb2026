# Gemini CLI Rules — GDG on Campus AJCE

See [AGENTS.md](file:///d:/DEV/GDG/newwebsite/AGENTS.md) for master architecture, brand design system, and constraints.

## Core Directives
- **100% Google Stack:** Firebase Auth, Cloud Firestore, Firebase Storage, and `@google/genai`. No third-party DB/Auth.
- **Design System:** Warm Cream Paper `#f5f1e4`, Pure White `#ffffff` bento cards with 36px–50px radii, Inter typography, brand accents `#8ed462`, `#ff705d`, `#2ba0ff`, `#ffd600`.
- **CodeRabbit Workflow:** Governed by `.coderabbit.yaml` with SkillSpector and pre-merge validation.
- **Runtime Guardrails:** `lib/guardrails.ts` for prompt injection filtering, PII masking, and Gemini safety thresholds.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

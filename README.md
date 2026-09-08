# AccessGraph

> Shift-left accessibility tool that maps WCAG violations to their blast radius across a React component dependency graph.

## What it is

AccessGraph is a **demo simulator** built for the Red Hat Innovation Days 2026 Global AI Challenge (Challenge 4 — Accessibility in Software Development at Scale).

The core idea: existing tools like `eslint-plugin-jsx-a11y` flag a violation at its point of failure. AccessGraph shows **who else it breaks** — a single missing `aria-label` on a `<Button>` cascades through the component tree and blocks multiple product surfaces. That propagation is computed via a BFS traversal of the component dependency graph.

The simulator replicates a VS Code split-screen environment in the browser:
- **Left panel** — code editor with annotated violations
- **Right panel** — live dependency graph with blast-radius highlighting, AI-powered fix suggestion, and compliance score

## Tech stack

- React + TypeScript (Vite)
- Tailwind CSS
- Mocked AI service (simulates IBM Granite Code via Red Hat OpenShift AI)

## Running locally

```bash
npm install
npm run dev
```

## Demo flow

1. Select a component with a violation (`Button.tsx` or `FormField.tsx`)
2. The dependency graph highlights the blast radius in red
3. Click **Orchestrate Fix with Developer Lightspeed** — simulates a secure RHOAI inference round-trip (1.5s)
4. Review the PatternFly-compliant fix suggestion
5. Click **Apply** — graph clears, compliance score hits 100%

## Future direction

This demo is intentionally narrow in scope. A production implementation would extend toward:

- A real **VS Code extension** using `CodeActionProvider` and `eslint-plugin-jsx-a11y` as a library against the actual workspace
- Dynamic import graph construction from AST analysis (`@typescript-eslint/parser`) rather than a hardcoded adjacency list
- A live connection to a Granite or Claude model fine-tuned on PatternFly via InstructLab
- Multi-repo and barrel-file support for enterprise-scale codebases
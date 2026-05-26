# Claude PM (`pm`)

> Project management on rails for [Claude Code](https://claude.com/claude-code). A lightweight, file-based replacement for Asana / Notion / Trello — orchestrated by AI, persisted as Markdown.

**Status:** 🚧 Pre-release. MVP under construction.

## What it is

`pm` is a Claude Code plugin that turns a folder on your disk into a personal project manager. You write free-form notes in `_inbox.md`, run `/pm:procesar`, and Claude distributes them into the right project README. Every Monday `/pm:reporte` generates a weekly summary.

- **The filesystem is the database.** No backend, no SQLite, no cloud sync (unless you opt in).
- **Markdown is the format.** Works great with Obsidian, VS Code, or any editor.
- **You configure once, it adapts.** A single `.pm/config.json` controls language, folder structure, taxonomies, and which features are active.

## What it gives you (MVP)

- `/pm:init` — interactive wizard to scaffold your workspace
- `/pm:nuevo-proyecto` — create a new project
- `/pm:procesar` — process your inbox into project READMEs
- `/pm:reporte` — generate a weekly/monthly status report
- `/pm:sync-view` — rebuild `STATUS.md` from current state

Plus 4 subagents and 3 opt-in hooks under the hood.

## Quick start

> Coming with v0.1.0. For now, see [`docs/ONBOARDING.md`](./docs/ONBOARDING.md) (placeholder).

## Design

See [`../11_PLUGIN_DESIGN.md`](../11_PLUGIN_DESIGN.md) in the parent repo for the full design document.

## License

MIT — see [LICENSE](./LICENSE) (TBD).

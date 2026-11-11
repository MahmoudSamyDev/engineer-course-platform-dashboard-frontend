# Claude Ecosystem Curriculum — Dashboard

> Continues the Website curriculum (`../../Website/docs/agent/claude-lessons.md`). One lesson per phase, tied to work actually done.
> Verify against https://code.claude.com/docs (index: https://code.claude.com/docs/llms.txt) before teaching. Mark ✅ when taught.

| Phase | Lesson | What to show using this project | Status |
|---|---|---|---|
| D0 | **Reusing project memory across apps** | How `AGENTS.md`/`CLAUDE.md` were adapted for a second app in the same system; project skills copied selectively into `.claude/skills/`; the React Router skill that ships with `create-react-router` | ⬜ |
| D4 | **Settings & permissions** | `.claude/settings.json` allow rules for `pnpm *`, deny rules for `.env`; permission modes | ⬜ |
| D5 | **Custom slash commands (user-invocable skills)** | A `/verify` skill that runs `quality.md` §1 (typecheck, lint, test, build, mock-code grep, screenshots) | ⬜ |
| D6 | **Hooks** | A `PostToolUse` hook running `eslint --fix` on edited files; a `PreToolUse` hook blocking edits to `.env*` | ⬜ |
| D7 | **Subagents** | A read-only `ui-reviewer` agent in `.claude/agents/` that checks screenshots against DESIGN_SYSTEM | ⬜ |
| D8 | **Independent review** | A fresh subagent reviews refund/cancel/move against DBR-11/12 without seeing the implementation | ✅ (run in D12) |
| D9 | **Path-scoped rules** | `.claude/rules/` file scoped to `app/features/courses/**` with the session/capacity rules | ⬜ |
| D10 | **MCP servers** | Playwright MCP to drive the dashboard in a browser; `.mcp.json` project scope and trust | ✅ |
| D11 | **Hooks** | `PostToolUse` hook that runs Prettier after every Edit/Write (`.claude/settings.json`, `/hooks`) | ✅ |
| D12 | **Headless mode & CI** | `claude -p` in a GitHub Action to review PRs against `quality.md` | ✅ |
| D13 | **Working across repos/folders** | Changing the API contract in the Website backend and the Dashboard in one session; `/add-dir` | ⬜ |
| D14 | **Turning the workflow into a reusable skill or plugin** | Package "SRS → PRD → design system → phases" as a skill for future client projects | ⬜ |

# CLAUDE.md

@AGENTS.md

## Claude Code specifics

- **Skills** (`.claude/skills/`):
  - `react-router` → the official React Router agent skill (from `create-react-router`). Read it, then the **installed docs** in `node_modules/react-router/docs/`, before routing, loaders, middleware or SPA work. React Router 8 is newer than most training data.
  - `ui-ux-pro-max`, `design-system`, `ui-styling`, `brand` → design phases. Example: `python3 .claude/skills/ui-ux-pro-max/scripts/search.py "data table filters" --domain ux`. Filter every result through `docs/DESIGN_SYSTEM.md` (glassmorphism / dark-tech suggestions were already rejected — MARKET_RESEARCH §6).
  - `frontend-design` → every page brief and UI implementation.
  - Not copied on purpose: `slides`, `banner-design`, `design` (logos/CIP), `mobile-app-ui-design` (reserved for the Scanner app; it lives in `../Website/.claude/skills/`).
- **Library docs drift:** MSW is v3 (`onUnhandledFrame`, `msw/vite` plugin), React Router v8 (`clientMiddleware` is stable). Check `node_modules/<pkg>` types/README before using an API from memory.
- **Task list:** one task per loop step of the current phase.
- **Plan mode:** for planning phases and before changes to the API contract, auth, or money/seat actions (refund, move, cancel).
- **Independent review:** for D8 (payments), D9 (sessions/capacity) and D14, run a separate review subagent that hasn't seen the implementation; give it the SRS IDs.
- **Visual checks:** Playwright screenshots at 360 / 768 / 1280 / 1440 in Arabic and English (set `localStorage["dashboard.locale"]`, or the user's locale via `PATCH /admin/auth/me`). Look at the images before marking UI work done. `PW_CHROMIUM_PATH` can point at a local Chromium.

## Learning mode (the product owner is learning the Claude ecosystem)

Same as the Website (`../Website/CLAUDE.md`): use the feature planned for the phase in `docs/agent/claude-lessons.md` where it genuinely helps, and end every phase report with a **"🎓 Claude ecosystem lesson"** block (≤ 15 lines: Concept · How we used it here · Why it matters · Try it yourself · Docs). Verify facts against https://code.claude.com/docs (index: https://code.claude.com/docs/llms.txt) before teaching.

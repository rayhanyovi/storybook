# AGENTS.md

## Source of Truth

Read these files before making architectural decisions:

1. `docs/PRODUCT.md` — product behavior, user flows, surfaces.
2. `docs/TECH.md` — architecture, stack, schema, API contracts, build order.
3. `docs/DESIGN.md` — visual system, components, motion, placeholder image rules.

If there is conflict:
- TECH.md wins for implementation architecture.
- PRODUCT.md wins for product behavior.
- DESIGN.md wins for UI/UX and visual decisions.

## Working Rules

- Do not implement multiple build phases at once.
- Work only on the current task from `TASKS.md`. Unless I'm telling you to update the TASKS
- Do not invent new architecture unless the current docs are impossible to implement.
- Prefer small, reviewable changes.
- After finishing, update `BUILD_LOGS.md` with:
  - date
  - task id
  - files changed
  - what was implemented
  - how to test it
  - known issues

## Code Rules

- Use TypeScript strictly.
- Avoid duplicated types between frontend and backend; use `packages/shared`.
- Keep API and web concerns separated.
- Do not hardcode design colors outside Tailwind/CSS variables unless unavoidable.
- Demo shortcuts must be clearly commented as DEMO-only.

## Safety Rules

- Never delete large folders without asking.
- Never rewrite all docs unless explicitly requested.
- Never change locked stack decisions from TECH.md without asking.
<!-- ## Multi-Agent Rules -->

<!-- This project may be worked on by multiple AI agents in separate git worktrees. -->

<!-- ### Frontend Agent

Frontend Agent owns:
- `apps/web/**`
- `logs/frontend.md`

Frontend Agent must not edit:
- `apps/api/**`
- `apps/api/prisma/**`
- `apps/api/tests/**`
- `packages/shared/**`
- root config files
- lockfiles

### Backend Agent

Backend Agent owns:
- `apps/api/**`
- `apps/api/prisma/**`
- `apps/api/tests/**`
- `logs/backend.md`

Backend Agent must not edit:
- `apps/web/**`
- `packages/shared/**`
- root config files
- lockfiles -->

### Shared Contract Rule

`packages/shared/**` is contract territory.

No agent may change it unless explicitly instructed by the user.

If an agent needs a contract change, it must stop and report:
- what type or field is missing
- why it is needed
- which frontend/backend code depends on it

### Dependency Rule

Agents must not install new dependencies or edit lockfiles unless explicitly instructed.

If a dependency is needed, the agent must report:
- package name
- why it is needed
- which files will use it

### Task Rule

Agents must implement only the assigned task.

Agents must not edit `TASKS.md`.

The user updates task status after review and merge.

# VYRA

VYRA is a Digital Twin as a Service platform for managed audiovisual production, combining digital identity, voice, knowledge, AI-assisted content creation, video generation, publishing, governance, and performance tracking.

## Project status

Greenfield project. Architecture and implementation backlog are being defined through the Neocortex workflow before application code is introduced.

## Workspace tooling

Resolves open question **OQ-P1-01** (`docs/epics/epic-P1.md`) and confirms
assumption **ASM-P1-01**.

| Concern | Decision | Recorded in |
|---|---|---|
| Workspace manager | **pnpm workspaces** (ADR-0002) | `pnpm-workspace.yaml`, `packageManager` in `package.json` |
| Task runner | **pnpm recursive scripts** (`pnpm -r`). No Nx/Turborepo — deferred by ADR-0002. | root `package.json` scripts |
| Node version | pinned in-repo, not taken from the developer machine | `.nvmrc`, `engines.node` |
| pnpm version | pinned in-repo via Corepack | `packageManager`, `engines.pnpm` |
| Module isolation | `node-linker=isolated` (no hoisting) so phantom dependencies stay impossible — supports FF-02 | `.npmrc` |

### Root task interface

One command each, recursive across every workspace:

```bash
pnpm install      # corepack-pinned pnpm, resolves all workspaces
pnpm lint         # ESLint incl. boundary rules (FF-04)
pnpm typecheck    # tsc --noEmit per workspace
pnpm test         # vitest across all workspace projects
pnpm build        # per-workspace build
pnpm fitness      # FF-04, FF-18, FF-19
```

## Canonical workflow

1. Architecture planning (`*arch-plan`)
2. Architecture checkpoint / commit
3. Epics and stories (`*create-epic`)
4. Backlog checkpoint / commit
5. Controlled execution (`*yolo` / execution workflow)

Implementation must not precede the approved architecture and backlog.

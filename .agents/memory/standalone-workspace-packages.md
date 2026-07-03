---
name: Standalone workspace packages vs artifacts
description: When to build a feature as a plain pnpm-workspace package instead of registering it through the artifact system
---

Not every buildable thing in this monorepo should go through `createArtifact`. The artifact system is for things with a preview surface (web apps, mobile apps, slides, APIs the proxy routes to).

**Why:** A headless service with no web preview and no HTTP surface to route through the shared proxy (e.g. a Discord bot connecting only to Discord's gateway) doesn't fit the artifact model — it has no `previewPath`/port for the proxy to expose.

**How to apply:** For headless background services (bots, workers, schedulers) add a plain package under the repo root (e.g. `craftbot/`), list it in `pnpm-workspace.yaml`'s `packages`, and drive it with a normal workflow command (`pnpm --filter @workspace/<name> run start`) instead of registering it as an artifact.

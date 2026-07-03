# CraftBot

A multi-server Discord bot (discord.js) that helps Minecraft clan servers manage clans, points, announcements, giveaways, and basic moderation — entirely through slash commands.

## Run & Operate

- `pnpm --filter @workspace/craftbot run deploy-commands` — register/update slash commands with Discord (run after adding/changing any command)
- `pnpm --filter @workspace/craftbot run start` — run the bot (workflow: "CraftBot")
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000, unrelated to the bot)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (used by the unrelated api-server/db packages, not by the bot)
- Required secret: `BOT_TOKEN` — Discord bot token (already set)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9 (craftbot itself is plain JavaScript, per user request)
- Bot: discord.js v14, plain JS (ESM), slash commands only
- Bot storage: built-in `node:sqlite` (no native build step — see Gotchas)
- Bot images: `@napi-rs/canvas` for the `/topclas` ranking image
- API: Express 5 (unrelated `api-server` scaffold, not used by the bot)
- DB: PostgreSQL + Drizzle ORM (unrelated to the bot, which uses its own SQLite file)

## Where things live

- `craftbot/` — the whole Discord bot (own workspace package `@workspace/craftbot`, plain JS, not part of the TS project references)
- `craftbot/src/commands/` — one file per slash command
- `craftbot/src/events/` — `ready`, `interactionCreate`, `messageCreate`, `guildMemberAdd`
- `craftbot/src/db.js` — SQLite schema + all data access, one row per `guildId` for isolation
- `craftbot/src/utils/` — permissions, moderation log, basic moderation, abuse detector, canvas image renderer
- `craftbot/README.md` — setup/deploy instructions (GitHub, Docker, Railway)

## Architecture decisions

- Built as a standalone `craftbot/` package (not a Replit "artifact") since it's a headless bot with no web preview; registered directly in `pnpm-workspace.yaml` packages list.
- Uses Node's built-in `node:sqlite` instead of `better-sqlite3` to avoid native compilation (no Python/toolchain needed) — see Gotchas.
- Moderation/log channel reuses the "canal de avisos" from `/setup` (no separate log channel field) since the spec only listed 4 setup fields.
- Etapa 2 (tickets, XP, economia, aplicações, moderação avançada) is intentionally deferred to a future session, in separate files as requested.

## Product

CraftBot helps Discord servers run a Minecraft clan: clan creation/deletion with owner-only confirmation flow, per-server point ranking, Minecraft server status, giveaways from message reactions, leader-only announcements, member reports, a cross-server clan leaderboard rendered as an image, automatic welcome messages, and lightweight spam/link moderation — all via slash commands, never DMs or automatic punishment.

## User preferences

- User writes to the agent in Portuguese (pt-BR); mirror that language in responses for this project.
- Internal bot rules that must never be violated: no spam, no unilateral punishment (always needs leader confirmation), never store private messages/sensitive data, no cross-server data leakage, all moderation goes to the log channel, leaders can disable any feature with `/desativar`, and the bot leaves a server on its own if it detects severe misuse.

## Gotchas

- **Privileged intents must be enabled in the Discord Developer Portal** for this bot application: "Server Members Intent" and "Message Content Intent" (under Bot settings). Without them, the bot crashes on startup with `Error: Used disallowed intents`. This can only be toggled by whoever owns the bot application on the Discord Developer Portal — the agent cannot do this.
- Always run `pnpm --filter @workspace/craftbot run deploy-commands` after adding/renaming/changing any slash command — Discord won't pick up changes otherwise. Set `DEV_GUILD_ID` for instant propagation while testing in one server.
- `node:sqlite` logs an `ExperimentalWarning` on every start — expected, not an error.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

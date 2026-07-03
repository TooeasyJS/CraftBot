---
name: node:sqlite instead of better-sqlite3
description: Why a Discord bot's local storage uses Node's built-in node:sqlite module instead of better-sqlite3
---

`better-sqlite3` requires native compilation (node-gyp/Python toolchain) which is unavailable in this Replit environment, causing install/build failures.

**Why:** Node 22+ ships a built-in `node:sqlite` module (`DatabaseSync`) with an API close enough to `better-sqlite3` (`.prepare().run()/.get()/.all()`, `.exec()`, named params like `@name`, `ON CONFLICT` upserts) to be a near drop-in replacement, with zero native build step.

**How to apply:** For any new Node.js project needing embedded/local SQLite storage in this environment, default to `node:sqlite`'s `DatabaseSync` rather than `better-sqlite3` or other native SQLite bindings. Expect an `ExperimentalWarning` logged on every process start — this is expected and not an error.

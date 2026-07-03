// db.js
// Camada de acesso ao SQLite. Cada linha de dados carrega o guildId,
// garantindo isolamento total entre servidores (dados de um clã nunca
// aparecem em outro servidor).

// Usa o módulo nativo node:sqlite (Node 22+) — dispensa compilação de
// dependências nativas, ideal para rodar em Docker/Railway sem toolchain
// de build.
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new DatabaseSync(path.join(dataDir, "craftbot.sqlite"));
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
db.exec(`
  CREATE TABLE IF NOT EXISTS guild_config (
    guildId TEXT PRIMARY KEY,
    welcomeChannelId TEXT,
    avisosChannelId TEXT,
    minecraftIp TEXT,
    leaderRoleId TEXT,
    disabledFeatures TEXT NOT NULL DEFAULT '[]',
    violationScore INTEGER NOT NULL DEFAULT 0,
    createdAt INTEGER NOT NULL DEFAULT (strftime('%s','now'))
  );

  CREATE TABLE IF NOT EXISTS clans (
    guildId TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tag TEXT NOT NULL,
    color TEXT NOT NULL,
    ownerId TEXT NOT NULL,
    confirmed INTEGER NOT NULL DEFAULT 0,
    createdAt INTEGER NOT NULL DEFAULT (strftime('%s','now'))
  );

  CREATE TABLE IF NOT EXISTS points (
    guildId TEXT NOT NULL,
    userId TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (guildId, userId)
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guildId TEXT NOT NULL,
    reporterId TEXT NOT NULL,
    targetId TEXT,
    reason TEXT NOT NULL,
    createdAt INTEGER NOT NULL DEFAULT (strftime('%s','now'))
  );

  CREATE TABLE IF NOT EXISTS mod_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guildId TEXT NOT NULL,
    action TEXT NOT NULL,
    moderatorId TEXT,
    targetId TEXT,
    reason TEXT,
    createdAt INTEGER NOT NULL DEFAULT (strftime('%s','now'))
  );
`);

// ---------------------------------------------------------------------------
// Guild config helpers
// ---------------------------------------------------------------------------
export function getGuildConfig(guildId) {
  let row = db
    .prepare("SELECT * FROM guild_config WHERE guildId = ?")
    .get(guildId);
  if (!row) {
    db.prepare("INSERT INTO guild_config (guildId) VALUES (?)").run(guildId);
    row = db.prepare("SELECT * FROM guild_config WHERE guildId = ?").get(guildId);
  }
  return {
    ...row,
    disabledFeatures: JSON.parse(row.disabledFeatures || "[]"),
  };
}

export function updateGuildConfig(guildId, fields) {
  getGuildConfig(guildId); // garante que a linha existe
  const keys = Object.keys(fields);
  if (keys.length === 0) return;
  const setClause = keys.map((k) => `${k} = @${k}`).join(", ");
  db.prepare(`UPDATE guild_config SET ${setClause} WHERE guildId = @guildId`).run({
    guildId,
    ...fields,
  });
}

export function isFeatureDisabled(guildId, feature) {
  const cfg = getGuildConfig(guildId);
  return cfg.disabledFeatures.includes(feature);
}

export function setFeatureDisabled(guildId, feature, disabled) {
  const cfg = getGuildConfig(guildId);
  let list = cfg.disabledFeatures;
  if (disabled) {
    if (!list.includes(feature)) list.push(feature);
  } else {
    list = list.filter((f) => f !== feature);
  }
  updateGuildConfig(guildId, { disabledFeatures: JSON.stringify(list) });
  return list;
}

export function bumpViolationScore(guildId, amount = 1) {
  const cfg = getGuildConfig(guildId);
  const newScore = cfg.violationScore + amount;
  updateGuildConfig(guildId, { violationScore: newScore });
  return newScore;
}

export function resetViolationScore(guildId) {
  updateGuildConfig(guildId, { violationScore: 0 });
}

// ---------------------------------------------------------------------------
// Clan helpers
// ---------------------------------------------------------------------------
export function getClan(guildId) {
  return db.prepare("SELECT * FROM clans WHERE guildId = ?").get(guildId);
}

export function createClan(guildId, { name, tag, color, ownerId }) {
  db.prepare(
    `INSERT INTO clans (guildId, name, tag, color, ownerId, confirmed)
     VALUES (@guildId, @name, @tag, @color, @ownerId, 0)
     ON CONFLICT(guildId) DO UPDATE SET
       name = excluded.name,
       tag = excluded.tag,
       color = excluded.color,
       ownerId = excluded.ownerId,
       confirmed = 0`
  ).run({ guildId, name, tag, color, ownerId });
  return getClan(guildId);
}

export function confirmClan(guildId) {
  db.prepare("UPDATE clans SET confirmed = 1 WHERE guildId = ?").run(guildId);
  return getClan(guildId);
}

export function deleteClan(guildId) {
  db.prepare("DELETE FROM clans WHERE guildId = ?").run(guildId);
  db.prepare("DELETE FROM points WHERE guildId = ?").run(guildId);
}

export function getAllConfirmedClans() {
  return db.prepare("SELECT * FROM clans WHERE confirmed = 1").all();
}

// ---------------------------------------------------------------------------
// Points helpers
// ---------------------------------------------------------------------------
export function addPoints(guildId, userId, amount) {
  db.prepare(
    `INSERT INTO points (guildId, userId, points) VALUES (?, ?, ?)
     ON CONFLICT(guildId, userId) DO UPDATE SET points = points + excluded.points`
  ).run(guildId, userId, amount);
  return db
    .prepare("SELECT points FROM points WHERE guildId = ? AND userId = ?")
    .get(guildId, userId).points;
}

export function getRanking(guildId, limit = 10) {
  return db
    .prepare(
      "SELECT userId, points FROM points WHERE guildId = ? ORDER BY points DESC LIMIT ?"
    )
    .all(guildId, limit);
}

// ---------------------------------------------------------------------------
// Reports & moderation log
// ---------------------------------------------------------------------------
export function addReport(guildId, reporterId, targetId, reason) {
  db.prepare(
    "INSERT INTO reports (guildId, reporterId, targetId, reason) VALUES (?, ?, ?, ?)"
  ).run(guildId, reporterId, targetId, reason);
}

export function addModLog(guildId, action, moderatorId, targetId, reason) {
  db.prepare(
    "INSERT INTO mod_log (guildId, action, moderatorId, targetId, reason) VALUES (?, ?, ?, ?, ?)"
  ).run(guildId, action, moderatorId ?? null, targetId ?? null, reason ?? null);
}

export default db;

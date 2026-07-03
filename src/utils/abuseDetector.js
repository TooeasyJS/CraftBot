// abuseDetector.js
// Detector simples e transparente de uso grave indevido do bot, seguindo
// as Diretrizes da Comunidade Discord (https://discord.com/guidelines) e a
// Política de Desenvolvedores (https://support-dev.discord.com/hc/en-us/articles/8563934450327).
//
// O CraftBot NUNCA pune usuários automaticamente (isso é proibido pelas
// regras internas). Este detector observa apenas o comportamento do
// PRÓPRIO SERVIDOR em relação ao bot (ex: uso do bot para inundar canais
// de spam/raid). Se um limite de violações graves for atingido, o bot
// avisa no canal de log e sai sozinho (guild.leave()) — nunca bane, muta
// ou pune membros por conta própria.

import { bumpViolationScore, resetViolationScore, getGuildConfig } from "../db.js";
import { logModeration } from "./logger.js";

const SEVERE_THRESHOLD = 8; // nº de violações graves em uma janela antes de sair
const WINDOW_MS = 10 * 60 * 1000; // 10 minutos

const windows = new Map(); // guildId -> { count, resetAt }

function getWindow(guildId) {
  const now = Date.now();
  let w = windows.get(guildId);
  if (!w || now > w.resetAt) {
    w = { count: 0, resetAt: now + WINDOW_MS };
    windows.set(guildId, w);
  }
  return w;
}

/**
 * Registra uma violação grave (ex: tentativa de usar o bot para armazenar
 * dados sensíveis, disparar spam em massa via comandos, etc). Se o
 * servidor ultrapassar o limite, o bot sai automaticamente explicando o
 * motivo.
 */
export async function reportSevereAbuse(guild, reason) {
  const w = getWindow(guild.id);
  w.count += 1;
  bumpViolationScore(guild.id, 1);

  if (w.count < SEVERE_THRESHOLD) return false;

  const finalReason =
    `Uso grave indevido detectado (${w.count} violações em ${Math.round(WINDOW_MS / 60000)} min). ` +
    `Último motivo: ${reason}. O CraftBot está saindo deste servidor por segurança, ` +
    `conforme suas regras internas e as diretrizes do Discord.`;

  await logModeration(guild, {
    action: "Saída automática (uso indevido grave)",
    reason: finalReason,
    color: 0xe74c3c,
  }).catch(() => {});

  // Avisa o dono do servidor por DM, quando possível.
  try {
    const owner = await guild.fetchOwner();
    await owner.send(
      `⚠️ O CraftBot saiu do servidor **${guild.name}** automaticamente.\n\nMotivo: ${finalReason}`
    );
  } catch {
    // Se não for possível enviar DM, apenas segue em frente.
  }

  resetViolationScore(guild.id);
  windows.delete(guild.id);
  await guild.leave();
  return true;
}

export function getGuildViolationWindow(guildId) {
  return getWindow(guildId);
}

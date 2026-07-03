// logger.js
// Toda ação de moderação (avisos, remoção de mensagens, denúncias,
// desativação de função, saída forçada, etc.) passa por aqui e é
// registrada no canal de avisos configurado em /setup + no banco.

import { EmbedBuilder } from "discord.js";
import { getGuildConfig, addModLog } from "../db.js";

/**
 * Envia um embed de log de moderação para o canal de avisos do servidor
 * e grava um registro persistente no SQLite.
 */
export async function logModeration(guild, { action, moderator, target, reason, color = 0xf1c40f }) {
  addModLog(guild.id, action, moderator?.id, target?.id, reason);

  const cfg = getGuildConfig(guild.id);
  if (!cfg.avisosChannelId) return;

  const channel = guild.channels.cache.get(cfg.avisosChannelId);
  if (!channel || !channel.isTextBased()) return;

  const embed = new EmbedBuilder()
    .setTitle(`📋 Log de Moderação — ${action}`)
    .setColor(color)
    .addFields(
      { name: "Responsável", value: moderator ? `<@${moderator.id}>` : "CraftBot (automático)", inline: true },
      { name: "Alvo", value: target ? `<@${target.id}>` : "—", inline: true },
      { name: "Motivo", value: reason || "Não informado" }
    )
    .setTimestamp();

  await channel.send({ embeds: [embed] }).catch(() => {});
}

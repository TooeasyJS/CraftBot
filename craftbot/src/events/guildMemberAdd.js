// guildMemberAdd.js — boas-vindas automáticas no canal configurado em /setup.

import { EmbedBuilder } from "discord.js";
import { getGuildConfig, isFeatureDisabled } from "../db.js";

export const name = "guildMemberAdd";
export const once = false;

export async function execute(member) {
  if (isFeatureDisabled(member.guild.id, "boasvindas")) return;

  const cfg = getGuildConfig(member.guild.id);
  if (!cfg.welcomeChannelId) return;

  const channel = member.guild.channels.cache.get(cfg.welcomeChannelId);
  if (!channel || !channel.isTextBased()) return;

  const embed = new EmbedBuilder()
    .setTitle("👋 Bem-vindo(a)!")
    .setDescription(
      `Seja bem-vindo(a) ao servidor, ${member}!\n\nUse \`/regras\` para conhecer as regras e \`/ajuda\` para ver os comandos disponíveis.`
    )
    .setColor(0x2ecc71)
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp();

  await channel.send({ embeds: [embed] }).catch(() => {});
}

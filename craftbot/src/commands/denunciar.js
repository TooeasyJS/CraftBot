// /denunciar — reporta um problema aos líderes. Nunca guarda mensagens
// privadas ou dados sensíveis — apenas o motivo informado pelo autor.

import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getGuildConfig, addReport } from "../db.js";

export const data = new SlashCommandBuilder()
  .setName("denunciar")
  .setDescription("Reporta um problema aos líderes do clã")
  .addStringOption((opt) =>
    opt.setName("motivo").setDescription("Descreva o problema").setRequired(true).setMaxLength(500)
  )
  .addUserOption((opt) => opt.setName("usuario").setDescription("Usuário relacionado (opcional)"));

export async function execute(interaction) {
  const motivo = interaction.options.getString("motivo");
  const target = interaction.options.getUser("usuario");
  const cfg = getGuildConfig(interaction.guildId);

  addReport(interaction.guildId, interaction.user.id, target?.id ?? null, motivo);

  const embed = new EmbedBuilder()
    .setTitle("🚨 Nova Denúncia")
    .setColor(0xe74c3c)
    .addFields(
      { name: "Denunciante", value: `${interaction.user}`, inline: true },
      { name: "Usuário relacionado", value: target ? `${target}` : "—", inline: true },
      { name: "Motivo", value: motivo }
    )
    .setTimestamp();

  const targetChannel = cfg.avisosChannelId
    ? interaction.guild.channels.cache.get(cfg.avisosChannelId)
    : null;

  const mention = cfg.leaderRoleId ? `<@&${cfg.leaderRoleId}>` : "";

  if (targetChannel) {
    await targetChannel.send({ content: mention || undefined, embeds: [embed] }).catch(() => {});
  }

  await interaction.reply({
    content: "✅ Denúncia enviada aos líderes. Obrigado por ajudar a manter o servidor seguro.",
    ephemeral: true,
  });
}

// /aviso — só líderes, embed formatado enviado ao canal de avisos.

import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getGuildConfig } from "../db.js";
import { isLeader } from "../utils/permissions.js";
import { logModeration } from "../utils/logger.js";

export const data = new SlashCommandBuilder()
  .setName("aviso")
  .setDescription("Envia um aviso oficial do clã (apenas líderes)")
  .addStringOption((opt) =>
    opt.setName("titulo").setDescription("Título do aviso").setRequired(true)
  )
  .addStringOption((opt) =>
    opt.setName("mensagem").setDescription("Conteúdo do aviso").setRequired(true)
  );

export async function execute(interaction) {
  if (!isLeader(interaction)) {
    return interaction.reply({ content: "❌ Apenas líderes podem enviar avisos.", ephemeral: true });
  }

  const titulo = interaction.options.getString("titulo");
  const mensagem = interaction.options.getString("mensagem");
  const cfg = getGuildConfig(interaction.guildId);

  const embed = new EmbedBuilder()
    .setTitle(`📢 ${titulo}`)
    .setDescription(mensagem)
    .setColor(0x3498db)
    .setFooter({ text: `Enviado por ${interaction.user.username}` })
    .setTimestamp();

  const targetChannel = cfg.avisosChannelId
    ? interaction.guild.channels.cache.get(cfg.avisosChannelId)
    : interaction.channel;

  await (targetChannel || interaction.channel).send({ embeds: [embed] });

  await logModeration(interaction.guild, {
    action: "Aviso enviado",
    moderator: interaction.user,
    reason: titulo,
    color: 0x3498db,
  });

  await interaction.reply({ content: "✅ Aviso enviado.", ephemeral: true });
}

// /ranking — mostra o ranking de pontos do servidor.

import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { getRanking } from "../db.js";

export const data = new SlashCommandBuilder()
  .setName("ranking")
  .setDescription("Mostra o ranking de pontos do servidor");

export async function execute(interaction) {
  const rows = getRanking(interaction.guildId, 10);

  if (rows.length === 0) {
    return interaction.reply({ content: "Ainda não há pontos registrados neste servidor." });
  }

  const medals = ["🥇", "🥈", "🥉"];
  const lines = rows.map((row, i) => {
    const prefix = medals[i] || `${i + 1}.`;
    return `${prefix} <@${row.userId}> — **${row.points}** pontos`;
  });

  const embed = new EmbedBuilder()
    .setTitle(`🏆 Ranking — ${interaction.guild.name}`)
    .setColor(0xf1c40f)
    .setDescription(lines.join("\n"))
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

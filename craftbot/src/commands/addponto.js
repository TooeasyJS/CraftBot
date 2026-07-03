// /addponto @usuario — apenas líderes, soma pontos por servidor.

import { SlashCommandBuilder } from "discord.js";
import { addPoints } from "../db.js";
import { isLeader } from "../utils/permissions.js";
import { logModeration } from "../utils/logger.js";

export const data = new SlashCommandBuilder()
  .setName("addponto")
  .setDescription("Adiciona pontos a um membro (apenas líderes)")
  .addUserOption((opt) =>
    opt.setName("usuario").setDescription("Usuário que receberá os pontos").setRequired(true)
  )
  .addIntegerOption((opt) =>
    opt.setName("quantidade").setDescription("Quantidade de pontos (padrão: 1)").setMinValue(1)
  );

export async function execute(interaction) {
  if (!isLeader(interaction)) {
    return interaction.reply({
      content: "❌ Apenas líderes podem adicionar pontos.",
      ephemeral: true,
    });
  }

  const user = interaction.options.getUser("usuario");
  const amount = interaction.options.getInteger("quantidade") ?? 1;

  const total = addPoints(interaction.guildId, user.id, amount);

  await logModeration(interaction.guild, {
    action: "Pontos adicionados",
    moderator: interaction.user,
    target: user,
    reason: `+${amount} ponto(s). Total: ${total}`,
    color: 0x3498db,
  });

  await interaction.reply(`✅ ${user} recebeu **${amount}** ponto(s). Total: **${total}**.`);
}

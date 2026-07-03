// /desativar [função] — o líder pode desativar qualquer função do bot.

import { SlashCommandBuilder } from "discord.js";
import { isFeatureDisabled, setFeatureDisabled } from "../db.js";
import { isLeader } from "../utils/permissions.js";
import { logModeration } from "../utils/logger.js";

const FEATURES = [
  { name: "Moderação (spam/links)", value: "moderacao" },
  { name: "Boas-vindas", value: "boasvindas" },
  { name: "Sorteio", value: "sorteio" },
  { name: "Pontuação (addponto/ranking)", value: "pontuacao" },
  { name: "Avisos", value: "aviso" },
  { name: "Denúncias", value: "denunciar" },
  { name: "Top Clãs", value: "topclas" },
];

export const data = new SlashCommandBuilder()
  .setName("desativar")
  .setDescription("Ativa ou desativa uma função do CraftBot (apenas líderes)")
  .addStringOption((opt) =>
    opt
      .setName("funcao")
      .setDescription("Função a ativar/desativar")
      .setRequired(true)
      .addChoices(...FEATURES)
  );

export async function execute(interaction) {
  if (!isLeader(interaction)) {
    return interaction.reply({
      content: "❌ Apenas líderes podem ativar/desativar funções.",
      ephemeral: true,
    });
  }

  const feature = interaction.options.getString("funcao");
  const currentlyDisabled = isFeatureDisabled(interaction.guildId, feature);
  setFeatureDisabled(interaction.guildId, feature, !currentlyDisabled);

  const label = FEATURES.find((f) => f.value === feature)?.name ?? feature;
  const status = currentlyDisabled ? "ativada" : "desativada";

  await logModeration(interaction.guild, {
    action: `Função ${status}`,
    moderator: interaction.user,
    reason: label,
    color: 0x95a5a6,
  });

  await interaction.reply(`✅ Função **${label}** agora está **${status}**.`);
}

export { FEATURES };

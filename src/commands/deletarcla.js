// /deletarclã — apaga o clã, com confirmação dupla.

import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { getClan, deleteClan } from "../db.js";
import { isServerOwner } from "../utils/permissions.js";
import { logModeration } from "../utils/logger.js";

export const data = new SlashCommandBuilder()
  .setName("deletarcla")
  .setDescription("Apaga o clã do servidor (apenas o dono, com confirmação dupla)");

export async function execute(interaction) {
  if (!isServerOwner(interaction)) {
    return interaction.reply({
      content: "❌ Apenas o **dono do servidor** pode apagar o clã.",
      ephemeral: true,
    });
  }

  const clan = getClan(interaction.guildId);
  if (!clan) {
    return interaction.reply({ content: "❌ Este servidor não possui um clã.", ephemeral: true });
  }

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("del_1_sim").setLabel("Sim, apagar").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("del_1_nao").setLabel("Cancelar").setStyle(ButtonStyle.Secondary)
  );

  const reply = await interaction.reply({
    content: `⚠️ Tem certeza que deseja apagar o clã **${clan.name} [${clan.tag}]**? Essa ação não pode ser desfeita.`,
    components: [row1],
    fetchReply: true,
    ephemeral: true,
  });

  const collector = reply.createMessageComponentCollector({ time: 60_000 });

  collector.on("collect", async (btn) => {
    if (btn.user.id !== interaction.user.id) {
      return btn.reply({ content: "Apenas quem executou o comando pode confirmar.", ephemeral: true });
    }

    if (btn.customId === "del_1_nao") {
      await btn.update({ content: "❌ Operação cancelada.", components: [] });
      collector.stop();
      return;
    }

    if (btn.customId === "del_1_sim") {
      const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("del_2_sim")
          .setLabel("Confirmar definitivamente")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("del_2_nao").setLabel("Cancelar").setStyle(ButtonStyle.Secondary)
      );
      await btn.update({
        content: `🔴 **Última confirmação**: apagar **${clan.name} [${clan.tag}]** para sempre?`,
        components: [row2],
      });
    }

    if (btn.customId === "del_2_nao") {
      await btn.update({ content: "❌ Operação cancelada.", components: [] });
      collector.stop();
    }

    if (btn.customId === "del_2_sim") {
      deleteClan(interaction.guildId);
      await logModeration(interaction.guild, {
        action: "Clã apagado",
        moderator: interaction.user,
        reason: `Clã ${clan.name} [${clan.tag}] removido pelo dono do servidor`,
        color: 0xe74c3c,
      });
      await btn.update({ content: "✅ Clã apagado com sucesso.", components: [] });
      collector.stop();
    }
  });
}

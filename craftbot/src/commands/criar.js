// /criar [nome] [tag] [cor]
// Só o dono do servidor pode usar. Mostra preview com botões Editar e
// Confirmar. Só libera os outros comandos de clã depois de confirmado.
// Apenas 1 clã por servidor.

import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { getClan, createClan, confirmClan } from "../db.js";
import { isServerOwner } from "../utils/permissions.js";

export const data = new SlashCommandBuilder()
  .setName("criar")
  .setDescription("Cria o clã do seu servidor (apenas o dono pode usar)")
  .addStringOption((opt) =>
    opt.setName("nome").setDescription("Nome do clã").setRequired(true).setMaxLength(32)
  )
  .addStringOption((opt) =>
    opt
      .setName("tag")
      .setDescription("Tag única de 3 letras (ex: ABC)")
      .setRequired(true)
      .setMinLength(3)
      .setMaxLength(3)
  )
  .addStringOption((opt) =>
    opt
      .setName("cor")
      .setDescription("Cor do clã em hexadecimal (ex: #FF00AA)")
      .setRequired(true)
  );

function buildPreviewEmbed(guild, name, tag, color) {
  return new EmbedBuilder()
    .setTitle("Pré-visualização do Clã")
    .setColor(color)
    .addFields(
      { name: "Nome", value: name, inline: true },
      { name: "Tag", value: tag, inline: true },
      { name: "Cor", value: color, inline: true }
    )
    .setFooter({ text: "Confira os dados antes de confirmar." })
    .setThumbnail(guild.iconURL() || null);
}

export async function execute(interaction) {
  if (!isServerOwner(interaction)) {
    return interaction.reply({
      content: "❌ Apenas o **dono do servidor** pode criar o clã.",
      ephemeral: true,
    });
  }

  const existing = getClan(interaction.guildId);
  if (existing) {
    return interaction.reply({
      content: `❌ Este servidor já possui um clã: **${existing.name} [${existing.tag}]**${
        existing.confirmed ? "" : " (aguardando confirmação)"
      }.`,
      ephemeral: true,
    });
  }

  const name = interaction.options.getString("nome").trim();
  const tag = interaction.options.getString("tag").trim().toUpperCase();
  const color = interaction.options.getString("cor").trim();

  if (!/^[A-Za-zÀ-ÿ]{3}$/.test(tag)) {
    return interaction.reply({
      content: "❌ A tag deve ter exatamente 3 letras (sem números ou símbolos).",
      ephemeral: true,
    });
  }

  if (!/^#?[0-9A-Fa-f]{6}$/.test(color)) {
    return interaction.reply({
      content: "❌ Cor inválida. Use um hexadecimal como `#FF00AA`.",
      ephemeral: true,
    });
  }

  const normalizedColor = color.startsWith("#") ? color : `#${color}`;

  const embed = buildPreviewEmbed(interaction.guild, name, tag, normalizedColor);
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("cla_editar")
      .setLabel("Editar")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("cla_confirmar")
      .setLabel("Confirmar")
      .setStyle(ButtonStyle.Success)
  );

  const reply = await interaction.reply({
    embeds: [embed],
    components: [row],
    fetchReply: true,
  });

  const collector = reply.createMessageComponentCollector({ time: 5 * 60 * 1000 });

  collector.on("collect", async (btn) => {
    if (btn.user.id !== interaction.user.id) {
      return btn.reply({
        content: "Apenas quem executou o comando pode interagir.",
        ephemeral: true,
      });
    }

    if (btn.customId === "cla_editar") {
      await btn.update({
        content: "✏️ Execute `/criar` novamente com os dados corrigidos.",
        embeds: [],
        components: [],
      });
      collector.stop();
      return;
    }

    if (btn.customId === "cla_confirmar") {
      createClan(interaction.guildId, {
        name,
        tag,
        color: normalizedColor,
        ownerId: interaction.user.id,
      });
      confirmClan(interaction.guildId);

      await btn.update({
        content: `✅ Clã **${name} [${tag}]** criado e confirmado! Os comandos do clã já estão liberados.`,
        embeds: [],
        components: [],
      });
      collector.stop();
    }
  });

  collector.on("end", (collected) => {
    if (collected.size === 0) {
      interaction
        .editReply({ content: "⌛ Tempo esgotado. Execute `/criar` novamente.", components: [] })
        .catch(() => {});
    }
  });
}

// /setup — define canal de boas-vindas, canal de avisos, IP do servidor
// Minecraft e cargo de líder. Salvo em SQLite por servidor.

import { SlashCommandBuilder, ChannelType } from "discord.js";
import { updateGuildConfig } from "../db.js";
import { isAdmin } from "../utils/permissions.js";

export const data = new SlashCommandBuilder()
  .setName("setup")
  .setDescription("Configura o CraftBot para este servidor (apenas administradores)")
  .addChannelOption((opt) =>
    opt
      .setName("canal_boasvindas")
      .setDescription("Canal onde as boas-vindas serão enviadas")
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(true)
  )
  .addChannelOption((opt) =>
    opt
      .setName("canal_avisos")
      .setDescription("Canal usado para avisos e log de moderação")
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(true)
  )
  .addStringOption((opt) =>
    opt.setName("ip_servidor").setDescription("IP do servidor de Minecraft").setRequired(true)
  )
  .addRoleOption((opt) =>
    opt.setName("cargo_lider").setDescription("Cargo dos líderes do clã").setRequired(true)
  );

export async function execute(interaction) {
  if (!isAdmin(interaction)) {
    return interaction.reply({
      content: "❌ Apenas administradores podem configurar o CraftBot.",
      ephemeral: true,
    });
  }

  const welcomeChannel = interaction.options.getChannel("canal_boasvindas");
  const avisosChannel = interaction.options.getChannel("canal_avisos");
  const minecraftIp = interaction.options.getString("ip_servidor").trim();
  const leaderRole = interaction.options.getRole("cargo_lider");

  updateGuildConfig(interaction.guildId, {
    welcomeChannelId: welcomeChannel.id,
    avisosChannelId: avisosChannel.id,
    minecraftIp,
    leaderRoleId: leaderRole.id,
  });

  await interaction.reply({
    content:
      `✅ Configuração salva!\n` +
      `• Boas-vindas: ${welcomeChannel}\n` +
      `• Avisos/Log: ${avisosChannel}\n` +
      `• IP do servidor: \`${minecraftIp}\`\n` +
      `• Cargo de líder: ${leaderRole}`,
    ephemeral: true,
  });
}

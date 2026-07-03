// /server — status do servidor Minecraft configurado via /setup.

import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { status } from "minecraft-server-util";
import { getGuildConfig } from "../db.js";

export const data = new SlashCommandBuilder()
  .setName("server")
  .setDescription("Mostra o status do servidor de Minecraft do clã");

export async function execute(interaction) {
  const cfg = getGuildConfig(interaction.guildId);
  if (!cfg.minecraftIp) {
    return interaction.reply({
      content: "❌ Nenhum IP configurado. Peça a um administrador para rodar `/setup`.",
      ephemeral: true,
    });
  }

  await interaction.deferReply();

  const [host, portStr] = cfg.minecraftIp.split(":");
  const port = portStr ? parseInt(portStr, 10) : 25565;

  try {
    const result = await status(host, port, { timeout: 5000 });
    const embed = new EmbedBuilder()
      .setTitle("🟢 Servidor Online")
      .setColor(0x2ecc71)
      .addFields(
        { name: "Endereço", value: cfg.minecraftIp, inline: true },
        { name: "Versão", value: result.version.name, inline: true },
        {
          name: "Jogadores",
          value: `${result.players.online}/${result.players.max}`,
          inline: true,
        },
        { name: "MOTD", value: result.motd.clean || "—" }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    const embed = new EmbedBuilder()
      .setTitle("🔴 Servidor Offline")
      .setColor(0xe74c3c)
      .setDescription(`Não foi possível conectar em \`${cfg.minecraftIp}\`.`)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
}

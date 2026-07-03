// /ajuda — lista todos os comandos disponíveis.

import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ajuda")
  .setDescription("Mostra todos os comandos do CraftBot");

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setTitle("🤖 CraftBot — Comandos")
    .setColor(0x2ecc71)
    .setDescription("Bot multi-servidor para ajudar clãs de Minecraft.")
    .addFields(
      {
        name: "⚙️ Configuração",
        value:
          "`/setup` — configura canais, IP do servidor e cargo de líder\n" +
          "`/desativar [função]` — liga/desliga uma função do bot",
      },
      {
        name: "🏰 Clã",
        value:
          "`/criar` — cria o clã do servidor (dono)\n" +
          "`/deletarcla` — apaga o clã (dono, com confirmação dupla)\n" +
          "`/topclas` — ranking geral de clãs entre servidores",
      },
      {
        name: "🏆 Pontuação",
        value: "`/addponto` — adiciona pontos a um membro (líder)\n`/ranking` — ranking de pontos",
      },
      {
        name: "📢 Comunicação",
        value:
          "`/aviso` — envia um aviso oficial (líder)\n" +
          "`/denunciar` — reporta um problema aos líderes\n" +
          "`/sorteio` — sorteia quem reagiu numa mensagem",
      },
      {
        name: "🎮 Minecraft",
        value: "`/server` — status do servidor de Minecraft",
      },
      {
        name: "🛡️ Moderação",
        value: "Remoção automática de spam/links, sempre com aviso público. Nunca pune sozinho.",
      },
      {
        name: "ℹ️ Outros",
        value: "`/regras` — regras internas e diretrizes do Discord\n`/ajuda` — esta lista",
      }
    )
    .setFooter({ text: "Etapa 2 trará tickets, XP, moderação avançada, aplicações e economia." });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

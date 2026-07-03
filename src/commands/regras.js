// /regras — mostra as regras internas do bot e aponta para as diretrizes
// oficiais do Discord.

import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("regras")
  .setDescription("Mostra as regras internas do CraftBot");

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setTitle("📜 Regras do CraftBot")
    .setColor(0x9b59b6)
    .setDescription(
      "O CraftBot segue rigorosamente as [Diretrizes da Comunidade Discord]" +
        "(https://discord.com/guidelines) e a [Política de Desenvolvedores]" +
        "(https://support-dev.discord.com/hc/en-us/articles/8563934450327-Discord-Developer-Policy)."
    )
    .addFields(
      { name: "🚫 Nunca faz spam", value: "O bot nunca envia mensagens em massa ou repetitivas." },
      {
        name: "🤝 Nunca pune sozinho",
        value: "Nenhuma punição (ban, mute, kick) é aplicada sem confirmação de um líder.",
      },
      {
        name: "🔒 Privacidade",
        value: "Mensagens privadas e dados sensíveis nunca são armazenados.",
      },
      {
        name: "🧱 Isolamento entre servidores",
        value: "Os dados de um clã nunca são compartilhados com outro servidor.",
      },
      {
        name: "📋 Log de moderação",
        value: "Toda ação de moderação é registrada no canal de avisos configurado.",
      },
      {
        name: "🚪 Saída automática",
        value:
          "Se detectar uso grave indevido do bot, o CraftBot avisa o motivo e sai sozinho do servidor.",
      },
      {
        name: "🛑 Controle do líder",
        value: "Qualquer função pode ser desativada com `/desativar [função]`.",
      }
    )
    .setFooter({ text: "Use /ajuda para ver a lista completa de comandos." });

  await interaction.reply({ embeds: [embed] });
}

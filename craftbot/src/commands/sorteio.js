// /sorteio — sorteia quem reagiu numa mensagem.

import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("sorteio")
  .setDescription("Sorteia um usuário entre quem reagiu a uma mensagem")
  .addStringOption((opt) =>
    opt.setName("mensagem_id").setDescription("ID da mensagem com as reações").setRequired(true)
  )
  .addStringOption((opt) =>
    opt.setName("emoji").setDescription("Emoji usado na reação (ex: 🎉)").setRequired(true)
  )
  .addChannelOption((opt) =>
    opt.setName("canal").setDescription("Canal onde está a mensagem (padrão: canal atual)")
  );

export async function execute(interaction) {
  const messageId = interaction.options.getString("mensagem_id").trim();
  const emojiInput = interaction.options.getString("emoji").trim();
  const channel = interaction.options.getChannel("canal") || interaction.channel;

  await interaction.deferReply();

  let message;
  try {
    message = await channel.messages.fetch(messageId);
  } catch {
    return interaction.editReply("❌ Não encontrei essa mensagem nesse canal.");
  }

  const reaction = message.reactions.cache.find(
    (r) => r.emoji.name === emojiInput || r.emoji.toString() === emojiInput
  );

  if (!reaction) {
    return interaction.editReply(`❌ Ninguém reagiu com ${emojiInput} nessa mensagem.`);
  }

  const users = (await reaction.users.fetch()).filter((u) => !u.bot);
  if (users.size === 0) {
    return interaction.editReply("❌ Nenhum participante válido encontrado.");
  }

  const winner = users.random();
  const embed = new EmbedBuilder()
    .setTitle("🎉 Resultado do Sorteio")
    .setColor(0xf1c40f)
    .setDescription(`Vencedor(a): ${winner}\n\nParticipantes: ${users.size}`)
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}

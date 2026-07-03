// interactionCreate.js — despacha slash commands.

import { logger } from "../utils/logging.js";

export const name = "interactionCreate";
export const once = false;

export async function execute(interaction) {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    logger.error(`Erro ao executar /${interaction.commandName}: ${err?.stack || err}`);
    const payload = {
      content: "❌ Ocorreu um erro ao executar este comando.",
      ephemeral: true,
    };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload).catch(() => {});
    } else {
      await interaction.reply(payload).catch(() => {});
    }
  }
}

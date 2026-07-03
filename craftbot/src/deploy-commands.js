// deploy-commands.js — registra os slash commands na API do Discord.
// Uso: pnpm --filter @workspace/craftbot run deploy-commands
//
// Registra globalmente por padrão (leva até ~1h para propagar). Se a
// variável DEV_GUILD_ID estiver definida, registra apenas nesse servidor
// para testes instantâneos.

import { REST, Routes } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { logger } from "./utils/logging.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.BOT_TOKEN) {
  logger.error("Variável de ambiente BOT_TOKEN não encontrada.");
  process.exit(1);
}

const rest = new REST().setToken(process.env.BOT_TOKEN);

async function loadCommandData() {
  const commandsPath = path.join(__dirname, "commands");
  const files = fs.readdirSync(commandsPath).filter((f) => f.endsWith(".js"));
  const commands = [];

  for (const file of files) {
    const mod = await import(pathToFileURL(path.join(commandsPath, file)).href);
    if (mod.data) commands.push(mod.data.toJSON());
  }
  return commands;
}

async function main() {
  const commands = await loadCommandData();
  logger.info(`Registrando ${commands.length} comando(s)...`);

  const app = await rest.get(Routes.oauth2CurrentApplication());
  const clientId = app.id;

  if (process.env.DEV_GUILD_ID) {
    await rest.put(Routes.applicationGuildCommands(clientId, process.env.DEV_GUILD_ID), {
      body: commands,
    });
    logger.info(`Comandos registrados no servidor de testes ${process.env.DEV_GUILD_ID}.`);
  } else {
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    logger.info("Comandos registrados globalmente (pode levar até 1h para propagar).");
  }
}

main().catch((err) => {
  logger.error(`Falha ao registrar comandos: ${err?.stack || err}`);
  process.exit(1);
});

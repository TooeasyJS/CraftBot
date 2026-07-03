// index.js — ponto de entrada do CraftBot.
// Lê os comandos e eventos das pastas correspondentes e conecta ao
// Discord Gateway usando apenas os intents necessários.

import { Client, GatewayIntentBits, Collection, Partials } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { logger } from "./utils/logging.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!process.env.BOT_TOKEN) {
  logger.error("Variável de ambiente BOT_TOKEN não encontrada. Configure-a antes de iniciar o bot.");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Reaction, Partials.Channel],
});

client.commands = new Collection();

async function loadCommands() {
  const commandsPath = path.join(__dirname, "commands");
  const files = fs.readdirSync(commandsPath).filter((f) => f.endsWith(".js"));

  for (const file of files) {
    const mod = await import(pathToFileURL(path.join(commandsPath, file)).href);
    if (mod.data && mod.execute) {
      client.commands.set(mod.data.name, mod);
    } else {
      logger.warn(`Comando em ${file} está sem "data" ou "execute" — ignorado.`);
    }
  }
  logger.info(`${client.commands.size} comando(s) carregado(s).`);
}

async function loadEvents() {
  const eventsPath = path.join(__dirname, "events");
  const files = fs.readdirSync(eventsPath).filter((f) => f.endsWith(".js"));

  for (const file of files) {
    const mod = await import(pathToFileURL(path.join(eventsPath, file)).href);
    if (!mod.name || !mod.execute) {
      logger.warn(`Evento em ${file} está sem "name" ou "execute" — ignorado.`);
      continue;
    }
    if (mod.once) {
      client.once(mod.name, (...args) => mod.execute(...args));
    } else {
      client.on(mod.name, (...args) => mod.execute(...args));
    }
  }
  logger.info(`${files.length} handler(es) de evento carregado(s).`);
}

async function main() {
  await loadCommands();
  await loadEvents();
  await client.login(process.env.BOT_TOKEN);
}

main().catch((err) => {
  logger.error(`Falha ao iniciar o CraftBot: ${err?.stack || err}`);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  logger.error(`Rejeição não tratada: ${err?.stack || err}`);
});

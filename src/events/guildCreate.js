// guildCreate.js — disparado quando o bot entra em um novo servidor.
// Usado apenas para logar e checar o limite de servidores (aviso ao dono).

import { logger } from "../utils/logging.js";
import { checkServerLimit } from "../utils/serverLimitNotifier.js";

export const name = "guildCreate";
export const once = false;

export async function execute(guild) {
  logger.info(`CraftBot adicionado ao servidor "${guild.name}" (${guild.id}) — agora em ${guild.client.guilds.cache.size} servidor(es).`);
  await checkServerLimit(guild.client);
}

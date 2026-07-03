// ready.js — disparado uma vez quando o bot conecta com sucesso.

import { logger } from "../utils/logging.js";
import { checkServerLimit } from "../utils/serverLimitNotifier.js";

export const name = "ready";
export const once = true;

export async function execute(client) {
  logger.info(`CraftBot online como ${client.user.tag} — presente em ${client.guilds.cache.size} servidor(es).`);
  client.user.setPresence({
    activities: [{ name: "/ajuda | clãs de Minecraft" }],
    status: "online",
  });

  await checkServerLimit(client);
}

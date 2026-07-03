// serverLimitNotifier.js — avisa o dono do bot por DM quando o CraftBot se
// aproxima do limite de 100 servidores (limite para bots verificados no
// Discord). Isso NÃO é uma mensagem enviada a usuários/servidores — é um
// aviso interno ao próprio desenvolvedor do bot, disparado uma única vez.

import { logger } from "./logging.js";
import { getBotMeta, setBotMeta } from "../db.js";

const WARNING_THRESHOLD = 90;
const HARD_LIMIT = 100;
const META_KEY = "serverLimitWarningSent";

function buildWarningMessage(guildCount) {
  return (
    `⚠️ **Aviso do CraftBot**\n\n` +
    `O bot já está presente em **${guildCount} servidores**, se aproximando do ` +
    `limite de **${HARD_LIMIT} servidores** permitido para bots não verificados no Discord.\n\n` +
    `Para continuar crescendo sem interrupções, você precisa:\n` +
    `1️⃣ Criar uma **Team** no Discord Developer Portal (https://discord.com/developers/teams) e transferir a aplicação do bot para ela.\n` +
    `2️⃣ **Verificar seu e-mail** na conta Discord usada no Developer Portal.\n\n` +
    `Depois disso, você poderá solicitar a verificação do bot em ` +
    `https://support.discord.com/hc/articles/360040720412, o que remove o limite de 100 servidores.`
  );
}

/**
 * Verifica quantos servidores o bot está e, ao cruzar o limiar (90), envia
 * uma DM única ao dono da aplicação (ou aos membros da Team, se já houver
 * uma). Idempotente: usa bot_meta para nunca enviar duas vezes.
 */
export async function checkServerLimit(client) {
  const guildCount = client.guilds.cache.size;

  if (guildCount < WARNING_THRESHOLD) return;
  if (getBotMeta(META_KEY) === "true") return;

  try {
    await client.application?.fetch();
    const owner = client.application?.owner;
    if (!owner) {
      logger.warn("Não foi possível identificar o dono da aplicação para enviar o aviso de limite de servidores.");
      return;
    }

    const message = buildWarningMessage(guildCount);
    const recipients = owner.members
      ? [...owner.members.values()].map((m) => m.user)
      : [owner];

    for (const user of recipients) {
      await user.send(message).catch((err) => {
        logger.warn(`Não foi possível enviar DM de aviso de limite ao usuário ${user.id}: ${err?.message}`);
      });
    }

    setBotMeta(META_KEY, "true");
    logger.info(`Aviso de limite de servidores (${guildCount}/${HARD_LIMIT}) enviado ao(s) dono(s) da aplicação.`);
  } catch (err) {
    logger.error(`Falha ao verificar/enviar aviso de limite de servidores: ${err?.stack || err}`);
  }
}

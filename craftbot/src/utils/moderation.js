// moderation.js
// Moderação básica: remove spam e links suspeitos, sempre avisando
// publicamente o autor (nunca pune/bane sozinho). Se o comportamento
// insistir de forma grave, conta como violação para o abuseDetector.

import { isFeatureDisabled } from "../db.js";
import { logModeration } from "./logger.js";
import { reportSevereAbuse } from "./abuseDetector.js";

const LINK_REGEX = /(https?:\/\/|discord\.gg\/|www\.)\S+/i;
const ALLOWED_LINK_WHITELIST = []; // domínios liberados podem ser adicionados aqui futuramente

// Rastreamento simples de spam: mesmo usuário repetindo mensagens rápido.
const recentMessages = new Map(); // key: guildId:userId -> [{content, ts}]
const SPAM_WINDOW_MS = 7000;
const SPAM_REPEAT_THRESHOLD = 4;

function isSpam(guildId, userId, content) {
  const key = `${guildId}:${userId}`;
  const now = Date.now();
  const history = (recentMessages.get(key) || []).filter(
    (m) => now - m.ts < SPAM_WINDOW_MS
  );
  history.push({ content, ts: now });
  recentMessages.set(key, history);

  if (history.length >= SPAM_REPEAT_THRESHOLD) {
    const sameCount = history.filter((m) => m.content === content).length;
    return sameCount >= 3 || history.length >= SPAM_REPEAT_THRESHOLD;
  }
  return false;
}

function containsLink(content) {
  if (!LINK_REGEX.test(content)) return false;
  return !ALLOWED_LINK_WHITELIST.some((domain) => content.includes(domain));
}

/**
 * Chamado a cada mensagem recebida. Retorna true se a mensagem foi
 * moderada (removida).
 */
export async function handleModeration(message) {
  if (!message.guild || message.author.bot) return false;
  if (isFeatureDisabled(message.guild.id, "moderacao")) return false;

  const content = message.content || "";
  const spam = isSpam(message.guild.id, message.author.id, content);
  const link = containsLink(content);

  if (!spam && !link) return false;

  const reason = link
    ? "Link não permitido postado no chat"
    : "Comportamento de spam detectado (mensagens repetidas em sequência)";

  await message.delete().catch(() => {});

  const warning = await message.channel
    .send(
      `⚠️ ${message.author}, sua mensagem foi removida automaticamente. Motivo: **${reason}**.\n` +
        `Se acha que isso foi um engano, fale com um líder do clã usando \`/denunciar\`.`
    )
    .catch(() => null);

  if (warning) {
    setTimeout(() => warning.delete().catch(() => {}), 12000);
  }

  await logModeration(message.guild, {
    action: "Remoção automática",
    target: message.author,
    reason,
    color: 0xe67e22,
  });

  await reportSevereAbuse(message.guild, reason);

  return true;
}

// messageCreate.js — dispara a moderação básica (spam/links).
// Nunca lê/armazena o conteúdo além do necessário para detectar spam,
// e nada é retido após a checagem.

import { handleModeration } from "../utils/moderation.js";

export const name = "messageCreate";
export const once = false;

export async function execute(message) {
  await handleModeration(message);
}

// logging.js — logger simples de console para o processo do bot
// (não confundir com utils/logger.js, que registra logs de moderação
// dentro do Discord).

function timestamp() {
  return new Date().toISOString();
}

export const logger = {
  info: (msg) => console.log(`[${timestamp()}] [INFO] ${msg}`),
  warn: (msg) => console.warn(`[${timestamp()}] [WARN] ${msg}`),
  error: (msg) => console.error(`[${timestamp()}] [ERROR] ${msg}`),
};

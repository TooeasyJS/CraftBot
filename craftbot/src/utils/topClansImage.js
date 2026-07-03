// topClansImage.js
// Renderiza a imagem do ranking geral de clãs (/topclãs) usando @napi-rs/canvas.
// Mostra ícone do servidor, nome, tag e nº de membros. 5 clãs por página.

import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";

const CARD_HEIGHT = 110;
const WIDTH = 760;
const PADDING = 24;
const HEADER_HEIGHT = 90;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * @param {Array<{guild, clan, memberCount, rank}>} entries até 5 itens já paginados
 * @param {number} page número da página atual (1-indexed)
 * @param {number} totalPages total de páginas
 */
export async function renderTopClansPage(entries, page, totalPages) {
  const height = HEADER_HEIGHT + entries.length * (CARD_HEIGHT + 14) + PADDING;
  const canvas = createCanvas(WIDTH, height);
  const ctx = canvas.getContext("2d");

  // Fundo
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
  bgGradient.addColorStop(0, "#1b1032");
  bgGradient.addColorStop(1, "#0d0716");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, WIDTH, height);

  // Cabeçalho
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 34px sans-serif";
  ctx.fillText("🏆 Top Clãs — Ranking Geral", PADDING, 48);
  ctx.fillStyle = "#a89fc9";
  ctx.font = "20px sans-serif";
  ctx.fillText(`Página ${page} de ${totalPages}`, PADDING, 76);

  let y = HEADER_HEIGHT;
  for (const entry of entries) {
    const { guild, clan, memberCount, rank } = entry;

    // Cartão
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    roundRect(ctx, PADDING, y, WIDTH - PADDING * 2, CARD_HEIGHT, 18);
    ctx.fill();

    // Ícone do servidor
    const iconX = PADDING + 20;
    const iconY = y + CARD_HEIGHT / 2 - 35;
    const iconSize = 70;
    ctx.save();
    ctx.beginPath();
    ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    try {
      const iconUrl = guild.iconURL({ extension: "png", size: 128 });
      if (iconUrl) {
        const img = await loadImage(iconUrl);
        ctx.drawImage(img, iconX, iconY, iconSize, iconSize);
      } else {
        ctx.fillStyle = clan.color || "#5865F2";
        ctx.fillRect(iconX, iconY, iconSize, iconSize);
      }
    } catch {
      ctx.fillStyle = clan.color || "#5865F2";
      ctx.fillRect(iconX, iconY, iconSize, iconSize);
    }
    ctx.restore();

    // Posição no ranking
    ctx.fillStyle = "#f5c542";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText(`#${rank}`, iconX + iconSize + 24, y + 42);

    // Nome + tag
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText(`${clan.name} [${clan.tag}]`, iconX + iconSize + 80, y + 42);

    // Servidor + membros
    ctx.fillStyle = "#c7bfe6";
    ctx.font = "18px sans-serif";
    ctx.fillText(`${guild.name} · ${memberCount} membros`, iconX + iconSize + 80, y + 72);

    y += CARD_HEIGHT + 14;
  }

  return canvas.encode("png");
}

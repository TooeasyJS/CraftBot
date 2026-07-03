// /topclãs — ranking geral entre clãs de todos os servidores onde o bot
// está, por tamanho (nº de membros do servidor). Renderizado como imagem
// (canvas). Botões ◀ ▶, 5 por página. Cache atualizado a cada 1h.

import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
} from "discord.js";
import { getAllConfirmedClans } from "../db.js";
import { renderTopClansPage } from "../utils/topClansImage.js";

const PAGE_SIZE = 5;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora

let cache = { entries: null, expiresAt: 0 };

async function buildRankingEntries(client) {
  const clans = getAllConfirmedClans();

  const entries = [];
  for (const clan of clans) {
    const guild = client.guilds.cache.get(clan.guildId);
    if (!guild) continue; // bot não está mais nesse servidor
    entries.push({ guild, clan, memberCount: guild.memberCount });
  }

  entries.sort((a, b) => b.memberCount - a.memberCount);
  entries.forEach((entry, idx) => (entry.rank = idx + 1));
  return entries;
}

async function getCachedEntries(client) {
  const now = Date.now();
  if (!cache.entries || now > cache.expiresAt) {
    cache.entries = await buildRankingEntries(client);
    cache.expiresAt = now + CACHE_TTL_MS;
  }
  return cache.entries;
}

function buildRow(page, totalPages) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("topclas_prev")
      .setEmoji("◀")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page <= 1),
    new ButtonBuilder()
      .setCustomId("topclas_next")
      .setEmoji("▶")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page >= totalPages)
  );
}

async function renderPage(client, page) {
  const entries = await getCachedEntries(client);
  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const clamped = Math.min(Math.max(page, 1), totalPages);
  const pageEntries = entries.slice((clamped - 1) * PAGE_SIZE, clamped * PAGE_SIZE);

  const buffer = await renderTopClansPage(pageEntries, clamped, totalPages);
  return { buffer, page: clamped, totalPages };
}

export const data = new SlashCommandBuilder()
  .setName("topclas")
  .setDescription("Mostra o ranking geral de clãs entre todos os servidores");

export async function execute(interaction) {
  await interaction.deferReply();

  const { buffer, page, totalPages } = await renderPage(interaction.client, 1);
  const attachment = new AttachmentBuilder(buffer, { name: "topclas.png" });
  const row = buildRow(page, totalPages);

  const reply = await interaction.editReply({ files: [attachment], components: [row] });

  const collector = reply.createMessageComponentCollector({ time: 5 * 60 * 1000 });
  let currentPage = page;

  collector.on("collect", async (btn) => {
    if (btn.user.id !== interaction.user.id) {
      return btn.reply({ content: "Apenas quem executou o comando pode navegar.", ephemeral: true });
    }

    currentPage += btn.customId === "topclas_next" ? 1 : -1;
    const rendered = await renderPage(interaction.client, currentPage);
    currentPage = rendered.page;

    const newAttachment = new AttachmentBuilder(rendered.buffer, { name: "topclas.png" });
    await btn.update({
      files: [newAttachment],
      components: [buildRow(rendered.page, rendered.totalPages)],
    });
  });

  collector.on("end", () => {
    interaction.editReply({ components: [] }).catch(() => {});
  });
}

// permissions.js
// Helpers de permissão. Nada disso decide punições sozinho — sempre
// checa se quem está chamando é o dono do servidor ou possui o cargo
// de líder configurado em /setup.

import { getGuildConfig } from "../db.js";

export function isServerOwner(interaction) {
  return interaction.guild.ownerId === interaction.user.id;
}

export function isLeader(interaction) {
  if (isServerOwner(interaction)) return true;
  const cfg = getGuildConfig(interaction.guildId);
  if (!cfg.leaderRoleId) return false;
  return interaction.member.roles.cache.has(cfg.leaderRoleId);
}

export function isAdmin(interaction) {
  return (
    isServerOwner(interaction) ||
    interaction.member.permissions.has("ManageGuild")
  );
}

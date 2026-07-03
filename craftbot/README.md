# CraftBot

Bot de Discord multi-servidor em JavaScript (discord.js v14) para ajudar clãs de Minecraft — cadastro de clã, ranking, avisos, boas-vindas, moderação básica e ranking geral de clãs em imagem.

Feito exclusivamente com **slash commands** (`/comando`) e segue as [Diretrizes da Comunidade Discord](https://discord.com/guidelines) e a [Política de Desenvolvedores](https://support-dev.discord.com/hc/en-us/articles/8563934450327-Discord-Developer-Policy).

## Regras internas (nunca quebradas pelo bot)

- Nunca faz spam.
- Nunca pune sozinho sem confirmação de um líder.
- Nunca guarda mensagens privadas ou dados sensíveis.
- Dados de um clã nunca vazam para outro servidor (todo dado é isolado por `guildId`).
- Toda ação de moderação vai para o canal de log/avisos.
- Se detectar uso grave indevido, o bot avisa o motivo e sai sozinho do servidor (`guild.leave()`).
- O líder pode desativar qualquer função com `/desativar [função]`.

## Comandos (Etapa 1)

| Comando | Descrição |
| --- | --- |
| `/criar [nome] [tag] [cor]` | Cria o clã do servidor (apenas o dono). Preview com botões Editar/Confirmar. 1 clã por servidor. |
| `/deletarcla` | Apaga o clã, com confirmação dupla. |
| `/setup` | Define canal de boas-vindas, canal de avisos, IP do Minecraft e cargo de líder. |
| `/server` | Mostra o status do servidor de Minecraft. |
| `/sorteio` | Sorteia quem reagiu a uma mensagem. |
| `/addponto` / `/ranking` | Pontuação por servidor (apenas líderes adicionam). |
| `/aviso` | Envia um aviso oficial formatado (apenas líderes). |
| `/denunciar` | Reporta um problema aos líderes. |
| `/topclas` | Ranking geral de clãs entre servidores, renderizado em imagem, paginado. |
| `/regras` | Mostra as regras internas do bot. |
| `/ajuda` | Lista todos os comandos. |
| `/desativar [função]` | Ativa/desativa uma função do bot (apenas líderes). |

Boas-vindas automáticas e moderação básica (remoção de spam/links com aviso público) rodam em segundo plano.

## Configuração local (Replit)

1. Defina o secret `BOT_TOKEN` com o token do seu bot (Discord Developer Portal).
2. Instale as dependências: `pnpm install` (na raiz do monorepo).
3. Registre os slash commands:
   ```bash
   pnpm --filter @workspace/craftbot run deploy-commands
   ```
   Para testes rápidos em um único servidor, defina `DEV_GUILD_ID` antes de rodar o comando acima.
4. Inicie o bot:
   ```bash
   pnpm --filter @workspace/craftbot run start
   ```

## Deploy (GitHub + Railway)

1. Suba o código para um repositório no GitHub (o `.gitignore` já ignora `node_modules`, o banco SQLite local e `.env`).
2. Crie um novo projeto no [Railway](https://railway.app) apontando para o repositório.
3. Railway detecta o `Dockerfile` automaticamente via `railway.toml`.
4. Configure a variável de ambiente `BOT_TOKEN` no painel do Railway.
5. Rode `pnpm --filter @workspace/craftbot run deploy-commands` localmente (ou como job único) sempre que adicionar/alterar comandos.

## Banco de dados

Usa SQLite local (`better-sqlite3`), com uma linha por servidor (`guildId`) em cada tabela — garantindo isolamento total entre servidores. O arquivo fica em `data/craftbot.sqlite` (ignorado pelo Git).

## Estrutura

```
src/
  index.js              # ponto de entrada
  deploy-commands.js    # registro dos slash commands
  db.js                 # acesso ao SQLite
  commands/              # um arquivo por comando
  events/                 # ready, interactionCreate, messageCreate, guildMemberAdd
  utils/
    permissions.js        # checagens de dono/líder/admin
    logger.js             # log de moderação (Discord)
    logging.js            # log de console do processo
    moderation.js         # moderação básica (spam/links)
    abuseDetector.js       # detecção de uso grave indevido -> saída automática
    topClansImage.js       # renderização da imagem do /topclas
```

## Próxima etapa

A Etapa 2 (tickets, moderação avançada, XP, aplicações e economia) será desenvolvida em uma conversa separada, em arquivos próprios (`tickets.js`, `moderacao.js`, `xp.js`, `aplicacao.js`, `economia.js`).

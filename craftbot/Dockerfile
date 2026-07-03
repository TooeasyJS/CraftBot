FROM node:22-slim

WORKDIR /app

# @napi-rs/canvas baixa um binário pré-compilado; nenhuma dependência
# nativa de build é necessária (o storage usa o módulo nativo
# node:sqlite, sem compilação).
COPY package.json ./
RUN npm install --omit=dev

COPY src ./src

RUN mkdir -p data

ENV NODE_ENV=production

CMD ["node", "src/index.js"]

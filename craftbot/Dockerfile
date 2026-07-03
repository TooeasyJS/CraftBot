FROM node:20-slim

WORKDIR /app

# Dependências nativas necessárias para better-sqlite3
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json ./
RUN npm install --omit=dev

COPY src ./src

RUN mkdir -p data

ENV NODE_ENV=production

CMD ["node", "src/index.js"]

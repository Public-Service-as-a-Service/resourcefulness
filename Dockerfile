# Rådighet – självskattningsverktyg. Inga externa npm-beroenden:
# SQLite kommer från Nodes inbyggda modul node:sqlite.
FROM node:24-alpine

ENV NODE_ENV=production \
    PORT=3000 \
    DATABASE_PATH=/data/radighet.db

WORKDIR /app
COPY package.json ./
COPY src ./src

RUN mkdir -p /data && chown -R node:node /data
USER node

VOLUME ["/data"]
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1:3000/healthz || exit 1

CMD ["node", "--disable-warning=ExperimentalWarning", "src/server.js"]

FROM node:22-slim

WORKDIR /app

COPY package*.json ./

# Prisma's config reads DIRECT_URL at generate time; this placeholder is only
# for schema/client generation and is never used to connect to a database.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/* \
    && npm ci --omit=dev \
    && DIRECT_URL="postgresql://ci:ci@127.0.0.1:5432/ci" npx prisma generate

COPY prisma ./prisma
COPY src ./src

ENV NODE_ENV=production
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:5000/health/live').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

USER node

CMD ["npm", "start"]

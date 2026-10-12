# Сборка из корня репозитория: docker build -f apps/realtime/Dockerfile .
FROM node:22-alpine AS base
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
WORKDIR /repo

FROM base AS build
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm fetch
COPY . .
RUN pnpm install --offline --frozen-lockfile
RUN pnpm --filter @me/realtime build \
  && pnpm --filter @me/realtime deploy --prod --legacy /out

FROM node:22-alpine AS runtime
ENV NODE_ENV=production REALTIME_PORT=3001
WORKDIR /app
COPY --from=build --chown=node:node /out/node_modules ./node_modules
COPY --from=build --chown=node:node /out/package.json ./package.json
COPY --from=build --chown=node:node /repo/apps/realtime/dist ./dist
USER node
EXPOSE 3001
HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3001/health || exit 1
CMD ["node", "dist/index.js"]

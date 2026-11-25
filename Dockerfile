FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run check && npm test && npm run build && npm prune --omit=dev
FROM node:22-bookworm-slim
ENV NODE_ENV=production PORT=8080
WORKDIR /app
COPY --from=build --chown=node:node /app/package*.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/mock-relying-party-service ./mock-relying-party-service
COPY --from=build --chown=node:node /app/mock-relying-party-ui/public ./mock-relying-party-ui/public
USER node
EXPOSE 8080
CMD ["node","mock-relying-party-service/index.js"]

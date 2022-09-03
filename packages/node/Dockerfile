FROM node:18-alpine AS build-env

WORKDIR /app

COPY package*.json ./
COPY tsconfig.build.json ./
COPY packages ./packages/

RUN npm install && cd packages/node && npm run build && npm prune --production

FROM node:18-alpine
WORKDIR /app

RUN chown -R node:node /app

USER node

COPY --from=build-env /app/packages /app/packages
COPY --from=build-env /app/node_modules /app/node_modules

CMD ["node", "--max-old-space-size=8192", "/app/packages/node/dist/src/index.js"]

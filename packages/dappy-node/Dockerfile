FROM node:18-alpine AS build-env

WORKDIR /app

COPY . ./

RUN npm install && \
    npx lerna bootstrap && \
    npx lerna run build && \
    npx lerna run clean:node_modules && \
    npx lerna bootstrap -- --production

FROM node:18-alpine
WORKDIR /app

RUN chown -R node:node /app

USER node

COPY --from=build-env /app/packages/dappy-lookup /app/packages/dappy-lookup
COPY --from=build-env /app/packages/gossip /app/packages/gossip
COPY --from=build-env /app/packages/bees /app/packages/bees

COPY --from=build-env --chown=node:node /app/packages/dappy-node /app/packages/dappy-node

CMD ["node", "--max-old-space-size=8192", "/app/packages/dappy-node/dist/src/index.js"]

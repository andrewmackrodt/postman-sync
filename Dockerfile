################################################################################
# Stage 1 : Cache dependencies
################################################################################

FROM node:erbium-slim AS cache

COPY --chown=node:node packages/postman-sdk/package.json app/packages/postman-sdk/
COPY --chown=node:node packages/sync-client/package.json app/packages/sync-client/
COPY --chown=node:node lerna.json app/
COPY --chown=node:node package.json app/
COPY --chown=node:node yarn.lock app/

WORKDIR app

RUN yarn install

################################################################################
# Stage 2 : Build
################################################################################

FROM cache AS build

COPY --chown=node:node ./ ./

RUN yarn build

################################################################################
# Stage 3 : Package
################################################################################

FROM node:erbium-slim

COPY --from=build --chown=node:node app/build /opt/postman-sync/

WORKDIR opt/postman-sync

ENV NODE_ENV "production"

ENTRYPOINT ["node", "/opt/postman-sync/index"]

FROM node:24-slim@sha256:8cf9967ae9ba1e64089f853abac42b41f2af95ff3aa00d08c26e5f75714605d4 AS builder

WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

RUN corepack enable pnpm

RUN --mount=type=secret,id=NODE_AUTH_TOKEN sh -c \
    'npm config set //npm.pkg.github.com/:_authToken=$(cat /run/secrets/NODE_AUTH_TOKEN)'
RUN npm config set @navikt:registry=https://npm.pkg.github.com

COPY package.json pnpm-lock.json ./
RUN pnpm install --frozen-lockfile

COPY next.config.mjs tsconfig.json ./
COPY pages pages
COPY styles styles
COPY public public

RUN pnpm run build

FROM europe-north1-docker.pkg.dev/cgr-nav/pull-through/nav.no/node:24-slim AS runtime

WORKDIR /app

COPY --from=builder /app/.next/standalone /app
COPY --from=builder /app/public /app/public

EXPOSE 3000

ENV NODE_ENV=production

CMD ["server.js"]

FROM scratch AS export
COPY --from=builder /app/.next/static /
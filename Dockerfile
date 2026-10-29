FROM node:26@sha256:70f362c81649e14489b6de8ed57739f35cfb50e18ac4741cb73b20b267906972 AS builder

WORKDIR /app

RUN --mount=type=secret,id=NODE_AUTH_TOKEN sh -c \
    'npm config set //npm.pkg.github.com/:_authToken=$(cat /run/secrets/NODE_AUTH_TOKEN)'
RUN npm config set @navikt:registry=https://npm.pkg.github.com

COPY package.json package-lock.json ./
RUN npm ci

COPY next.config.mjs tsconfig.json ./
COPY pages pages
COPY styles styles
COPY public public

RUN npm run build

FROM gcr.io/distroless/nodejs26-debian13@sha256:9a8669ea19728bb0bfca45d5084e1e545896ba189d92b4c81a43fe71ab905e01 AS runtime

WORKDIR /app

COPY --from=builder /app/.next/standalone /app
COPY --from=builder /app/public /app/public

EXPOSE 3000

ENV NODE_ENV=production

CMD ["server.js"]

FROM scratch AS export
COPY --from=builder /app/.next/static /
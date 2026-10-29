FROM node:26@sha256:6c6f2679f5b655c7c6091a34b81372b5962ca9f25d897a501d613742f922567b AS builder

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

FROM gcr.io/distroless/nodejs26-debian13@sha256:fa81a7c62a5057f247e658d5a18af09a332742977a6ff8a89e455b85cff33266 AS runtime

WORKDIR /app

COPY --from=builder /app/.next/standalone /app
COPY --from=builder /app/public /app/public

EXPOSE 3000

ENV NODE_ENV=production

CMD ["server.js"]

FROM scratch AS export
COPY --from=builder /app/.next/static /
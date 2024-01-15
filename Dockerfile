FROM gcr.io/distroless/nodejs20-debian11@sha256:8cf9967ae9ba1e64089f853abac42b41f2af95ff3aa00d08c26e5f75714605d4

WORKDIR /app

COPY .next/standalone /app/
COPY public /app/public/

EXPOSE 3000

ENV NODE_ENV=production

CMD ["server.js"]
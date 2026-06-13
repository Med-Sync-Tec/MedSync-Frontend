# syntax=docker/dockerfile:1.7

# ---------- Stage 1: build ----------
FROM node:22-alpine AS build
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.5 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . . # NOSONAR

# Vite bakea las VITE_* en el bundle al hacer build.
# Estas llegan como --build-arg desde cloudbuild.yaml.
ARG VITE_API_BASE_URL # NOSONAR
ARG VITE_FIREBASE_API_KEY # NOSONAR
ARG VITE_FIREBASE_AUTH_DOMAIN # NOSONAR
ARG VITE_FIREBASE_PROJECT_ID # NOSONAR
ARG VITE_FIREBASE_APP_ID # NOSONAR

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY \
    VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN \
    VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID \
    VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID # NOSONAR

RUN pnpm build

# ---------- Stage 2: runtime ----------
FROM nginx:1.27-alpine AS runtime # NOSONAR

# nginx:alpine procesa automáticamente templates con envsubst desde /etc/nginx/templates/.
# Esto permite que Cloud Run inyecte $PORT en runtime.
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

COPY --from=build /app/dist /usr/share/nginx/html

# Cloud Run inyecta PORT=8080 por defecto.
ENV PORT=8080
EXPOSE 8080

# El entrypoint base de nginx:alpine ya corre envsubst sobre los templates.
CMD ["nginx", "-g", "daemon off;"]

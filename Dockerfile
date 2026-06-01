# syntax=docker/dockerfile:1.7

# ===== base =====
FROM node:20-slim AS base
WORKDIR /app
ENV CI=1

# ===== deps =====
FROM base AS deps
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# ===== dev =====
FROM base AS dev
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 8888
CMD ["npm", "run", "dev:netlify"]

# ===== build =====
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ===== prod =====
FROM nginx:1.27-alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

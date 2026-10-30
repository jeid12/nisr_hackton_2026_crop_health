# CropHealth EWS dashboard: static Next.js export served by nginx.
# Build from the frontend/ folder (docker compose does this for you).

# Stage 1: build the static site
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: serve it
FROM nginx:1.27-alpine
ENV PORT=8080 \
    API_BASE=""
COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY docker/40-config.sh /docker-entrypoint.d/40-config.sh
RUN chmod +x /docker-entrypoint.d/40-config.sh
COPY --from=build /app/out /usr/share/nginx/html
EXPOSE 8080

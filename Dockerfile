# ========== STAGE 1: Build ==========
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar dependencias primero (cache de capas)
COPY package*.json ./
RUN npm ci

# Copiar código y compilar
COPY . .
RUN npm run build

# ========== STAGE 2: Runtime ==========
FROM nginx:alpine

# Usuario no root (seguridad)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copiar build desde stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Configuración nginx para React Router
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# ========== STAGE 1: Build ==========
FROM node:18-alpine AS builder

WORKDIR /app

# Build args para variables de entorno de Vite
ARG VITE_API_DESPACHOS
ARG VITE_API_VENTAS
ENV VITE_API_DESPACHOS=$VITE_API_DESPACHOS
ENV VITE_API_VENTAS=$VITE_API_VENTAS

# Copiar dependencias primero (cache de capas)
COPY package*.json ./
RUN npm ci

# Copiar código y compilar
COPY . .
RUN npm run build

# ========== STAGE 2: Runtime ==========
FROM nginx:alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/dist /usr/share/nginx/html

RUN echo 'server { \
    listen 80; \
    location /api/ { \
        proxy_pass http://10.0.135.240:8081/api/; \
    } \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

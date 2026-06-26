# ========== STAGE 1: Build ==========
FROM node:18-alpine AS builder
WORKDIR /app
ARG VITE_API_DESPACHOS
ARG VITE_API_VENTAS
ENV VITE_API_DESPACHOS=$VITE_API_DESPACHOS
ENV VITE_API_VENTAS=$VITE_API_VENTAS
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ========== STAGE 2: Runtime ==========
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
RUN echo "server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files \$uri \$uri/ /index.html; \
    } \
    location /health { \
        return 200 'OK'; \
        add_header Content-Type text/plain; \
    } \
}" > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
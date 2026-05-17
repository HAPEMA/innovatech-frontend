# Innovatech Chile — Sistema de Despachos

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-nginx%3Aalpine-2496ED?style=flat-square&logo=docker&logoColor=white)
![nginx](https://img.shields.io/badge/nginx-proxy-009639?style=flat-square&logo=nginx&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white)
![AWS EC2](https://img.shields.io/badge/Deploy-AWS_EC2-FF9900?style=flat-square&logo=amazonaws&logoColor=white)

> Curso **ISY1101 DevOps** — DuocUC  
> Frontend del módulo de gestión de órdenes de despacho para Innovatech Chile.

---

## Descripción

Aplicación web para la gestión de órdenes de despacho y compras. Permite al equipo de logística:

- Consultar y administrar órdenes de despacho (crear, editar, eliminar, cerrar)
- Visualizar órdenes de compra pendientes de despacho y generar su despacho
- Registrar intentos de entrega y cerrar órdenes completadas

---

## Arquitectura

```
Internet
   │
   ▼
EC2 Pública (100.49.245.77)
┌──────────────────────────────────────┐
│  Docker container: nginx:alpine      │
│                                      │
│  Puerto 80                           │
│  ├── /          → dist/ (React SPA)  │
│  ├── /api-despachos/ → :8081/api/    │
│  └── /api-ventas/    → :8082/api/    │
└──────────────────┬───────────────────┘
                   │ Red privada VPC
                   ▼
          Backend Spring Boot
          10.0.135.240:8081  (Despachos)
          10.0.135.240:8082  (Ventas)
```

- **nginx** sirve el bundle estático de React en el puerto 80
- **nginx** actúa como proxy inverso hacia el backend en la red privada
- Las URLs del backend se **embeben en tiempo de build** mediante `ARG` de Docker y variables de entorno de Vite (`import.meta.env`)
- `src/config/api.js` centraliza todas las URLs para que los componentes nunca las hardcodeen

---

## Requisitos previos

| Herramienta | Versión mínima |
|---|---|
| Node.js | 18.x |
| npm | 9.x |
| Docker | 24.x |
| Git | 2.x |

---

## Variables de entorno

Las variables son **de build-time** (Vite las embebe en el bundle). No funcionan como variables de runtime de Docker.

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_DESPACHOS` | URL base del microservicio de despachos | `http://10.0.135.240:8081` |
| `VITE_API_VENTAS` | URL base del microservicio de ventas | `http://10.0.135.240:8082` |

### Para desarrollo local

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_DESPACHOS=http://localhost:8081
VITE_API_VENTAS=http://localhost:8082
```

> `.env` está en `.gitignore` — nunca lo subas al repositorio.

---

## Cómo correr localmente

```bash
# 1. Clonar el repositorio
git clone https://github.com/HAPEMA/innovatech-frontend.git
cd innovatech-frontend

# 2. Instalar dependencias
npm install

# 3. Crear el archivo de variables de entorno
cp .env.example .env   # editar con tus URLs locales

# 4. Iniciar el servidor de desarrollo
npm run dev
```

La app quedará disponible en `http://localhost:5173`

### Con Docker (build local)

```bash
docker build \
  --build-arg VITE_API_DESPACHOS=http://localhost:8081 \
  --build-arg VITE_API_VENTAS=http://localhost:8082 \
  -t innovatech-frontend:local .

docker run -p 8080:80 innovatech-frontend:local
```

La app quedará disponible en `http://localhost:8080`

---

## Pipeline CI/CD

El pipeline se activa automáticamente al hacer push a la rama **`deploy`**.

```
push → rama deploy
       │
       ▼
  GitHub Actions
       │
       ├── 1. Checkout del código
       │
       ├── 2. Login a Docker Hub
       │
       ├── 3. docker build (multi-stage)
       │       ├── Stage 1: node:18-alpine
       │       │   └── npm ci + vite build
       │       │       (con VITE_API_* como ARG)
       │       └── Stage 2: nginx:alpine
       │           └── copia dist/ + configura proxy
       │
       ├── 4. docker push → DockerHub
       │       └── hapema/innovatech-frontend:latest
       │
       └── 5. Deploy en EC2 vía SSH
               ├── docker pull :latest
               ├── docker stop/rm contenedor anterior
               └── docker run -d -p 80:80 --restart always
```

### Secrets de GitHub requeridos

| Secret | Descripción |
|---|---|
| `DOCKERHUB_USERNAME` | Usuario de Docker Hub |
| `DOCKERHUB_TOKEN` | Token de acceso de Docker Hub |
| `VITE_API_DESPACHOS` | URL del backend despachos (se embebe en build) |
| `VITE_API_VENTAS` | URL del backend ventas (se embebe en build) |
| `EC2_FRONTEND_HOST` | IP pública de la EC2 (`100.49.245.77`) |
| `EC2_SSH_KEY` | Llave privada SSH para conectarse a la EC2 |

---

## Notas de despliegue en AWS

- La EC2 debe tener el **puerto 80 abierto** en el Security Group (inbound TCP 0.0.0.0/0)
- El backend corre en una red **privada** (`10.0.135.240`) no expuesta a internet — el proxy de nginx es el único punto de entrada
- El contenedor se levanta con `--restart always`, por lo que sobrevive reinicios de la instancia
- Para forzar un nuevo deploy sin cambios de código, se puede re-ejecutar el workflow manualmente desde la pestaña **Actions** en GitHub

---

## Estructura del proyecto

```
innovatech-frontend/
├── .github/workflows/       # Pipeline CI/CD
│   └── deploy.yml
├── src/
│   ├── config/
│   │   └── api.js           # URLs centralizadas (usa import.meta.env)
│   ├── componentes/
│   │   ├── CrudAdmin/
│   │   │   ├── TableDespachos.jsx
│   │   │   ├── TableCompras.jsx
│   │   │   ├── FormDespacho.jsx
│   │   │   ├── FormCierreDespacho.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── CardComponent.jsx
│   │   │   └── SearchBar.jsx
│   │   └── Layouts/
│   │       ├── Navbar.jsx
│   │       ├── Footer.jsx
│   │       └── Reviews.jsx
│   └── Routes/
│       └── AppRoutes.jsx    # React Router v6
├── Dockerfile               # Multi-stage build
├── docker-compose.yml
└── vite.config.js
```

---

## URL de acceso

| Entorno | URL |
|---|---|
| Producción | http://100.49.245.77 |
| Desarrollo local | http://localhost:5173 |

---

*Proyecto académico — ISY1101 DevOps, DuocUC.*

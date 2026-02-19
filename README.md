# Rosario Central – Sistema de Membresías

API REST + panel web para gestión de socios, control de acceso al estadio, carnés QR, pagos de cuotas y auditoría. Node.js, Express, MongoDB.

## Requisitos

Node.js 18+, MongoDB, npm.

## Instalación

```bash
npm install
```

Crear `.env` (opcional; ver `.env.example`):

- `PORT`, `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV`
- Admin por defecto: `admin` / `admin123` (cambiar en producción)

Con MongoDB en marcha:

```bash
npm run dev
```

- Login: http://localhost:3000/login  
- Panel: http://localhost:3000  

## Comandos

| Comando | Uso |
|--------|-----|
| `npm run dev` | Servidor con recarga (nodemon) |
| `npm start` | Servidor producción |
| `npm test` | Tests Jest (health, auth) |
| `npm run test:integration` | Verificación completa (servidor debe estar arriba) |

## Endpoints útiles

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Estado app + DB (200 ok, 503 sin DB) |
| POST | `/api/auth/login` | Login → token |
| GET | `/api/socios` | Listar socios (paginado, `?q=`) |
| GET | `/api/access/:socioId` | Verificar acceso estadio |
| GET | `/api/access/logs` | Logs de accesos (paginado) |

Rutas de escritura y sensibles: cabecera `Authorization: Bearer <token>`.

## Estructura breve

- `public/` — Frontend (HTML, CSS, JS)
- `src/` — Backend (app, server, config, database, controllers, services, routes, models, middlewares)
- `__tests__/` — Tests Jest

Más mejoras y detalles en **MEJORAS.md**.

---

**Desarrollado por [ExeDevCentral](https://github.com/ExeDevCentral/Sistema-de-Gesti-n-de-Membres-as-de-Club-Deportivo)**

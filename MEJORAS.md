# Sugerencias de mejora – Sistema de Membresías Rosario Central

Resumen de mejoras recomendadas por área: seguridad, pruebas, experiencia de usuario, código y despliegue.

---

## 1. Seguridad

| Mejora | Descripción |
|--------|-------------|
| **Credenciales por entorno** | No dejar `admin`/`admin123` ni `JWT_SECRET` por defecto en producción. Usar variables de entorno y un `.env.example` (sin valores reales) para documentar qué hace falta. |
| **CORS** | En producción reemplazar `origin: '*'` por el dominio concreto del frontend (ej. `https://tu-app.com`). |
| **CSP** | `contentSecurityPolicy: false` está bien para desarrollo; en producción conviene activar Helmet CSP y ajustar directivas. |
| **Contraseña admin** | Crear el admin con hash bcrypt desde una variable (ej. `ADMIN_PASS`) en el primer arranque, nunca guardar la contraseña en claro. |
| **Sanitización en frontend** | Al mostrar datos en el DOM (nombre, motivo, etc.) asegurar que no se inyecte HTML; si más adelante usas plantillas, escapar siempre. |

---

## 2. Tests

| Mejora | Descripción |
|--------|-------------|
| **Tests automatizados** | Añadir Jest (o Mocha) para tests unitarios de servicios (socios, access, auth) e integración de rutas (supertest). |
| **Integrar verify_full_system.js** | Incluir el script en un script npm (ej. `npm run test:integration`) y documentarlo en el README. |
| **Tests E2E** | A largo plazo, considerar Playwright o Cypress para flujos críticos (login, verificación de acceso, pago). |

---

## 3. Experiencia de usuario (UX)

| Mejora | Descripción |
|--------|-------------|
| **Feedback de carga** | Mostrar spinners o mensajes “Cargando…” en listados (socios, logs) y al verificar acceso. |
| **Mensajes de error claros** | Sustituir `alert()` por mensajes en la propia página (toast o banner) y textos traducidos/amigables. |
| **Confirmaciones** | Mantener confirmación en acciones destructivas (baja, suspensión); opcionalmente usar modales en lugar de `confirm()`. |
| **Responsive** | Revisar tablas y formularios en móvil; el control de acceso en tablet/móvil puede ser prioritario. |
| **Accesibilidad** | Añadir `aria-label` en botones/iconos, contraste suficiente y navegación por teclado donde sea posible. |

---

## 4. Código y arquitectura

| Mejora | Descripción |
|--------|-------------|
| **Validación en createSocio** | Las rutas piden `categoria` en enum `['Activo','Vitalicio','Cadete']` pero el frontend envía “Rol (Jugador, DT, Hincha)”. Unificar: o ampliar el enum o mapear “Rol” a una categoría admitida. |
| **Consistencia fechaVencimientoCuota** | En el modelo es `Date`; en el servicio a veces se guarda como string (YYYY-MM-DD). Decidir un formato (por ejemplo siempre Date en BD) y usarlo en todo el backend. |
| **Carpeta api-turnos** | Si es una copia del proyecto, evitar duplicar código; usar un solo código base o convertirlo en paquete/microservicio si tiene otro propósito. |
| **Variables de entorno** | Añadir `.env.example` con claves vacías o placeholders (PORT, MONGODB_URI, JWT_SECRET, ADMIN_USER, ADMIN_PASS) para que cualquiera sepa qué configurar. |
| **Manejo de errores** | Centralizar mensajes y códigos HTTP en el middleware de errores; evitar enviar detalles internos al cliente en producción. |
| **Logs** | En producción usar un nivel de log (info/warn/error) y, si aplica, un formato estructurado (JSON) para facilitar análisis. |

---

## 5. Base de datos

| Mejora | Descripción |
|--------|-------------|
| **Índices** | Revisar consultas frecuentes (por estado, fecha de vencimiento, búsqueda por texto) y añadir índices compuestos si hace falta. |
| **Paginación en logs** | El límite de 100 en `getAccessLogs` está bien; exponer `limit` y `skip` (o `page`) por query para poder paginar desde el frontend. |
| **Backups** | Documentar o automatizar backups de MongoDB en entorno de producción. |

---

## 6. Frontend

| Mejora | Descripción |
|--------|-------------|
| **Estructura JS** | Separar en módulos o ficheros por dominio (auth, socios, access, logs) para mantener mejor el código. |
| **Reutilización** | Extraer funciones comunes (authFetch, mostrar mensaje, abrir/cerrar modal) a un pequeño “util” o módulo compartido. |
| **Estado** | Si la app crece, valorar un estado mínimo (objeto global o patrón simple) para token, usuario y datos de la página actual. |
| **Sin framework** | El proyecto funciona bien en vanilla JS; si más adelante se complica la UI, considerar Vue o React de forma gradual (por ejemplo solo en el panel de socios). |

---

## 7. Despliegue y DevOps

| Mejora | Descripción |
|--------|-------------|
| **.env en producción** | No subir `.env` a Git; usar variables de entorno del hosting o un gestor de secretos. |
| **Health check** | Exponer una ruta tipo `GET /health` que compruebe conexión a MongoDB y responda 200 para que un balanceador o PaaS compruebe que la app está viva. |
| **Scripts npm** | Incluir `npm run test` (y opcionalmente `npm run test:integration` con verify_full_system.js) en el README y en el flujo de integración. |
| **Documentación API** | Opcional: Swagger/OpenAPI para documentar y probar los endpoints desde el navegador. |

---

## Priorización sugerida

1. **Corto plazo:** `.env.example`, CORS y credenciales en producción, unificar categoría/rol en socios, feedback de carga en UI.  
2. **Medio plazo:** Tests con Jest/supertest, paginación de logs, mejorar mensajes de error en frontend.  
3. **Largo plazo:** Tests E2E, documentación OpenAPI, refactor del frontend si la funcionalidad sigue creciendo.

Si quieres, se puede bajar cualquiera de estos puntos a tareas concretas (por ejemplo “añadir ruta GET /health” o “crear .env.example con X variables”).

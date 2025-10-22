# ⚙️ Guía de Configuración - SecureShop VPN

Esta guía detalla todos los aspectos de configuración del proyecto.

---

## 📋 Tabla de Contenidos

- [Variables de Entorno](#variables-de-entorno)
- [Configuración de MercadoPago](#configuración-de-mercadopago)
- [Configuración de Servex](#configuración-de-servex)
- [Configuración de Base de Datos](#configuración-de-base-de-datos)
- [Configuración de Planes](#configuración-de-planes)
- [Configuración de Frontend](#configuración-de-frontend)
- [Troubleshooting](#troubleshooting)

---

## 🔐 Variables de Entorno

### Backend (.env)

El backend requiere un archivo `.env` en la carpeta `backend/`:

```env
# ==========================================
# CONFIGURACIÓN DEL SERVIDOR
# ==========================================

# Puerto donde se ejecutará el servidor
PORT=4000

# Entorno de ejecución (development o production)
NODE_ENV=production

# ==========================================
# SERVEX API
# ==========================================

# Tu API Key de Servex (formato: sx_xxxxxxxxxxxxxxxxxx)
SERVEX_API_KEY=sx_tu_api_key_real_aqui

# URL base de la API de Servex
SERVEX_BASE_URL=https://servex.ws/api

# Timeout en milisegundos para las peticiones a Servex
SERVEX_TIMEOUT=30000

# ==========================================
# MERCADOPAGO
# ==========================================

# Access Token de tu cuenta de MercadoPago
# Obténlo en: https://www.mercadopago.com.ar/developers
MP_ACCESS_TOKEN=APP-XXXXXXXXXXXXXXXX-XXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX-XXXXXXXXX

# Public Key de MercadoPago (para el frontend si es necesario)
MP_PUBLIC_KEY=APP_USR-XXXXXXXX-XXXXXX-XXXX-XXXX-XXXXXXXXXXXX

# URL base donde está desplegada tu aplicación (sin /api al final)
# Esta URL se usa para los redirects y webhooks
MP_WEBHOOK_URL=http://149.50.148.6

# Si usas dominio:
# MP_WEBHOOK_URL=https://tu-dominio.com

# ==========================================
# BASE DE DATOS
# ==========================================

# Ruta donde se guardará la base de datos SQLite
DATABASE_PATH=./database/secureshop.db

# ==========================================
# CORS (Cross-Origin Resource Sharing)
# ==========================================

# Origen permitido para las peticiones CORS
# En desarrollo: http://localhost:3000
# En producción: URL de tu frontend
CORS_ORIGIN=http://149.50.148.6

# Si usas dominio:
# CORS_ORIGIN=https://tu-dominio.com

# ==========================================
# RATE LIMITING
# ==========================================

# Ventana de tiempo en milisegundos (15 minutos = 900000)
RATE_LIMIT_WINDOW_MS=900000

# Máximo de peticiones permitidas en la ventana de tiempo
RATE_LIMIT_MAX_REQUESTS=100

# ==========================================
# LOGGING
# ==========================================

# Nivel de logging: info, warn, error, debug
LOG_LEVEL=info
```

### Frontend (.env)

El frontend requiere un archivo `.env` en la carpeta `frontend/`:

```env
# URL de la API backend
# En desarrollo con proxy de Vite, puedes usar solo /api
VITE_API_URL=/api

# En producción sin proxy:
# VITE_API_URL=http://149.50.148.6/api
# O con dominio:
# VITE_API_URL=https://tu-dominio.com/api
```

---

## 💳 Configuración de MercadoPago

### Paso 1: Crear Aplicación en MercadoPago

1. Ve a https://www.mercadopago.com.ar/developers
2. Inicia sesión con tu cuenta
3. Ve a **"Tus integraciones"**
4. Clic en **"Crear aplicación"**
5. Completa los datos:
   - **Nombre**: SecureShop VPN
   - **Descripción**: Tienda de cuentas VPN
   - **Categoría**: Servicios

### Paso 2: Obtener Credenciales

1. Dentro de tu aplicación, ve a **"Credenciales"**
2. Selecciona **"Credenciales de producción"** (o Testing para pruebas)
3. Copia:
   - **Access Token** → `MP_ACCESS_TOKEN`
   - **Public Key** → `MP_PUBLIC_KEY`

⚠️ **Importante**: 
- Las credenciales de **Testing** solo sirven para pruebas
- Para aceptar pagos reales, usa las de **Producción**
- Nunca compartas tus credenciales

### Paso 3: Configurar Webhook

1. En tu aplicación de MercadoPago, ve a **"Webhooks"**
2. Clic en **"Configurar notificaciones"**
3. Agrega la URL: `http://149.50.148.6/api/webhook`
   - O con dominio: `https://tu-dominio.com/api/webhook`
4. Selecciona el evento: **"Pagos"**
5. Guarda

**Verificar webhook**:
```bash
# MercadoPago enviará una petición GET de verificación
# Debes responder con 200 OK
curl http://tu-dominio.com/api/webhook
```

### Modo Sandbox (Pruebas)

Para probar sin dinero real:

1. Usa las credenciales de **Testing**
2. Crea usuarios de prueba en MercadoPago
3. Usa tarjetas de prueba: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/test/cards

**Tarjetas de prueba**:
- **Aprobada**: 5031 7557 3453 0604 (CVV: 123)
- **Rechazada**: 5031 4332 1540 6351
- **Pendiente**: 5031 4935 1842 6896

---

## 🔐 Configuración de Servex

### Paso 1: Obtener API Key

1. Inicia sesión en Servex: https://servex.ws
2. Si eres **Administrador**:
   - Ve a **Configuración** → **API Key**
3. Si eres **Revendedor**:
   - Clic en tu perfil → **API Key**
4. Copia la API Key (formato: `sx_xxxxxxxxxxxx`)
5. Pégala en `SERVEX_API_KEY` en tu `.env`

⚠️ **Importante**:
- La API Key da acceso completo a tu cuenta
- No la compartas ni la subas a Git
- Cada usuario/revendedor tiene su propia API Key

### Paso 2: Verificar Permisos

Tu API Key debe tener permisos para:
- ✅ Crear clientes (POST `/api/clients`)
- ✅ Listar categorías (GET `/api/categories`)
- ✅ Ver clientes (GET `/api/clients`)

### Paso 3: Configurar Categoría por Defecto

El sistema usa la primera categoría disponible. Para especificar una:

1. Lista las categorías disponibles:

```bash
curl -H "Authorization: Bearer tu_api_key" \
  https://servex.ws/api/categories
```

2. Modifica `src/services/tienda.service.ts` (línea ~180):

```typescript
// En lugar de:
const categoria = categorias[0];

// Usa:
const categoria = categorias.find(c => c.id === 123) || categorias[0];
```

### Documentación de Servex API

Ver archivo completo: `APIS-Servex.html` que ya tienes en el proyecto.

Endpoints principales:
- `POST /api/clients` - Crear cliente VPN
- `GET /api/categories` - Listar servidores/categorías
- `GET /api/clients` - Listar clientes
- `POST /api/clients/{id}/renew` - Renovar cliente

---

## 💾 Configuración de Base de Datos

### SQLite (Default)

El proyecto usa SQLite por defecto, no requiere instalación adicional.

**Ubicación**: `backend/database/secureshop.db`

**Crear manualmente** (opcional):
```bash
cd backend
mkdir -p database
chmod 755 database
```

### Tablas Creadas Automáticamente

Al iniciar el servidor, se crean:

1. **planes**
   - Almacena los planes VPN disponibles
   
2. **pagos**
   - Registra todas las transacciones
   - Guarda las credenciales de Servex

**Ver contenido**:
```bash
sqlite3 backend/database/secureshop.db

.tables
SELECT * FROM planes;
SELECT * FROM pagos;
.exit
```

### Backup Automático

Script de backup incluido en `docs/DEPLOYMENT.md`.

**Backup manual**:
```bash
cp backend/database/secureshop.db backup_$(date +%Y%m%d).db
```

---

## 💰 Configuración de Planes

### Planes por Defecto

Al iniciar por primera vez, se crean 4 planes:

```javascript
{
  nombre: 'Plan Básico',
  descripcion: 'Perfecto para uso personal',
  precio: 500,        // ARS
  dias: 30,
  connection_limit: 1,
  activo: true
}
```

### Modificar Planes

#### Opción 1: Editar código (antes del primer inicio)

Edita `backend/src/services/tienda.service.ts` línea ~23:

```typescript
const planesDefault = [
  {
    nombre: 'Mi Plan Personalizado',
    descripcion: 'Descripción',
    precio: 1000,
    dias: 60,
    connection_limit: 3,
    activo: true,
  },
  // ... más planes
];
```

#### Opción 2: Editar base de datos

```bash
sqlite3 backend/database/secureshop.db

# Ver planes actuales
SELECT * FROM planes;

# Actualizar un plan
UPDATE planes 
SET precio = 600, connection_limit = 2 
WHERE id = 1;

# Desactivar un plan
UPDATE planes SET activo = 0 WHERE id = 4;

# Agregar nuevo plan
INSERT INTO planes (nombre, descripcion, precio, dias, connection_limit, activo)
VALUES ('Plan Enterprise', 'Para empresas', 2000, 365, 10, 1);

.exit
```

Reiniciar servidor:
```bash
pm2 restart secureshop-api
```

### Campos de Plan

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | integer | ID único (auto-incrementado) |
| `nombre` | string | Nombre del plan (ej: "Plan Premium") |
| `descripcion` | string | Descripción corta |
| `precio` | number | Precio en ARS (pesos argentinos) |
| `dias` | integer | Duración en días (30, 60, 365, etc) |
| `connection_limit` | integer | Conexiones simultáneas permitidas |
| `activo` | boolean | Si está visible o no (1 = sí, 0 = no) |

---

## 🎨 Configuración de Frontend

### Colores del Tema

Edita `frontend/tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',   // Más claro
        100: '#dbeafe',
        // ...
        600: '#2563eb',  // Color principal
        // ...
        900: '#1e3a8a',  // Más oscuro
      },
    },
  },
}
```

### Logo y Favicon

1. Reemplaza `frontend/public/vite.svg` con tu logo
2. Actualiza `frontend/index.html`:

```html
<link rel="icon" type="image/png" href="/tu-logo.png" />
<title>Tu Nombre - Tienda VPN</title>
```

### Textos e Idioma

Todos los textos están en los componentes:

- **Header**: `frontend/src/pages/HomePage.tsx` línea ~97
- **Planes**: `frontend/src/components/PlanCard.tsx`
- **Checkout**: `frontend/src/components/CheckoutModal.tsx`
- **Éxito**: `frontend/src/pages/SuccessPage.tsx`

### URLs de Soporte

Edita `frontend/src/pages/SuccessPage.tsx` línea ~190:

```typescript
<p className="text-center text-gray-500 text-sm mt-6">
  ¿Necesitas ayuda? Contáctanos a tu-email@example.com
</p>
```

---

## 🐛 Troubleshooting

### Error: "No se encuentra el módulo"

**Problema**: Faltan dependencias

**Solución**:
```bash
cd backend  # o frontend
rm -rf node_modules package-lock.json
npm install
```

### Error: "Permission denied" en database/

**Problema**: Permisos insuficientes

**Solución**:
```bash
cd backend
chmod 755 database/
chmod 644 database/*.db
```

### Error: "CORS blocked"

**Problema**: Frontend y backend en diferentes orígenes

**Solución**: Verifica `CORS_ORIGIN` en backend/.env coincide con URL del frontend

### Pagos no se confirman automáticamente

**Problema**: Webhook no configurado o no llega

**Solución**:
1. Verifica webhook en MercadoPago
2. Verifica que la URL sea accesible públicamente
3. Revisa logs: `pm2 logs secureshop-api | grep Webhook`

### Cuenta VPN no se crea después del pago

**Problema**: Error en Servex API

**Solución**:
1. Verifica `SERVEX_API_KEY`
2. Revisa permisos de la API Key
3. Verifica logs: `pm2 logs secureshop-api | grep Servex`

---

## 📞 Soporte Técnico

### Logs Importantes

```bash
# Backend
pm2 logs secureshop-api

# Nginx
sudo tail -f /var/log/nginx/error.log

# Sistema
dmesg | tail
```

### Health Checks

```bash
# Backend funcionando
curl http://localhost:4000/health

# Servex API accesible
curl -H "Authorization: Bearer tu_api_key" \
  https://servex.ws/api/categories

# Base de datos accesible
sqlite3 backend/database/secureshop.db "SELECT COUNT(*) FROM planes;"
```

---

## ✅ Checklist de Configuración

- [ ] `.env` del backend configurado con todas las variables
- [ ] `.env` del frontend configurado
- [ ] Credenciales de MercadoPago obtenidas
- [ ] Webhook de MercadoPago configurado
- [ ] API Key de Servex obtenida y probada
- [ ] Planes configurados según necesidad
- [ ] Colores y textos personalizados
- [ ] Logo y favicon actualizados
- [ ] Emails de soporte actualizados
- [ ] Probado crear una compra de prueba end-to-end

---

**Última actualización**: Octubre 2025

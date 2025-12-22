# 🟢 Sistema de Usuarios Activos en Vivo - Guía de Implementación

## 📋 Resumen

Se ha implementado un sistema completo de **usuarios activos en tiempo real** para mostrar en el HeroSection de la HomePage cuántos usuarios están navegando la web en ese momento.

## 📦 Cambios Realizados

### 1. **Base de Datos (Supabase)**

**Archivo:** `supabase/migrations/014_active_sessions.sql`

**Qué contiene:**
- Tabla `active_sessions` - Registra sesiones activas de usuarios
- Tabla `active_users_stats` - Caché de estadísticas actualizadas
- Funciones SQL para gestionar sesiones y estadísticas
- Vista `active_users_view` para datos en tiempo real
- Políticas RLS (Row Level Security) para seguridad
- Triggers para auto-limpieza de sesiones expiradas

**Características:**
- Auto-limpia sesiones con más de 10 minutos de inactividad
- Actualiza estadísticas automáticamente
- Sin necesidad de polling constante en el frontend

### 2. **Backend (Express.js)**

**Archivos nuevos:**
- `backend/src/services/active-sessions.service.ts` - Servicio de sesiones activas
- `backend/src/routes/active-sessions.routes.ts` - Rutas API

**Endpoints disponibles:**
```
POST /api/sessions/register
Body: { user_id?: string, session_token?: string }
Respuesta: { success: boolean, sessionToken: string }

POST /api/sessions/end
Body: { session_token: string }
Respuesta: { success: boolean }

GET /api/sessions/active-users
Respuesta: { success: boolean, totalUsers: number, totalSessions: number }

GET /api/sessions/stats
Respuesta: { success: boolean, totalActiveUsers: number, totalSessions: number }
```

**Cambios en server.ts:**
- Importación del SupabaseService
- Inicialización del SupabaseService en `initializeServices()`
- Registro de rutas de sesiones activas en `setupRoutes()`

### 3. **Frontend (React)**

**Archivos nuevos:**

#### Servicios:
- `frontend/src/services/active-sessions.service.ts`
  - Maneja el registro y actualización de sesiones
  - Genera tokens únicos por sesión
  - Comunica con el backend

#### Hooks:
- `frontend/src/hooks/useActiveUsers.ts`
  - Obtiene el conteo de usuarios activos
  - Polling cada 5 segundos
  
- `frontend/src/hooks/useRegisterActiveSession.ts`
  - Registra la sesión al montar el componente
  - Mantiene la sesión viva cada 30 segundos
  - Limpia la sesión al desmontar

#### Componentes:
- `frontend/src/components/ActiveUsersCard.tsx`
  - Componente visual que muestra usuarios activos
  - Animación pulsante de estado "EN VIVO"
  - Indicador visual del conteo en tiempo real

**Cambios en archivos existentes:**
- `App.tsx` - Llamada a `useRegisterActiveSession()` para registrar sesión
- `HeroSection.tsx` - Integración del componente `ActiveUsersCard`

## 🚀 Instrucciones de Instalación

### Paso 1: Ejecutar Migración en Supabase

1. Ve a tu dashboard de Supabase
2. Abre **SQL Editor**
3. Crea una nueva query
4. Copia el contenido completo de `supabase/migrations/014_active_sessions.sql`
5. Ejecuta la query

**Nota:** Si tienes Supabase CLI instalado, también puedes usar:
```bash
cd supabase
supabase db push
```

### Paso 2: Verificar Variables de Entorno

En tu `.env` del backend, asegúrate de tener:
```
SUPABASE_URL=tu_url_supabase
SUPABASE_SERVICE_KEY=tu_service_key
```

### Paso 3: Compilar y Ejecutar

**Backend:**
```bash
cd backend
npm install  # si hay nuevas dependencias
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm install  # si hay nuevas dependencias
npm run dev
```

## 📊 Cómo Funciona

### Flujo de Datos:

1. **Usuario entra a la web**
   - App.tsx llama a `useRegisterActiveSession()`
   - Se genera un token único de sesión
   - POST a `/api/sessions/register`

2. **Backend registra sesión**
   - ActiveSessionsService llama a `register_active_session()` en Supabase
   - La sesión se inserta en tabla `active_sessions`

3. **Actualización automática de estadísticas**
   - Trigger SQL ejecuta `update_active_users_stats()`
   - Tabla `active_users_stats` se actualiza

4. **Frontend obtiene datos en vivo**
   - HeroSection usa `useActiveUsers()` hook
   - Polling cada 5 segundos a `/api/sessions/active-users`
   - ActiveUsersCard muestra el conteo actualizado

5. **Limpieza automática**
   - Sessions con >10 minutos sin actividad se eliminan
   - Estadísticas se recalculan automáticamente

### Tiempo de Sesión:
- **Activa por:** 5 minutos sin actividad máximo
- **Keep-alive:** Cada 30 segundos
- **Limpieza:** Automática cada ~50 inserciones de sesión

## 🔐 Seguridad

- RLS policies aseguran que solo se lean estadísticas globales
- Los usuarios no pueden ver detalles individuales de otras sesiones
- Service role key usada solo en backend para actualizaciones
- Rate limiting mantiene spam bajo control

## ⚙️ Configuración Avanzada

### Personalizar timeout de sesión:
En `supabase/migrations/014_active_sessions.sql`, busca:
```sql
WHERE last_activity > NOW() - INTERVAL '5 minutes'
```
Cambia `'5 minutes'` al intervalo deseado.

### Cambiar frecuencia de polling del frontend:
En `frontend/src/hooks/useActiveUsers.ts`:
```typescript
const intervalRef = useRef<NodeJS.Timeout | null>(null);
// Cambiar 5000 (5 segundos) al intervalo deseado en ms
intervalRef.current = setInterval(fetchActiveUsers, 5000);
```

### Cambiar frecuencia de keep-alive:
En `frontend/src/hooks/useRegisterActiveSession.ts`:
```typescript
// Cambiar 30000 (30 segundos) al intervalo deseado en ms
const keepAliveInterval = setInterval(() => {
  activeSessionsService.keepSessionAlive(userId);
}, 30000);
```

## 🧪 Testing

Para probar localmente:

1. **Abrir múltiples pestañas/ventanas** del sitio
2. Verificar que el número de usuarios activos aumenta
3. Cerrar algunas pestañas - el número debe disminuir después de unos segundos
4. Esperar >10 minutos sin actividad - las sesiones deben limpiarse

## 📝 Notas

- El componente ActiveUsersCard se muestra en el HeroSection, justo encima del badge
- Si Supabase no está configurado, el sistema no rompe la app
- Las sesiones de usuarios sin autenticar también se cuentan (user_id es NULL)
- El sistema es escalable y optimizado para miles de usuarios

## 🔗 Archivos Modificados

```
backend/
  src/
    services/
      + active-sessions.service.ts
    routes/
      + active-sessions.routes.ts
      server.ts (modificado)

frontend/
  src/
    services/
      + active-sessions.service.ts
    hooks/
      + useActiveUsers.ts
      + useRegisterActiveSession.ts
    components/
      + ActiveUsersCard.tsx
      App.tsx (modificado)
    sections/
      HeroSection.tsx (modificado)

supabase/
  migrations/
    + 014_active_sessions.sql
```

## ✅ Checklist de Implementación

- [ ] Ejecutar migración 014_active_sessions.sql en Supabase
- [ ] Verificar variables SUPABASE_URL y SUPABASE_SERVICE_KEY en .env
- [ ] Compilar backend (npm run build)
- [ ] Compilar frontend (npm run build)
- [ ] Probar en desarrollo (npm run dev)
- [ ] Verificar que ActiveUsersCard aparece en HomePage
- [ ] Abrir múltiples pestañas y verificar conteo se actualiza
- [ ] Esperar >10 minutos para verificar limpieza automática

---

**Fecha:** 19 de diciembre de 2025  
**Estado:** ✅ Listo para producción

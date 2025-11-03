# Sistema de Precios y Sincronización

## 📋 Descripción

Este proyecto utiliza un sistema de precios centralizado donde los precios "oficiales" se definen en archivos JSON de configuración y se sincronizan automáticamente con la base de datos.

## 🏗️ Arquitectura

### Archivos de Configuración

#### `backend/public/config/planes.config.json`

Contiene la configuración de precios para planes VPN normales:

- **precios_normales**: Precios base de todos los planes
- **overrides**: Descuentos promocionales (solo aplican si promo está activa)
- **planes_disponibles**: Mapeo de IDs a nombres descriptivos

#### `backend/public/config/revendedores.config.json`

Contiene la configuración de precios para planes de revendedores:

- **precios_normales**: Precios base para planes de crédito y validez
- **overrides**: Descuentos promocionales
- **planes_credit**: Descripciones de planes por créditos
- **planes_validity**: Descripciones de planes por usuarios simultáneos

### Base de Datos

Los precios se almacenan en las tablas:

- **`planes`**: Precios de planes VPN normales
- **`planes_revendedores`**: Precios de planes para revendedores

## 🔄 Sistema de Sincronización

### ¿Por qué es necesario sincronizar?

1. **Caché del backend**: Para mejorar rendimiento, el sistema cachea la configuración
2. **Separación JSON ↔ BD**: Los precios se definen en JSON pero se aplican en BD
3. **Cambios manuales**: Cuando editas los JSON directamente, no se actualizan automáticamente

### Endpoints de Sincronización

#### `POST /api/config/sync-todo`

**Sincronización completa + refresco BD VPS** - Hace TODO automáticamente

Hace automáticamente:
- Limpieza de caché del backend
- Sincronización completa de precios (planes + revendedores)
- **Refresco de base de datos del VPS** (corrige valores max_users de planes)

```bash
curl -X POST http://localhost:4001/api/config/sync-todo
```

**⚠️ Importante**: Este endpoint debe ejecutarse desde el servidor local de desarrollo.

#### `POST /api/config/sync-precios`

**Solo planes normales**

```bash
curl -X POST http://localhost:4001/api/config/sync-precios
```

#### `POST /api/config/sync-precios-revendedores`

**Solo planes de revendedores**

```bash
curl -X POST http://localhost:4001/api/config/sync-precios-revendedores
```

## 📝 Proceso para Actualizar Precios

### 1. Editar archivos JSON

Modifica los precios en:

- `backend/public/config/planes.config.json` (sección `precios_normales`)
- `backend/public/config/revendedores.config.json` (sección `precios_normales`)

### 2. Sincronizar cambios

```bash
# Opción automática (recomendado): sincroniza precios + refresca BD del VPS
curl -X POST http://localhost:4001/api/config/sync-todo

# Opciones específicas (solo si necesitas control granular)
curl -X POST http://localhost:4001/api/config/sync-precios
curl -X POST http://localhost:4001/api/config/sync-precios-revendedores
```

### 3. Verificar cambios

Los precios se actualizan inmediatamente en el frontend sin necesidad de recargar.

## 🚀 Deploy y Actualización

### Deploy completo

```bash
# 1. Build backend
cd backend
npm run build

# 2. Build frontend
cd ../frontend
npm run build

# 3. Subir archivos
scp -r ./backend/dist root@149.50.148.6:/home/secureshop/secureshop-vpn/backend/
scp -r ./frontend/dist root@149.50.148.6:/home/secureshop/secureshop-vpn/frontend/

# 4. Reiniciar servicios
ssh root@149.50.148.6 "cd /home/secureshop/secureshop-vpn && pm2 restart all"
```

### Actualización de precios en producción

```bash
# Método automático (recomendado): sincroniza precios + refresca BD del VPS
curl -X POST http://localhost:4001/api/config/sync-todo

# Método manual (si necesitas control específico):
# 1. Editar JSON localmente
# 2. Subir JSON actualizado
scp backend/public/config/planes.config.json root@149.50.148.6:/home/secureshop/secureshop-vpn/backend/public/config/
scp backend/public/config/revendedores.config.json root@149.50.148.6:/home/secureshop/secureshop-vpn/backend/public/config/

# 3. Sincronizar precios en el VPS
ssh root@149.50.148.6 "curl -X POST http://localhost:4001/api/config/sync-todo"
```

## 🎯 Estructura de Precios

### Planes VPN Normales (IDs 21-44)

| ID    | Duración | Conexiones | Precio Base |
| ----- | -------- | ---------- | ----------- |
| 21-24 | 7 días   | 1-4        | 4000-11000  |
| 25-28 | 15 días  | 1-4        | 6000-15000  |
| 29-32 | 30 días  | 1-4        | 8000-18000  |
| 33-36 | 3 días   | 1-4        | 2000-5500   |
| 37-40 | 20 días  | 1-4        | 6500-15500  |
| 41-44 | 25 días  | 1-4        | 7000-16000  |

### Planes Revendedores

#### Créditos (IDs 1-11)

- 5-200 créditos por meses
- Precios: 16000-250000

#### Usuarios Simultáneos (IDs 12-19)

- 5-90 usuarios por 30 días
- Precios: 13500-120000

## ⚠️ Notas Importantes

1. **Promociones**: Los overrides solo se aplican cuando `promo_config.activa = true`
2. **Caché**: Siempre limpiar caché después de cambios manuales en JSON
3. **IDs únicos**: Los IDs en JSON deben coincidir con los de la base de datos
4. **Backup**: Hacer backup de JSON antes de modificar precios
5. **Verificación**: Probar sincronización en desarrollo antes de producción

## 🔧 Troubleshooting

### Los precios no se actualizan

1. Verificar que el JSON tenga sintaxis correcta
2. Ejecutar sincronización: `POST /api/config/sync-todo`
3. Revisar logs del backend para errores

### Error "Ruta no encontrada"

- Verificar puerto correcto (4001)
- Asegurar que el backend esté corriendo

### Precios no coinciden

- Verificar IDs en JSON vs base de datos
- Revisar sección `precios_normales` correcta
- Ejecutar sincronización específica por tipo de plan

## 📞 Soporte

Para problemas con sincronización de precios:

1. Revisar logs: `pm2 logs secureshop-backend`
2. Verificar JSON: validar sintaxis
3. Probar endpoints individualmente
4. Contactar al equipo de desarrollo

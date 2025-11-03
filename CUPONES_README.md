# 🏷️ Sistema de Cupones de Descuento - SecureShop VPN

## 📋 Descripción General

Implementación completa de un sistema de cupones de descuento para SecureShop VPN con las siguientes características:

- ✅ **Cupones con límite de uso** (control de cuántas veces se puede usar)
- ⏰ **Cupones con expiración** (fecha límite automática)
- 🎯 **Tipos de descuento**: Porcentaje y monto fijo
- 🎫 **Aplicación selectiva**: Todos los planes o planes específicos
- 🔒 **Validación server-side** y seguridad robusta

## 🏗️ Arquitectura del Sistema

### Base de Datos
```sql
CREATE TABLE cupones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  tipo ENUM('porcentaje', 'monto_fijo') NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  limite_uso INT DEFAULT NULL,
  usos_actuales INT DEFAULT 0,
  fecha_expiracion DATETIME,
  activo BOOLEAN DEFAULT TRUE,
  planes_aplicables JSON,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### API Endpoints
- `POST /api/cupones` - Crear cupón
- `GET /api/cupones` - Listar cupones (admin)
- `POST /api/cupones/validar` - Validar cupón
- `POST /api/cupones/aplicar` - Aplicar cupón a compra
- `PUT /api/cupones/:id` - Editar cupón
- `DELETE /api/cupones/:id` - Desactivar cupón

---

## 📅 Fases de Implementación

### 🔥 FASE 1: Base de Datos y API Básica
**Estado:** 🔄 EN PROGRESO
**Tiempo estimado:** 2-3 horas

#### ✅ Tareas Completadas:
- [ ] Diseño del esquema de base de datos
- [ ] Creación de tabla `cupones`
- [ ] Servicio básico de cupones (`cupones.service.ts`)
- [ ] Rutas básicas de cupones (`cupones.routes.ts`)
- [ ] Endpoint de validación de cupones
- [ ] Tests básicos de funcionamiento

#### 📝 Pasos Detallados - Fase 1:

##### 1.1 Crear Tabla en Base de Datos
```sql
-- Ejecutar en MySQL/MariaDB
CREATE TABLE cupones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  tipo ENUM('porcentaje', 'monto_fijo') NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  limite_uso INT DEFAULT NULL,
  usos_actuales INT DEFAULT 0,
  fecha_expiracion DATETIME,
  activo BOOLEAN DEFAULT TRUE,
  planes_aplicables JSON,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_codigo (codigo),
  INDEX idx_activo (activo),
  INDEX idx_fecha_expiracion (fecha_expiracion)
);
```

##### 1.2 Crear Servicio de Cupones
**Archivo:** `backend/src/services/cupones.service.ts`

```typescript
import { databaseService } from './database.service';

export interface Cupon {
  id?: number;
  codigo: string;
  tipo: 'porcentaje' | 'monto_fijo';
  valor: number;
  limite_uso?: number;
  usos_actuales?: number;
  fecha_expiracion?: Date;
  activo?: boolean;
  planes_aplicables?: number[];
}

export class CuponesService {
  // Métodos CRUD básicos
  async crearCupon(cupon: Omit<Cupon, 'id'>): Promise<Cupon> {
    // Implementación
  }

  async obtenerCuponPorCodigo(codigo: string): Promise<Cupon | null> {
    // Implementación
  }

  async validarCupon(codigo: string, planId?: number): Promise<{
    valido: boolean;
    descuento?: number;
    mensaje?: string;
    cupon?: Cupon;
  }> {
    // Implementación
  }

  async incrementarUso(cuponId: number): Promise<void> {
    // Implementación
  }
}
```

##### 1.3 Crear Rutas de Cupones
**Archivo:** `backend/src/routes/cupones.routes.ts`

```typescript
import express from 'express';
import { cuponesService } from '../services/cupones.service';

const router = express.Router();

// POST /api/cupones/validar
router.post('/validar', async (req, res) => {
  // Validar cupón
});

// POST /api/cupones/aplicar
router.post('/aplicar', async (req, res) => {
  // Aplicar cupón a compra
});

// POST /api/cupones (admin)
router.post('/', async (req, res) => {
  // Crear cupón
});

// GET /api/cupones (admin)
router.get('/', async (req, res) => {
  // Listar cupones
});

export default router;
```

##### 1.4 Integrar Rutas en el Servidor
**Archivo:** `backend/src/server.ts`
```typescript
import cuponesRoutes from './routes/cupones.routes';

// Agregar después de las otras rutas
app.use('/api/cupones', cuponesRoutes);
```

##### 1.5 Testing Básico
```bash
# Crear cupón de prueba
curl -X POST http://localhost:4001/api/cupones \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "TEST20",
    "tipo": "porcentaje",
    "valor": 20,
    "limite_uso": 100,
    "fecha_expiracion": "2025-12-31T23:59:59Z"
  }'

# Validar cupón
curl -X POST http://localhost:4001/api/cupones/validar \
  -H "Content-Type: application/json" \
  -d '{"codigo": "TEST20"}'
```

---

### 🚀 FASE 2: Integración con Compras
**Estado:** ⏳ PENDIENTE
**Tiempo estimado:** 2-3 horas

#### 📝 Pasos Detallados - Fase 2:

##### 2.1 Modificar Tabla de Compras
```sql
ALTER TABLE compras ADD COLUMN cupon_usado VARCHAR(50);
ALTER TABLE compras ADD COLUMN descuento_aplicado DECIMAL(10,2) DEFAULT 0;
```

##### 2.2 Actualizar Servicio de Compras
**Archivo:** `backend/src/services/tienda.service.ts`
- Agregar validación de cupón antes del pago
- Aplicar descuento al total
- Registrar cupón usado en la compra

##### 2.3 Modificar Endpoint de Compra
**Archivo:** `backend/src/routes/tienda.routes.ts`
```typescript
// POST /api/comprar-plan
router.post('/comprar-plan', async (req, res) => {
  const { planId, cupon } = req.body;

  // Validar cupón si se proporciona
  if (cupon) {
    const validacion = await cuponesService.validarCupon(cupon, planId);
    if (!validacion.valido) {
      return res.status(400).json({ error: validacion.mensaje });
    }
    // Aplicar descuento...
  }
  // Continuar con la compra...
});
```

---

### 🎨 FASE 3: Frontend - Componente de Cupón
**Estado:** ⏳ PENDIENTE
**Tiempo estimado:** 3-4 horas

#### 📝 Pasos Detallados - Fase 3:

##### 3.1 Crear Componente CuponInput
**Archivo:** `frontend/src/components/CuponInput.tsx`
```typescript
interface CuponInputProps {
  onCuponValidado: (descuento: number, cupon: string) => void;
  onCuponError: (mensaje: string) => void;
  planId?: number;
}

export function CuponInput({ onCuponValidado, onCuponError, planId }: CuponInputProps) {
  // Implementación del componente
}
```

##### 3.2 Integrar en CheckoutModal
**Archivo:** `frontend/src/components/CheckoutModal.tsx`
- Agregar sección de cupón
- Mostrar descuento aplicado
- Actualizar total dinámicamente

##### 3.3 Servicio de Cupones en Frontend
**Archivo:** `frontend/src/services/cupones.service.ts`
```typescript
export const cuponesService = {
  validarCupon: async (codigo: string, planId?: number) => {
    // Llamada a API
  },
};
```

---

### 👑 FASE 4: Dashboard Admin
**Estado:** ⏳ PENDIENTE
**Tiempo estimado:** 4-5 horas

#### 📝 Pasos Detallados - Fase 4:

##### 4.1 Página de Gestión de Cupones
**Archivo:** `frontend/src/pages/admin/CuponesPage.tsx`
- Listado de cupones
- Crear/editar cupones
- Estadísticas de uso

##### 4.2 API Endpoints Admin
```typescript
// PUT /api/cupones/:id
// DELETE /api/cupones/:id
// GET /api/cupones/estadisticas
```

---

## 🧪 Testing y Validación

### Casos de Prueba
- ✅ Cupón válido con límite de uso
- ✅ Cupón expirado
- ✅ Cupón sin usos disponibles
- ✅ Cupón no aplicable al plan
- ✅ Cupón inactivo
- ✅ Aplicación correcta del descuento
- ✅ Registro del uso del cupón

### Comandos de Testing
```bash
# Validar cupón
curl -X POST http://localhost:4001/api/cupones/validar \
  -H "Content-Type: application/json" \
  -d '{"codigo": "TEST20", "planId": 29}'

# Crear cupón
curl -X POST http://localhost:4001/api/cupones \
  -H "Content-Type: application/json" \
  -d '{"codigo": "BLACKFRIDAY", "tipo": "porcentaje", "valor": 30, "limite_uso": 500}'

# Verificar uso del cupón
curl http://localhost:4001/api/cupones/estadisticas
```

---

## 🔒 Consideraciones de Seguridad

- ✅ **Validación server-side**: Nunca confiar en frontend
- ✅ **Prevención de uso múltiple**: Control de concurrencia
- ✅ **Logs de auditoría**: Registro de todos los usos
- ✅ **Rate limiting**: Limitar intentos de validación
- ✅ **Sanitización**: Validar entrada de datos

---

## 📊 Métricas y Analytics

### KPIs a Trackear:
- Conversión con cupón vs sin cupón
- Uso promedio por cupón
- Revenue generado por cupones
- Tasa de abandono en checkout con cupón

### Reportes:
- Cupones más usados
- Revenue por tipo de descuento
- Efectividad de campañas promocionales

---

## 🚀 Deploy y Producción

### Checklist Pre-Deploy:
- [ ] Tabla `cupones` creada en producción
- [ ] Tests de integración pasan
- [ ] Validación de cupones funciona
- [ ] Logs de error configurados
- [ ] Rate limiting activo

### Post-Deploy:
- [ ] Crear cupones iniciales
- [ ] Configurar monitoring
- [ ] Documentar para soporte
- [ ] Training del equipo

---

## 🎯 Próximos Pasos

### Inmediatos (Esta sesión):
1. ✅ Crear tabla `cupones` en base de datos
2. 🔄 Implementar `cupones.service.ts`
3. 🔄 Crear rutas básicas `/api/cupones/validar`
4. 🔄 Testing básico de funcionamiento

### Siguientes Sesiones:
1. Integración con sistema de compras
2. Componente frontend de cupón
3. Dashboard admin para gestión
4. Analytics y reportes

---

## 📞 Contactos y Soporte

**Desarrollador:** GitHub Copilot
**Proyecto:** SecureShop VPN
**Versión:** 1.0.0
**Fecha:** Noviembre 2025

---

*README generado automáticamente - Sistema de Cupones v1.0*
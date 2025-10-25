# 🚀 Sistema de Configuración Dinámica - Guía de Uso

## Resumen
El sistema permite modificar **precios de planes** y **mostrar promociones** sin tocar código ni base de datos. Todo se configura en un archivo JSON.

## Archivos Principales

```
backend/public/config/planes.config.json    ← Archivo de configuración maestro
backend/src/services/config.service.ts      ← Servicio que lee y cachea el config
frontend/src/hooks/useHeroConfig.ts         ← Hook que obtiene config desde API
frontend/src/pages/PlanesPage.tsx           ← Página que usa el config
```

## Ubicación del Archivo en VPS

```
/home/secureshop/secureshop-vpn/backend/public/config/planes.config.json
```

## Estructura del Archivo de Configuración

```json
{
  "enabled": true,                          // Activar/desactivar todo el sistema
  "version": "1.0.0",
  "hero": {
    "titulo": "Tu título aquí",             // Personalizar h1 del hero
    "descripcion": "Tu descripción aquí",   // Personalizar párrafo del hero
    "promocion": {
      "habilitada": true,                   // Mostrar/ocultar banner
      "texto": "Tu promoción aquí",         // Texto del banner
      "bgColor": "bg-gradient-to-r from-red-600 to-pink-600",  // Fondo
      "textColor": "text-white"             // Color texto
    }
  },
  "overrides": {
    "21": { "precio": 1500 },               // Plan ID 21: nuevo precio 1500
    "22": { "precio": 2500 },               // Plan ID 22: nuevo precio 2500
    ...
  }
}
```

## Casos de Uso

### 1️⃣ Activar una Promoción de 50% OFF

Cambiar en el archivo:
```json
{
  "enabled": true,
  "hero": {
    "promocion": {
      "habilitada": true,
      "texto": "🎉 PROMOCIÓN ESPECIAL - 50% OFF EN TODOS LOS PLANES",
      "bgColor": "bg-gradient-to-r from-red-600 to-pink-600"
    }
  },
  "overrides": {
    "21": { "precio": 1500 },    // De 3000 a 1500 (50% OFF)
    "22": { "precio": 2500 },    // De 5000 a 2500 (50% OFF)
    "23": { "precio": 3500 },    // De 7000 a 3500 (50% OFF)
    "24": { "precio": 4500 },    // De 9000 a 4500 (50% OFF)
    "25": { "precio": 2250 },    // De 4500 a 2250 (50% OFF)
    "26": { "precio": 3500 },    // De 7000 a 3500 (50% OFF)
    "27": { "precio": 5000 },    // De 10000 a 5000 (50% OFF)
    "28": { "precio": 6000 },    // De 12000 a 6000 (50% OFF)
    "29": { "precio": 3000 },    // De 6000 a 3000 (50% OFF)
    "30": { "precio": 5000 },    // De 10000 a 5000 (50% OFF)
    "31": { "precio": 6000 },    // De 12000 a 6000 (50% OFF)
    "32": { "precio": 7500 }     // De 15000 a 7500 (50% OFF)
  }
}
```

### 2️⃣ Cambiar Solo el Mensaje del Hero

```json
{
  "hero": {
    "titulo": "Conecta Seguro Ahora",
    "descripcion": "VPN rápida, confiable y segura para tu privacidad digital"
  }
}
```

### 3️⃣ Desactivar la Promoción

```json
{
  "hero": {
    "promocion": {
      "habilitada": false
    }
  }
}
```

### 4️⃣ Cambiar Descuentos Puntuales

Solo cambiar precio de un plan:
```json
{
  "overrides": {
    "29": { "precio": 5000 }  // Plan 30 días Básico: de 6000 a 5000
  }
}
```

### 5️⃣ Diferentes Colores de Banner

Opciones de Tailwind CSS:
```json
{
  "hero": {
    "promocion": {
      "habilitada": true,
      "texto": "🎯 OFERTA LIMITADA - 30% DESCUENTO",
      "bgColor": "bg-gradient-to-r from-blue-600 to-cyan-600",
      "textColor": "text-white"
    }
  }
}
```

## IDs de Planes (Plan ID → Nombre)

| ID | Nombre | Duración | Dispositivos |
|----|--------|----------|--------------|
| 21 | Plan Básico 7D | 7 días | 1 |
| 22 | Plan Doble 7D | 7 días | 2 |
| 23 | Plan Triple 7D | 7 días | 3 |
| 24 | Plan Familiar 7D | 7 días | 4 |
| 25 | Plan Básico 15D | 15 días | 1 |
| 26 | Plan Doble 15D | 15 días | 2 |
| 27 | Plan Triple 15D | 15 días | 3 |
| 28 | Plan Familiar 15D | 15 días | 4 |
| 29 | Plan Básico 30D | 30 días | 1 |
| 30 | Plan Doble 30D | 30 días | 2 |
| 31 | Plan Triple 30D | 30 días | 3 |
| 32 | Plan Familiar 30D | 30 días | 4 |

## Precios Originales (Antes de Descuentos)

```
Plan 7D (Básico): $3.000
Plan 7D (Doble): $5.000
Plan 7D (Triple): $7.000
Plan 7D (Familiar): $9.000

Plan 15D (Básico): $4.500
Plan 15D (Doble): $7.000
Plan 15D (Triple): $10.000
Plan 15D (Familiar): $12.000

Plan 30D (Básico): $6.000
Plan 30D (Doble): $10.000
Plan 30D (Triple): $12.000
Plan 30D (Familiar): $15.000
```

## Cómo Aplicar los Cambios

### Opción 1: Automático (Esperar 60 segundos)
1. Edita el archivo `planes.config.json`
2. Espera 60 segundos
3. Los cambios se aplican automáticamente (el cache se refresca)

### Opción 2: Inmediato (Forzar recarga)
```bash
curl -X POST http://149.50.148.6:4000/api/config/reload
```

### Verificar que los cambios se aplicaron
```bash
# Ver configuración actual
curl http://149.50.148.6:4000/api/config/info

# Ver hero config
curl http://149.50.148.6:4000/api/config/hero

# Ver planes con precios actuales
curl http://149.50.148.6:4000/api/planes
```

## ¿Qué pasa en el Sistema?

### Frontend
1. Al cargar `PlanesPage`, se ejecuta el hook `useHeroConfig()`
2. Este hook hace `GET /api/config/hero`
3. El banner de promoción se muestra si `promocion.habilitada === true`
4. El título y descripción se actualizar con los valores del config
5. El componente se renderiza con los datos dinámicos

### Backend
1. Al hacer `GET /api/planes`, el servicio lee la configuración
2. Aplica los `overrides` de precios a cada plan
3. Devuelve al frontend los precios ya actualizados
4. El usuario ve los precios con descuento en la UI

### MercadoPago
1. Cuando el usuario compra un plan, se recalcula el precio con overrides
2. Se envía a MercadoPago el precio correctamente descontado
3. Se garantiza que el usuario pague el precio promocional

## Flujo Completo de una Compra con Promoción

```
1. Usuario accede a https://secureshop.com/planes
   ↓
2. Frontend carga y llama GET /api/config/hero
   ↓
3. Backend devuelve: { habilitada: true, texto: "50% OFF", ... }
   ↓
4. Frontend muestra banner rojo: "🎉 PROMOCIÓN ESPECIAL - 50% OFF"
   ↓
5. Frontend carga planes: GET /api/planes
   ↓
6. Backend devuelve planes CON PRECIOS DESCONTADOS (del archivo config)
   ↓
7. Usuario ve Plan 30D a $3.000 (antes $6.000)
   ↓
8. Usuario hace clic en "Comprar"
   ↓
9. Frontend abre modal de pago con precio descontado
   ↓
10. Usuario confirma: POST /api/comprar con planId: 29
    ↓
11. Backend obtiene el plan de la BD (precio original $6.000)
    ↓
12. Backend lee config y aplica override: $3.000
    ↓
13. Backend envía a MercadoPago: cobrar $3.000
    ↓
14. MercadoPago redirige a checkout con $3.000
    ↓
15. Usuario paga $3.000 (50% de descuento aplicado ✅)
```

## Seguridad

- El archivo config está en `/public/config/` para que sea accesible
- Los cambios se validan al leer (no puede romper el JSON)
- Los precios siempre se recalculan (no hay riesgo de desfase)
- MercadoPago siempre cobra el precio correcto
- Base de datos nunca se modifica (es segura)

## ¿Qué NO hace el sistema?

- ❌ No guarda cambios en la BD (siempre lee el JSON)
- ❌ No permite cambiar IDs de planes (esos están en la BD)
- ❌ No permite cambiar duración (esos están en la BD)
- ❌ No permite cambiar descripción del plan (esos están en la BD)

## ¿Qué SÍ hace el sistema?

- ✅ Cambiar precios dinámicamente
- ✅ Mostrar/ocultar promotiones en el hero
- ✅ Personalizar título y descripción del hero
- ✅ Cambiar estilos y colores del banner
- ✅ Aplicar cambios al instante (o máximo 60 segundos)
- ✅ Garantizar que MercadoPago siempre cobra correcto

## Troubleshooting

### Los cambios no aparecen
1. Verifica que `"enabled": true`
2. Espera 60 segundos o llama `POST /api/config/reload`
3. Revisa que el JSON sea válido (usa https://jsonlint.com)
4. Verifica en GET `/api/config/info` que los cambios están guardados

### El banner no aparece
1. Verifica `"promocion.habilitada": true`
2. Verifica que el `bgColor` sea válido (p. ej. `"bg-red-600"`)
3. Recarga el navegador (Ctrl+F5)
4. Verifica en GET `/api/config/hero` que devuelve `"habilitada": true`

### Los precios no cambian
1. Verifica que el ID del plan es correcto (21-32)
2. Verifica que el formato es: `"21": { "precio": 1500 }`
3. Verifica que `"enabled": true` está activado
4. Llama `POST /api/config/reload` para forzar recarga
5. Verifica en GET `/api/planes` que el precio cambió

### Error: "El JSON no es válido"
Asegúrate que:
- No hay comas faltantes o sobrantes
- Las llaves estén balanceadas
- Las strings usen comillas dobles `""`
- Los números no tengan comillas

Ejemplo correcto:
```json
{
  "21": { "precio": 1500 },
  "22": { "precio": 2500 }
}
```

Ejemplo incorrecto (falta la coma después de 1500):
```json
{
  "21": { "precio": 1500 }    // ❌ Falta coma aquí
  "22": { "precio": 2500 }
}
```

---

**Última actualización:** 2025-10-23
**Versión:** 1.0.0
**Autenticación:** No requerida (endpoints públicos)

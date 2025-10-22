# 📚 Documentación de API - SecureShop VPN

Esta documentación describe todos los endpoints disponibles en la API de SecureShop.

**Base URL**: `http://tu-dominio.com/api` o `http://149.50.148.6/api`

---

## 📋 Tabla de Contenidos

- [Health Check](#health-check)
- [Planes](#planes)
- [Compras](#compras)
- [Pagos](#pagos)
- [Webhooks](#webhooks)

---

## 🏥 Health Check

### GET /health

Verifica que la API esté funcionando correctamente.

**Respuesta exitosa (200)**:

```json
{
  "success": true,
  "status": "OK",
  "timestamp": "2025-10-21T12:00:00.000Z",
  "environment": "production"
}
```

---

## 💳 Planes

### GET /api/planes

Obtiene la lista de todos los planes VPN disponibles.

**Headers**: Ninguno requerido

**Respuesta exitosa (200)**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Plan Básico",
      "descripcion": "Perfecto para uso personal",
      "precio": 500,
      "dias": 30,
      "connection_limit": 1,
      "activo": true,
      "fecha_creacion": "2025-10-21T10:00:00.000Z"
    },
    {
      "id": 2,
      "nombre": "Plan Premium",
      "descripcion": "Para usuarios exigentes",
      "precio": 800,
      "dias": 30,
      "connection_limit": 2,
      "activo": true,
      "fecha_creacion": "2025-10-21T10:00:00.000Z"
    }
  ]
}
```

**Respuesta de error (500)**:

```json
{
  "success": false,
  "error": "Error obteniendo planes"
}
```

---

## 🛒 Compras

### POST /api/comprar

Inicia el proceso de compra de un plan VPN. Crea una orden de pago y retorna el link de MercadoPago.

**Headers**:
```
Content-Type: application/json
```

**Body**:

```json
{
  "planId": 1,
  "clienteEmail": "cliente@example.com",
  "clienteNombre": "Juan Pérez"
}
```

**Parámetros**:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| planId | number | Sí | ID del plan a comprar |
| clienteEmail | string | Sí | Email del cliente (válido) |
| clienteNombre | string | Sí | Nombre completo del cliente |

**Respuesta exitosa (200)**:

```json
{
  "success": true,
  "data": {
    "pago": {
      "id": "uuid-del-pago",
      "plan_id": 1,
      "monto": 500,
      "estado": "pendiente",
      "metodo_pago": "mercadopago",
      "cliente_email": "cliente@example.com",
      "cliente_nombre": "Juan Pérez",
      "fecha_creacion": "2025-10-21T12:00:00.000Z",
      "fecha_actualizacion": "2025-10-21T12:00:00.000Z"
    },
    "linkPago": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=xxxxx"
  },
  "message": "Pago creado exitosamente"
}
```

**Respuestas de error**:

**400 - Bad Request** (datos faltantes):
```json
{
  "success": false,
  "error": "Faltan datos requeridos: planId, clienteEmail, clienteNombre"
}
```

**400 - Bad Request** (email inválido):
```json
{
  "success": false,
  "error": "Email inválido"
}
```

**500 - Internal Server Error**:
```json
{
  "success": false,
  "error": "Error procesando compra"
}
```

---

## 💰 Pagos

### GET /api/pago/:id

Obtiene el estado de un pago específico y sus credenciales VPN si están disponibles.

**Headers**: Ninguno requerido

**Parámetros de URL**:

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | string | UUID del pago |

**Ejemplo**: `GET /api/pago/123e4567-e89b-12d3-a456-426614174000`

**Respuesta exitosa (200)** - Pago aprobado con cuenta creada:

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "plan_id": 1,
    "monto": 500,
    "estado": "aprobado",
    "metodo_pago": "mercadopago",
    "cliente_email": "cliente@example.com",
    "cliente_nombre": "Juan Pérez",
    "mp_payment_id": "12345678",
    "servex_cuenta_id": 999,
    "servex_username": "vpn_abc123",
    "servex_password": "SecurePass123!",
    "servex_categoria": "VPN Server 1",
    "servex_expiracion": "2025-11-20T12:00:00.000Z",
    "fecha_creacion": "2025-10-21T12:00:00.000Z",
    "fecha_actualizacion": "2025-10-21T12:05:00.000Z"
  }
}
```

**Respuesta exitosa (200)** - Pago pendiente:

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "plan_id": 1,
    "monto": 500,
    "estado": "pendiente",
    "metodo_pago": "mercadopago",
    "cliente_email": "cliente@example.com",
    "cliente_nombre": "Juan Pérez",
    "fecha_creacion": "2025-10-21T12:00:00.000Z",
    "fecha_actualizacion": "2025-10-21T12:00:00.000Z"
  }
}
```

**Respuesta de error (404)**:

```json
{
  "success": false,
  "error": "Pago no encontrado"
}
```

**Respuesta de error (500)**:

```json
{
  "success": false,
  "error": "Error obteniendo pago"
}
```

---

## 🔔 Webhooks

### POST /api/webhook

Endpoint para recibir notificaciones de MercadoPago cuando cambia el estado de un pago.

⚠️ **Este endpoint es llamado automáticamente por MercadoPago, no debes llamarlo manualmente.**

**Headers**:
```
Content-Type: application/json
```

**Body** (ejemplo de notificación de MercadoPago):

```json
{
  "type": "payment",
  "data": {
    "id": "12345678"
  }
}
```

**Respuesta exitosa (200)**:

```json
{
  "success": true
}
```

**Proceso interno**:

1. Recibe notificación de MercadoPago
2. Obtiene detalles del pago desde MercadoPago API
3. Si el pago está aprobado:
   - Actualiza el estado en la base de datos
   - Genera credenciales aleatorias
   - Crea la cuenta en Servex API
   - Guarda las credenciales en la base de datos
4. Responde 200 OK a MercadoPago

---

## 🔄 Redirects de MercadoPago

Estos endpoints son usados por MercadoPago para redirigir al usuario después del pago.

### GET /api/pago/success

Redirige al usuario al frontend con estado de éxito.

**Query Parameters**:
- `payment_id`: ID del pago en MercadoPago
- `external_reference`: UUID del pago en nuestro sistema

**Respuesta**: Redirect 302 a frontend con parámetros.

---

### GET /api/pago/failure

Redirige al usuario al frontend cuando el pago falla.

**Respuesta**: Redirect 302 a frontend con estado de rechazo.

---

### GET /api/pago/pending

Redirige al usuario al frontend cuando el pago queda pendiente.

**Query Parameters**:
- `external_reference`: UUID del pago en nuestro sistema

**Respuesta**: Redirect 302 a frontend con estado pendiente.

---

## 📊 Estados de Pago

| Estado | Descripción |
|--------|-------------|
| `pendiente` | Pago creado pero no pagado aún |
| `aprobado` | Pago aprobado y cuenta VPN creada |
| `rechazado` | Pago rechazado por MercadoPago |
| `cancelado` | Pago cancelado por el usuario |

---

## 🔐 Seguridad

### Rate Limiting

La API tiene rate limiting configurado para prevenir abuso:

- **Ventana**: 15 minutos (900,000 ms)
- **Máximo**: 100 requests por IP

Si excedes el límite, recibirás:

```json
{
  "success": false,
  "error": "Demasiadas solicitudes, por favor intente más tarde"
}
```

**Status Code**: 429 Too Many Requests

### CORS

El API permite solicitudes solo desde el origen configurado en `CORS_ORIGIN`.

### Validaciones

- Todos los campos requeridos son validados
- Emails son validados con regex
- IDs de planes son verificados antes de crear órdenes

---

## 🧪 Ejemplos de Uso

### JavaScript (fetch)

```javascript
// Obtener planes
const planes = await fetch('http://tu-dominio.com/api/planes')
  .then(res => res.json());

// Crear compra
const compra = await fetch('http://tu-dominio.com/api/comprar', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    planId: 1,
    clienteEmail: 'test@example.com',
    clienteNombre: 'Test User',
  }),
}).then(res => res.json());

// Verificar pago
const pago = await fetch(`http://tu-dominio.com/api/pago/${pagoId}`)
  .then(res => res.json());
```

### cURL

```bash
# Obtener planes
curl http://tu-dominio.com/api/planes

# Crear compra
curl -X POST http://tu-dominio.com/api/comprar \
  -H "Content-Type: application/json" \
  -d '{
    "planId": 1,
    "clienteEmail": "test@example.com",
    "clienteNombre": "Test User"
  }'

# Verificar pago
curl http://tu-dominio.com/api/pago/123e4567-e89b-12d3-a456-426614174000
```

### Python (requests)

```python
import requests

# Obtener planes
response = requests.get('http://tu-dominio.com/api/planes')
planes = response.json()

# Crear compra
response = requests.post('http://tu-dominio.com/api/comprar', json={
    'planId': 1,
    'clienteEmail': 'test@example.com',
    'clienteNombre': 'Test User'
})
compra = response.json()

# Verificar pago
response = requests.get(f'http://tu-dominio.com/api/pago/{pago_id}')
pago = response.json()
```

---

## 🐛 Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK - Solicitud exitosa |
| 400 | Bad Request - Error en los datos enviados |
| 404 | Not Found - Recurso no encontrado |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Error del servidor |

---

## 📞 Soporte

Si encuentras algún problema con la API, verifica:

1. Los logs del servidor: `pm2 logs secureshop-api`
2. El health check: `GET /health`
3. Las variables de entorno en `.env`

Para más información, consulta la documentación de despliegue en `docs/DEPLOYMENT.md`.

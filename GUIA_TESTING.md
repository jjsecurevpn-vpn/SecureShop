# 🧪 GUÍA DE TESTING - Ejemplos Prácticos

## Antes de Comenzar

### Requisitos

- [ ] Acceso a MercadoPago Sandbox (https://sandbox.mercadopago.com)
- [ ] Acceso a logs del backend (SSH/Docker/PM2)
- [ ] Herramienta HTTP (Postman, Insomnia, curl)
- [ ] Navegador con DevTools (F12)

### Credenciales de Test de MercadoPago Sandbox

```
URL: https://sandbox.mercadopago.com
Usuario: tu_usuario_sandbox@example.com
Contraseña: tu_contraseña

Tarjetas de prueba:
- APROBADA: 5031 7557 3453 0604 (Visa)
- RECHAZADA: 5031 4329 1234 0009 (Visa)
- PENDIENTE: 5031 5992 5288 4195 (American Express)
```

---

## 📋 Test 1: Pago Exitoso Inmediato

### Objetivo

Verificar que un pago aprobado se procesa ANTES de que el usuario llegue al frontend.

### Pasos

**1. Preparar logs (Terminal 1)**

```bash
# Si usas Docker
docker logs -f secureshop-backend

# Si usas PM2
pm2 logs ecosystem.config.js | grep -E "(Success|Pago procesado|Verificar Y Procesar)"

# Si tienes acceso directo
tail -f /ruta/a/logs/backend.log
```

**2. Ir a la tienda (Terminal 2 - Navegador)**

```
URL: http://localhost:3000/planes
Abrir DevTools (F12)
Ir a tab "Console"
```

**3. Comprar un plan**

- Click en "Comprar"
- Llenar nombre y email
- Click "Ir a pagar"

**4. En MercadoPago Sandbox**

- Usar tarjeta APROBADA: 5031 7557 3453 0604
- Mes: 11, Año: 25, CVC: 123
- Nombre: Test User
- Click "Pagar"

**5. Observar logs (Terminal 1)**

✅ ESPERADO:

```
[Success] 🔍 Verificando pago abc-123-def contra MercadoPago...
[2024-01-20T10:30:45.123Z] ✅ Pago aprobado en MercadoPago, procesando...
[2024-01-20T10:30:46.456Z] ✅ Pago procesado exitosamente ANTES de redirigir
```

❌ NO DEBERÍAS VER:

```
[Success] ⏳ Reintentando verificación del pago... intento 1/30
```

**6. Resultado en Frontend**

- ✅ Redirige a /success
- ✅ Muestra credenciales inmediatamente
- ✅ SIN "Procesando tu pago..."
- ✅ Usuario: algo como "test_user_XXXXX"
- ✅ Email confirma credenciales

### Éxito

Si ves credenciales en < 5 segundos sin reintentos → **TEST PASADO** ✅

---

## 📋 Test 2: Webhook Lento

### Objetivo

Simular que el webhook tarda 20+ segundos y verificar que el frontend sigue funcionando.

### Pasos

**1. Crear pago manual en BD (Necesitas acceso DB)**

```sql
-- Usar DB Client (MySQL, psql, etc)
INSERT INTO pagos (id, plan_id, monto, estado, metodo_pago, cliente_email, cliente_nombre, created_at)
VALUES ('test-webhook-lento-123', 1, 100, 'pendiente', 'mercadopago', 'test@example.com', 'Test User', NOW());
```

**2. Acceder directamente a success page**

```
Navegador: http://localhost:3000/success?pago_id=test-webhook-lento-123&status=approved&tipo=cliente
```

**3. Observar página**

- Deberá mostrar "Verificando tu compra..."
- Console del navegador mostrará reintentos

**4. Esperar y observar logs (Terminal 1)**

Primeros 5 segundos:

```
[Success] 🔍 VERIFICAR Y PROCESAR PAGO: test-webhook-lento-123
[Success] 📊 Estado actual en BD: "pendiente"
[Success] 🌐 Estado PENDIENTE: consultando MercadoPago...
[Success] ⚠️ Pago no encontrado en MercadoPago, esperando webhook
```

Frontend mostrará:

```
[Success] ⏳ Reintentando verificación del pago... intento 1/30 (espera: 1000ms)
[Success] ⏳ Reintentando verificación del pago... intento 2/30 (espera: 1000ms)
```

**5. Simular webhook (Terminal manual o script)**

```bash
# Usar curl
curl -X POST http://localhost:3001/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment",
    "data": {
      "id": 9876543210  # Este será el payment_id en MP
    }
  }'
```

O hacer UPDATE en BD:

```sql
UPDATE pagos
SET estado = 'aprobado',
    servex_username = 'test_user_123',
    servex_password = 'pass456',
    servex_expiracion = DATE_ADD(NOW(), INTERVAL 30 DAY)
WHERE id = 'test-webhook-lento-123';
```

**6. Observar resultado**

Frontend debería detectar en el siguiente reintento:

```
[Success] ⏳ Reintentando verificación del pago... intento 3/30 (espera: 1000ms)
[Success] 📊 Estado actual en BD: "aprobado"
[Success] ✅ Pago ya está APROBADO, devolviendo info
```

Luego muestra credenciales ✅

### Éxito

Si frontend eventualmente muestra credenciales sin error → **TEST PASADO** ✅

---

## 📋 Test 3: Webhook Nunca Llega

### Objetivo

Verificar que si webhook no llega, usuario puede FORZAR verificación.

### Pasos

**1. Crear pago en estado pendiente (igual Test 2)**

```sql
INSERT INTO pagos (id, plan_id, monto, estado, metodo_pago, cliente_email, cliente_nombre)
VALUES ('test-no-webhook-789', 1, 100, 'pendiente', 'mercadopago', 'test@example.com', 'Test');
```

**2. Acceder a success page**

```
http://localhost:3000/success?pago_id=test-no-webhook-789&status=approved&tipo=cliente
```

**3. Esperar hasta reintento 30**

```
Frontend mostrará ~85 segundos de reintentos
Luego mostrará: "El pago aún no ha sido procesado..."
```

**4. Usar endpoint de verificación forzada**

```bash
# Terminal - Usar curl
curl -X POST http://localhost:3001/api/pago/test-no-webhook-789/verificar-ahora \
  -H "Content-Type: application/json"
```

**5. Observar respuesta**

```json
{
  "success": true,
  "data": {
    "id": "test-no-webhook-789",
    "estado": "pendiente",
    "monto": 100
    // ... otros datos
  }
}
```

**6. Ver logs**

```
[2024-01-20T10:31:00.000Z] 🚨 VERIFICACIÓN FORZADA SOLICITADA para pago: test-no-webhook-789
[2024-01-20T10:31:01.234Z] 📊 Estado en MercadoPago: "no encontrado"
[2024-01-20T10:31:01.235Z] ⚠️ Pago NO ENCONTRADO en MercadoPago
```

### Éxito

Si endpoint POST responde correctamente → **TEST PASADO** ✅

---

## 📋 Test 4: Pago Rechazado

### Objetivo

Verificar que pagos rechazados se procesan correctamente.

### Pasos

**1. Ir a tienda**

```
http://localhost:3000/planes
```

**2. Comprar plan**

- Click "Comprar"
- Llenar datos
- Click "Ir a pagar"

**3. En MercadoPago - Usar tarjeta RECHAZADA**

```
Número: 5031 4329 1234 0009
Mes: 11, Año: 25, CVC: 123
Nombre: Test User
Click Pagar
```

**4. Observar en MercadoPago**

- Debe mostrar "Pago rechazado"
- O redirige a página de error

**5. Si redirige a error**

Debería estar en: `http://localhost:3000/?status=rejected&pago_id=XXX`

O BD muestra:

```sql
SELECT * FROM pagos WHERE estado = 'rechazado';
```

### Éxito

Si BD marca pago como 'rechazado' → **TEST PASADO** ✅

---

## 📋 Test 5: Verificación de Logs

### Objetivo

Asegurar que el logging es detallado y útil.

### Pasos

**1. Hacer un pago completamente exitoso (Test 1)**

**2. Extraer los logs completos**

```bash
# Extraer líneas relevantes
grep -E "(Success|Pago procesado|VERIFICAR Y PROCESAR)" logs/backend.log

# O si usas PM2
pm2 logs ecosystem.config.js | tee test_logs.txt
# Luego presiona Ctrl+C después del pago
```

**3. Verificar patrón esperado**

```
✅ DEBERÍAS VER:
[Success] 🔍 Verificando pago XXX-XXX contra MercadoPago...
[timestamp] ✅ Pago aprobado en MercadoPago, procesando...
[timestamp] ✅ Pago procesado exitosamente ANTES de redirigir
[Tienda] Confirmando pago y creando cuenta VPN: XXX-XXX
[Tienda] Username generado: test_user_XXXXX para cliente: Test User
[Tienda] Usando categoría activa: Argentina (ID: 1)
[Tienda] ✅ Cuenta VPN creada exitosamente: test_user_XXXXX
[Tienda] ✅ Email enviado a: test@example.com
```

❌ NO DEBERÍAS VER:

```
Error procesando pago
Pago no encontrado
No hay categorías activas
Servex error
```

### Éxito

Si ves logs claros y completos → **TEST PASADO** ✅

---

## 📊 Tabla de Resumen de Tests

```
┌─────────┬──────────────────────┬──────────────┬───────────────┐
│ Test    │ Objetivo             │ Duración     │ Resultado     │
├─────────┼──────────────────────┼──────────────┼───────────────┤
│ Test 1  │ Pago exitoso rápido  │ ~5 segundos  │ ✅ Esperado   │
├─────────┼──────────────────────┼──────────────┼───────────────┤
│ Test 2  │ Webhook lento        │ ~20 segundos │ ✅ Esperado   │
├─────────┼──────────────────────┼──────────────┼───────────────┤
│ Test 3  │ Endpoint POST        │ Inmediato    │ ✅ Esperado   │
├─────────┼──────────────────────┼──────────────┼───────────────┤
│ Test 4  │ Pago rechazado       │ ~5 segundos  │ ✅ Esperado   │
├─────────┼──────────────────────┼──────────────┼───────────────┤
│ Test 5  │ Logging detallado    │ N/A          │ ✅ Esperado   │
└─────────┴──────────────────────┴──────────────┴───────────────┘
```

---

## 🔧 Troubleshooting During Testing

### Problema: "Pago no encontrado en MercadoPago"

```
CAUSA PROBABLE:
1. Pago no existe realmente en MP
2. external_reference no coincide
3. MercadoPago está down

SOLUCIÓN:
1. Verifica que el external_reference sea correcto en BD
2. Consulta MercadoPago dashboard manualmente
3. Intenta con otro pago
```

### Problema: "Error conectando a Servex"

```
CAUSA PROBABLE:
1. Servex está down
2. Credenciales de Servex son incorrectas
3. Network/firewall bloqueando

SOLUCIÓN:
1. Revisar que Servex esté UP
2. Revisar .env con credenciales
3. Revisar logs de conectividad
```

### Problema: "No se recibe email"

```
CAUSA PROBABLE:
1. Email service down
2. Email está en spam
3. Credenciales SMTP incorrectas

SOLUCIÓN:
1. Revisar que EmailService esté configurado
2. Revisar bandeja de spam
3. Revisar logs de email
```

---

## ✅ Checklist Final

- [ ] Test 1 exitoso (pago rápido)
- [ ] Test 2 exitoso (webhook lento)
- [ ] Test 3 exitoso (endpoint POST)
- [ ] Test 4 exitoso (pago rechazado)
- [ ] Test 5 exitoso (logs completos)
- [ ] Credenciales llegan por email
- [ ] Usuario puede loguearse con credenciales
- [ ] Logs son claros y útiles
- [ ] No hay errores en console del navegador
- [ ] No hay errores en logs del backend

---

## 🎯 Siguiente Paso

Si todos los tests pasan:

1. ✅ Mergear cambios a `main`
2. ✅ Desplegar a staging
3. ✅ Hacer testing en staging (repetir tests)
4. ✅ Desplegar a production
5. ✅ Monitorear durante 48 horas

**Felicidades! El fix está listo.** 🎉

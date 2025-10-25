# ✅ CHECKLIST DE DEPLOYMENT - Fix de Pagos MercadoPago

## 🚀 Pre-Deployment

- [ ] **Revisar todos los cambios**

  - [ ] Backend: `/backend/src/routes/tienda.routes.ts` - GET /pago/success mejorado
  - [ ] Backend: `/backend/src/routes/tienda.routes.ts` - Nuevo POST /pago/:id/verificar-ahora
  - [ ] Backend: `/backend/src/services/tienda.service.ts` - getMercadoPagoService() agregado
  - [ ] Backend: `/backend/src/services/tienda.service.ts` - verificarYProcesarPago() con logging
  - [ ] Frontend: `/frontend/src/pages/SuccessPage.tsx` - Reintentos 10→30 con backoff

- [ ] **Testing en desarrollo**

  - [ ] Compilar backend sin errores: `npm run build` (backend)
  - [ ] Compilar frontend sin errores: `npm run build` (frontend)
  - [ ] Probar con pago exitoso en sandbox MercadoPago
  - [ ] Probar con pago rechazado en sandbox MercadoPago
  - [ ] Revisar logs en consola del backend

- [ ] **Documentación actualizada**
  - [ ] ANALISIS_PROBLEMA_PAGO.md ✅
  - [ ] INTEGRACION_SOLUCIONES.md ✅
  - [ ] Este checklist ✅

---

## 🧪 Testing en Staging/Producción

### Test 1: Flujo Completamente Exitoso

```
1. Ir a página de planes
2. Click en "Comprar"
3. Llenar datos (nombre, email)
4. Click en "Ir a pagar"
5. Ir a MercadoPago (sandbox)
6. Usar tarjeta de prueba APROBADA:
   - Número: 5031 7557 3453 0604
   - Mes: 11
   - Año: 25
   - CVC: 123
7. Confirmar pago

ESPERADO:
✅ Redirige a /success?pago_id=XXX
✅ Muestra credenciales INMEDIATAMENTE (sin "procesando...")
✅ Backend logs: "Pago procesado exitosamente ANTES de redirigir"
✅ Usuario recibe email con credenciales

TIEMPO TOTAL: <5 segundos
```

### Test 2: Webhook Lento

```
OBJETIVO: Simular que el webhook tarda 20+ segundos

PASOS MANUALES:
1. Ir a base de datos
2. Crear pago manual en estado "pendiente"
3. Acceder directamente a: /success?pago_id=<pago_id>

ESPERADO:
✅ Muestra "Verificando tu compra..."
✅ Reintenta automáticamente (ver logs de reintentos)
✅ Si webhook llega en los 30 reintentos:
   → Muestra credenciales
✅ Si webhook NO llega en 30 reintentos:
   → Muestra error "El pago aún no ha sido procesado..."

LOGS ESPERADOS:
[Success] 🔍 Verificando pago XXX contra MercadoPago...
[Success] ⏳ Reintentando verificación del pago... intento 1/30
[Success] ⏳ Reintentando verificación del pago... intento 2/30
...
```

### Test 3: Endpoint POST /pago/:id/verificar-ahora

```
USAR CURL o Postman:

POST /api/pago/:id/verificar-ahora
Content-Type: application/json

ESPERADO:
✅ Status 200
✅ Responde con pago actualizado
✅ Si MercadoPago reporta "approved":
   → Se procesa la cuenta
   → Frontend puede mostrar credenciales

LOGS ESPERADOS:
[2024-01-20T10:31:00.000Z] 🚨 VERIFICACIÓN FORZADA SOLICITADA para pago: abc-123
[2024-01-20T10:31:01.234Z] 📊 Estado en MercadoPago: "approved"
[2024-01-20T10:31:01.235Z] ✅ Pago aprobado! Procesando...
```

### Test 4: Pago Rechazado

```
1. Ir a página de planes
2. Click en "Comprar"
3. Llenar datos
4. Click en "Ir a pagar"
5. Ir a MercadoPago (sandbox)
6. Usar tarjeta de prueba RECHAZADA:
   - Número: 5031 4329 1234 0009
7. Confirmar pago

ESPERADO:
✅ MercadoPago muestra "Pago rechazado"
✅ Usuario NO ve credenciales
✅ BD marca pago como "rechazado"
✅ Backend logs muestran el rechazo
```

---

## 📊 Métricas a Monitorear

Después de deployment, monitorear durante 48 horas:

```
MÉTRICA 1: Velocidad de Procesamiento
┌─ % de pagos procesados en:
├─ < 5 segundos    → OBJETIVO: >70%
├─ 5-30 segundos   → OBJETIVO: >20%
├─ 30-90 segundos  → OBJETIVO: >5%
└─ > 90 segundos   → OBJETIVO: <1%

MÉTRICA 2: Errores
┌─ Pagos aprobados sin credenciales  → OBJETIVO: 0%
├─ Webhook failures                  → MONITOR
├─ Pago no encontrado en MP           → MONITOR
└─ Errores en BD                      → MONITOR

MÉTRICA 3: User Experience
┌─ Clientes reportando "procesando..." → OBJETIVO: 0
├─ Tickets de "no recibieron credenciales" → MONITOR
└─ Soporte puede hacer POST /verificar-ahora → ✅ SOPORTADO
```

---

## 🔍 Logs a Revisar

### Logs del Backend a Monitorear:

```bash
# Ver logs en tiempo real (si usas Docker)
docker logs -f backend-container

# O si es PM2
pm2 logs ecosystem.config.js

# Ver estos patrones:
grep "Pago procesado exitosamente ANTES de redirigir" logs/
  → Significa: Solución 1 funcionando ✅

grep "VERIFICACIÓN FORZADA SOLICITADA" logs/
  → Significa: Alguien llamó al nuevo endpoint
  → Revisar si fue necesario

grep "🔍 VERIFICAR Y PROCESAR PAGO" logs/
  → Verificar estado y flujo de cada pago
  → Si ves MUCHOS → aumentar tiempo del webhook
```

---

## ⚠️ Rollback Plan

Si algo sale mal:

### Opción 1: Rollback Rápido (5 min)

```bash
# Si estás con Git
git revert <commit-hash>
git push

# O restaurar archivos
git checkout HEAD~1 backend/src/routes/tienda.routes.ts
git checkout HEAD~1 backend/src/services/tienda.service.ts
git checkout HEAD~1 frontend/src/pages/SuccessPage.tsx

npm run build
# Redeploy
```

### Opción 2: Feature Flag (si lo tienes)

```typescript
// En tienda.routes.ts
if (process.env.SYNC_VERIFY_ENABLED === "true") {
  // Nueva verificación sincrónica
} else {
  // Redirigir sin verificar (viejo comportamiento)
}
```

### Opción 3: Desactivar solo el nuevo endpoint POST

```typescript
// Comentar POST /pago/:id/verificar-ahora si hay issues
// No afecta a GET /pago/success que es lo crítico
```

---

## 📝 Versiones de Código

### Version 1.0 - Implementación Inicial

- [x] GET /pago/success mejorado con verificación sincrónica
- [x] POST /pago/:id/verificar-ahora agregado
- [x] SuccessPage con reintentos 30 + backoff
- [x] Logging detallado en verificarYProcesarPago()
- [x] Headers anti-caché en /pago/success

### Version 1.1 - Improvements Futuros (Opcional)

- [ ] WebSocket notifications para actualizaciones en tiempo real
- [ ] Webhook retry mechanism con exponential backoff
- [ ] Dashboard de pagos en "estado crítico"
- [ ] Botón manual "Reintentar verificación" en SuccessPage
- [ ] Email de confirmación si pago tarda > 5s

---

## 🎯 Criterios de Éxito

✅ **Deployment exitoso si:**

1. **Cero errores en logs**

   - No hay excepciones no controladas
   - No hay "pago no encontrado" sin razón

2. **Pagos se procesan rápido**

   - > 70% en < 5 segundos
   - Clientes ven credenciales inmediatamente

3. **Sin reportes de "procesando indefinidamente"**

   - Pasadas 48 horas, 0 tickets de este tipo
   - Si alguien ve retrasos, es porque el webhook realmente tarda

4. **Logs son útiles**

   - Podemos saber exactamente qué pasó con cada pago
   - Debugging es fácil

5. **Endpoint POST funciona**
   - Soporte puede resolver pagos "stuck" manualmente

---

## 🚨 Alertas de Problemas

Si ves estos patrones, **investiga inmediatamente**:

```
❌ PATRÓN: "Pago no encontrado en MercadoPago"
   → Significa: MercadoPago no tiene registrado el pago
   → Revisar: ¿Se creó la preferencia correctamente?
   → Revisar: ¿El external_reference es correcto?

❌ PATRÓN: "Error procesando pago" repetido
   → Significa: Hay un error en confirmarPagoYCrearCuenta()
   → Revisar: ¿Servex está disponible?
   → Revisar: ¿Database está disponible?

❌ PATRÓN: Muchos "Pago ya está APROBADO"
   → Significa: Está funcionando bien (no es un problema)
   → Pero si ves esto + clientes reportando issues:
   → Revisar: ¿Frontend está recibiendo respuesta correcta?

❌ PATRÓN: "VERIFICACIÓN FORZADA" frecuente
   → Significa: El webhook está muy lento
   → Revisar: ¿MercadoPago tiene problemas?
   → Revisar: ¿Nuestra webhook URL es correcta?
```

---

## 📋 Checklist Final

Antes de marcar como "LISTO":

- [ ] Todos los cambios están en Git
- [ ] Ramas mergeadas a `main`/`master`
- [ ] Documentación está actualizada
- [ ] Backend se compila sin errores
- [ ] Frontend se compila sin errores
- [ ] Se probó con pago exitoso
- [ ] Se probó con pago rechazado
- [ ] Logs se ven útiles y claros
- [ ] Endpoint POST está funcional
- [ ] Rollback plan documentado
- [ ] Equipo está notificado del deployment
- [ ] Monitoreo está activo

---

## 📞 Contacto y Escalación

Si durante o después del deployment encuentras problemas:

1. **Revisar logs primera:**

   - `[Success] 🔍 Verificando pago...`
   - `[Success] ⏳ Reintentando...`
   - `[Tienda] 🔍 VERIFICAR Y PROCESAR PAGO:`

2. **Si no encuentras la causa:**

   - Revisar Webhook de MercadoPago
   - Revisar estatus de MercadoPago API
   - Verificar conectividad BD

3. **Último recurso:**
   - Activar rollback
   - Revisar cambios en profundidad
   - Debuggear step by step

---

**Changelog:**

- v1.0 - Initial implementation - 2024-01-20

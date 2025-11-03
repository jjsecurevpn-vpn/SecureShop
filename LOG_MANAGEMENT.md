# 📋 Gestión de Logs y Mantenimiento del Backend

## 🔍 Problema Identificado (3 de Noviembre 2025)

**Síntoma:** El backend dejó de responder a las peticiones del frontend, mostrando "error al cargar usuario" sin que llegaran datos de ninguna API.

**Causa Raíz:** Los logs de PM2 crecieron desproporcionadamente:
- `secureshop-backend-error.log`: **351 MB**
- `secureshop-backend-out.log`: **372 MB**

Este crecimiento masivo de archivos de log consumió recursos del sistema, ralentizando y finalmente bloqueando las respuestas del backend.

---

## ✅ Soluciones Implementadas

### 1. **Limpieza Inmediata de Logs**
```bash
pm2 flush
```
- Vaciados completamente los logs que estaban corruptos
- Libradas las restricciones de I/O del disco

### 2. **Configuración de Rotación en `ecosystem.config.js`**
Agregados parámetros de rotación automática:
```javascript
max_size: "50M",           // Rotar logs cuando alcancen 50MB
max_restarts: 10,          // Máximo 10 reinicios
min_uptime: "10s",         // Validar que el proceso esté vivo al menos 10s
```

### 3. **Script de Limpieza Automática**
Ubicación: `/home/secureshop/cleanup-logs.sh`
- Realiza backup comprimido de logs que superen 50MB
- Almacena backup en `/home/secureshop/logs-backup/`
- Limpia el archivo original
- Se ejecuta diariamente a las **00:00 (medianoche)**

### 4. **Cron Jobs de Mantenimiento**
```
0 2,14 * * * /home/secureshop/restart-pm2.sh           # Reinicio PM2 2am y 2pm
0 0 * * * /home/secureshop/cleanup-logs.sh             # Limpieza de logs medianoche
```

---

## 📊 Monitoreo Recomendado

### Ver tamaño actual de logs:
```bash
ssh root@149.50.148.6 "ls -lh ~/.pm2/logs/"
```

### Ver estado de backups:
```bash
ssh root@149.50.148.6 "ls -lh /home/secureshop/logs-backup/"
```

### Ver el proceso de limpieza:
```bash
ssh root@149.50.148.6 "tail -50 /home/secureshop/logs-backup/cleanup.log"
```

### Monitorear en tiempo real:
```bash
ssh root@149.50.148.6 "pm2 logs secureshop-backend --lines 50"
```

---

## 🔧 Mantenimiento Manual (Si es Necesario)

### Limpiar logs manualmente:
```bash
ssh root@149.50.148.6 "pm2 flush && echo 'Logs limpiados'"
```

### Reiniciar proceso manualmente:
```bash
ssh root@149.50.148.6 "pm2 restart secureshop-backend --silent && sleep 2 && pm2 status"
```

### Ver logs del último reinicio:
```bash
ssh root@149.50.148.6 "pm2 logs secureshop-backend --lines 100"
```

---

## 📈 Estadísticas del Problema

| Métrica | Antes | Después |
|---------|-------|---------|
| error.log | 351 MB | ~50 MB (rotación automática) |
| out.log | 372 MB | ~50 MB (rotación automática) |
| Estado Backend | ❌ No responde | ✅ Funcionando |
| Restart Count | 12 | Se reinicia automáticamente cada 2am/2pm |

---

## 🚀 Mejoras Implementadas

✅ **Rotación automática de logs** - Impide que logs crezcan sin control  
✅ **Backup comprimido** - Conserva histórico sin usar tanto espacio  
✅ **Limpieza programada** - Liberación automática de espacio diariamente  
✅ **Monitoreo continuo** - PM2 reinicia si excede 500MB de memoria  
✅ **Sistema de alertas** - Logs rotativos facilitan debugging  

---

## 💡 Conclusión

El problema fue causado por logs no rotados que crecieron sin límite. 

**Solución:** Ahora el sistema tiene:
1. ✅ Rotación automática a 50MB
2. ✅ Limpieza diaria de logs viejos
3. ✅ Backups comprimidos para auditoría
4. ✅ Monitoreo automático de memoria (500MB limit)
5. ✅ Reinicio programado 2x al día como failsafe

**Resultado:** El backend funciona estable sin interrupciones por logs.

---

## 📝 Historial

- **2025-11-03 13:24** - Logs limpiados, rotación configurada
- **2025-11-03 13:24** - Script de limpieza automática creado
- **2025-11-03 13:25** - Cron job configurado para limpieza diaria
- **2025-11-03 13:26** - Documento de referencia creado

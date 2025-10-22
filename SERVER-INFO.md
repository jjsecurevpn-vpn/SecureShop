# 📋 Información del Servidor VPS

## Datos del Servidor
- **IP**: 149.50.148.6
- **Usuario**: root
- **Usuario de aplicación**: secureshop
- **Directorio de instalación**: /home/secureshop/secureshop-vpn

## URLs de Producción
- **Frontend**: http://149.50.148.6
- **API Base**: http://149.50.148.6/api
- **Health Check**: http://149.50.148.6/api/health
- **Webhook MercadoPago**: http://149.50.148.6/api/webhook

## Credenciales Configuradas

### Servex API
- **API Key**: sx_9c57423352279d267f4e93f3b14663c510c1c150fd788ceef393ece76a5f521c
- **Base URL**: https://servex.ws/api

### MercadoPago
- **Public Key**: APP_USR-59bd1954-749b-43c7-9bfc-1c1a5e26a22d
- **Access Token**: APP_USR-8757932973898001-081011-11b3d5038392a44bcbb684a733b5539d-222490274

## Comandos Rápidos

### Conectar al servidor
```bash
ssh root@149.50.148.6
```

### Cambiar a usuario de aplicación
```bash
su - secureshop
```

### Ver logs del backend
```bash
pm2 logs secureshop-api
```

### Reiniciar backend
```bash
pm2 restart secureshop-api
```

### Ver estado de servicios
```bash
pm2 status
systemctl status nginx
```

### Ver logs de Nginx
```bash
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/secureshop_access.log
```

### Desplegar/Actualizar
```bash
# Desde tu máquina local
cd /c/Users/JHServices/Documents/SecureShop/secureshop-vpn

# Primera vez
bash deploy.sh

# Actualizaciones
bash update.sh
```

## Estructura en el VPS

```
/home/secureshop/secureshop-vpn/
├── backend/
│   ├── .env (variables de entorno)
│   ├── database/
│   │   └── secureshop.db (base de datos SQLite)
│   ├── dist/ (código compilado)
│   └── src/ (código fuente)
├── frontend/
│   ├── dist/ (archivos estáticos compilados - servidos por Nginx)
│   └── src/ (código fuente)
└── docs/ (documentación)
```

## Planes VPN Predeterminados

1. **Básico** - 30 días - $500 ARS - 1 conexión
2. **Premium** - 30 días - $800 ARS - 3 conexiones
3. **Familiar** - 60 días - $1400 ARS - 5 conexiones
4. **Anual** - 365 días - $5000 ARS - 3 conexiones

## Base de Datos

- **Tipo**: SQLite
- **Ubicación**: /home/secureshop/secureshop-vpn/backend/database/secureshop.db
- **Tablas**:
  - `planes` - Planes de VPN disponibles
  - `pagos` - Registro de todas las transacciones

### Backup de base de datos
```bash
ssh root@149.50.148.6
cp /home/secureshop/secureshop-vpn/backend/database/secureshop.db ~/backup-$(date +%Y%m%d).db
```

## Monitoreo

### Verificar salud del sistema
```bash
# API Health
curl http://149.50.148.6/api/health

# Planes disponibles
curl http://149.50.148.6/api/planes

# Ver procesos
ssh root@149.50.148.6 -t "su - secureshop -c 'pm2 monit'"
```

### Logs importantes
- **Backend**: `pm2 logs secureshop-api`
- **Nginx Access**: `/var/log/nginx/secureshop_access.log`
- **Nginx Error**: `/var/log/nginx/secureshop_error.log`

## Flujo de Compra

1. Usuario selecciona plan en frontend
2. Frontend envía solicitud a `/api/comprar`
3. Backend crea preferencia en MercadoPago
4. Usuario es redirigido a pagar en MercadoPago
5. MercadoPago envía webhook a `/api/webhook`
6. Backend procesa webhook y crea cuenta en Servex
7. Usuario es redirigido a página de éxito con credenciales

## Seguridad

### Firewall (UFW)
- Puerto 22 (SSH): ✅ Abierto
- Puerto 80 (HTTP): ✅ Abierto
- Puerto 443 (HTTPS): ✅ Abierto
- Puerto 4000 (Backend directo): ❌ Cerrado (solo localhost)

### Headers de seguridad (Nginx)
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- X-Content-Type-Options: nosniff

### Rate Limiting
- 100 requests por 15 minutos por IP

## Próximos Pasos Recomendados

1. **Configurar dominio** (opcional pero recomendado)
   - Apuntar dominio a 149.50.148.6
   - Instalar SSL con Let's Encrypt
   - Actualizar URLs en .env y MercadoPago

2. **Monitoreo avanzado**
   - Configurar PM2 Plus para monitoreo en tiempo real
   - Configurar alertas por email

3. **Backups automáticos**
   - Script de backup diario de la base de datos
   - Backup a almacenamiento externo

4. **Analytics** (opcional)
   - Integrar Google Analytics en frontend
   - Dashboards de ventas

## Soporte

### Documentación completa
- `docs/DEPLOYMENT.md` - Guía detallada de despliegue
- `docs/API.md` - Documentación de API
- `docs/CONFIGURACION.md` - Configuración detallada
- `DEPLOY-QUICK.md` - Esta guía rápida

### Recursos externos
- **Servex API**: https://servex.ws/api
- **MercadoPago Docs**: https://www.mercadopago.com.ar/developers
- **PM2 Docs**: https://pm2.keymetrics.io/
- **Nginx Docs**: https://nginx.org/en/docs/

## Notas Importantes

⚠️ **IMPORTANTE**: Mantén las credenciales seguras. El archivo `.env.production` contiene información sensible.

⚠️ **WEBHOOK**: Asegúrate de configurar la URL del webhook en tu panel de MercadoPago:
   - URL: `http://149.50.148.6/api/webhook`
   - O con dominio: `https://tu-dominio.com/api/webhook`

⚠️ **BACKUPS**: Realiza backups periódicos de la base de datos antes de actualizar.

## Troubleshooting Común

### Error 502 Bad Gateway
```bash
# Verificar que PM2 esté corriendo
ssh root@149.50.148.6 -t "su - secureshop -c 'pm2 status'"

# Reiniciar si es necesario
ssh root@149.50.148.6 -t "su - secureshop -c 'pm2 restart secureshop-api'"
```

### Base de datos bloqueada
```bash
# Detener PM2
pm2 stop secureshop-api

# Esperar 5 segundos
sleep 5

# Reiniciar
pm2 start secureshop-api
```

### Webhook no recibe notificaciones
1. Verificar que la URL esté correcta en MercadoPago
2. Verificar logs: `pm2 logs secureshop-api | grep webhook`
3. Verificar que el backend esté accesible desde internet

### Certificado SSL expirado (si usas HTTPS)
```bash
ssh root@149.50.148.6
certbot renew
systemctl restart nginx
```

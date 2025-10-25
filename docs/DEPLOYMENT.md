# 🚀 Guía de Despliegue en VPS - SecureShop VPN

Esta guía te ayudará a desplegar SecureShop VPN en tu servidor VPS (149.50.148.6).

## 📋 Requisitos Previos

- VPS con Ubuntu 20.04 LTS o superior
- Acceso root o sudo
- Dominio configurado (opcional pero recomendado)
- Credenciales de MercadoPago y Servex

## 🔧 Paso 1: Preparar el Servidor

### Conectar al VPS

```bash
ssh root@149.50.148.6
```

### Actualizar el sistema

```bash
apt update && apt upgrade -y
```

### Instalar dependencias básicas

```bash
apt install -y curl wget git build-essential
```

## 📦 Paso 2: Instalar Node.js

```bash
# Instalar Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt-get install -y nodejs

# Verificar instalación
node --version  # Debe mostrar v18.x.x
npm --version   # Debe mostrar 9.x.x o superior
```

## 🔐 Paso 3: Configurar Usuario de Aplicación (Recomendado)

```bash
# Crear usuario para la aplicación
adduser --disabled-password --gecos "" secureshop

# Agregar al grupo sudo (opcional)
usermod -aG sudo secureshop

# Cambiar a ese usuario
su - secureshop
```

## 📥 Paso 4: Clonar el Proyecto

```bash
cd ~
git clone https://github.com/tu-usuario/secureshop-vpn.git
cd secureshop-vpn
```

Si no usas Git, puedes subir los archivos vía SCP:

```bash
# Desde tu máquina local
scp -r secureshop-vpn root@149.50.148.6:/home/secureshop/
```

## ⚙️ Paso 5: Configurar Backend

```bash
cd ~/secureshop-vpn/backend

# Instalar dependencias
npm install

# Copiar archivo de ejemplo de variables de entorno
cp .env.example .env

# Editar configuración
nano .env
```

### Configurar variables de entorno (.env)

```env
# Servidor
PORT=4000
NODE_ENV=production

# Servex API
SERVEX_API_KEY=tu_api_key_real_aqui
SERVEX_BASE_URL=https://servex.ws/api
SERVEX_TIMEOUT=30000

# MercadoPago
MP_ACCESS_TOKEN=tu_access_token_real_aqui
MP_PUBLIC_KEY=tu_public_key_real_aqui
MP_WEBHOOK_URL=http://149.50.148.6:4000/api

# Database
DATABASE_PATH=./database/secureshop.db

# CORS
CORS_ORIGIN=http://149.50.148.6

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Guardar con `Ctrl + X`, luego `Y`, luego `Enter`.

### Compilar el proyecto

```bash
npm run build
```

## 🎨 Paso 6: Configurar Frontend

```bash
cd ~/secureshop-vpn/frontend

# Instalar dependencias
npm install

# Crear archivo de entorno
nano .env
```

Contenido del `.env`:

```env
VITE_API_URL=http://149.50.148.6:4000/api
```

### Build del frontend

```bash
npm run build
```

Esto creará una carpeta `dist` con los archivos estáticos.

## 🚀 Paso 7: Instalar y Configurar PM2

PM2 mantendrá tu aplicación ejecutándose y la reiniciará automáticamente si falla.

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Iniciar el backend
cd ~/secureshop-vpn/backend
pm2 start npm --name "secureshop-api" -- start

# Verificar que esté ejecutándose
pm2 list
pm2 logs secureshop-api

# Configurar PM2 para iniciar al arrancar el sistema
pm2 startup
pm2 save
```

## 🌐 Paso 8: Configurar Nginx (Servidor Web)

### Instalar Nginx

```bash
sudo apt install -y nginx
```

### Crear configuración para SecureShop

```bash
sudo nano /etc/nginx/sites-available/secureshop
```

Contenido del archivo:

```nginx
server {
    listen 80;
    server_name 149.50.148.6;  # O tu dominio si tienes uno

    # Frontend (archivos estáticos)
    root /home/secureshop/secureshop-vpn/frontend/dist;
    index index.html;

    # Logs
    access_log /var/log/nginx/secureshop_access.log;
    error_log /var/log/nginx/secureshop_error.log;

    # Frontend - React Router (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 30s;
    }

    # Configuración de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

### Activar el sitio

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/secureshop /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 🔒 Paso 9: Configurar Firewall

```bash
# Permitir SSH
sudo ufw allow 22/tcp

# Permitir HTTP y HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Habilitar firewall
sudo ufw enable

# Ver estado
sudo ufw status
```

## 🔐 Paso 10: Configurar HTTPS con Let's Encrypt (Recomendado)

⚠️ **Necesitas un dominio apuntando a tu IP para esto**

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL
sudo certbot --nginx -d tu-dominio.com

# Renovación automática (ya está configurada)
sudo certbot renew --dry-run
```

## 📊 Paso 11: Verificar la Instalación

### Verificar backend

```bash
pm2 logs secureshop-api
curl http://localhost:4000/health
```

Debería responder:
```json
{
  "success": true,
  "status": "OK",
  "timestamp": "2025-10-21T...",
  "environment": "production"
}
```

### Verificar frontend

Abre tu navegador y ve a:
- `http://149.50.148.6` → Debe mostrar la tienda

### Verificar API pública

```bash
curl http://149.50.148.6/api/planes
```

## 🔧 Comandos Útiles de PM2

```bash
# Ver logs en tiempo real
pm2 logs secureshop-api

# Reiniciar aplicación
pm2 restart secureshop-api

# Detener aplicación
pm2 stop secureshop-api

# Eliminar de PM2
pm2 delete secureshop-api

# Ver monitoreo en tiempo real
pm2 monit

# Ver información detallada
pm2 show secureshop-api

# Ver lista de procesos
pm2 list
```

## 🐛 Troubleshooting

### La API no responde

```bash
# Ver logs
pm2 logs secureshop-api --lines 100

# Verificar que el puerto esté libre
netstat -tulpn | grep 4000

# Reiniciar
pm2 restart secureshop-api
```

### Nginx muestra error 502

```bash
# Verificar que el backend esté ejecutándose
pm2 list

# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Base de datos no se crea

```bash
# Verificar permisos
cd ~/secureshop-vpn/backend
ls -la database/

# Si no existe, crear directorio
mkdir -p database
chmod 755 database
```

### Error de CORS

Asegúrate de que `CORS_ORIGIN` en `.env` coincida con la URL de tu frontend.

## 📝 Configurar Webhook de MercadoPago

1. Inicia sesión en tu cuenta de MercadoPago
2. Ve a **Desarrolladores** → **Tus integraciones**
3. Selecciona tu aplicación
4. En **Webhooks**, agrega la URL:
   ```
   http://149.50.148.6/api/webhook
   ```
   O con dominio:
   ```
   https://tu-dominio.com/api/webhook
   ```

## 🔄 Actualizar la Aplicación

```bash
cd ~/secureshop-vpn

# Obtener últimos cambios
git pull

# Backend
cd backend
npm install
npm run build
pm2 restart secureshop-api

# Frontend
cd ../frontend
npm install
npm run build

# Nginx recargará automáticamente los archivos estáticos
```

## 📊 Monitoreo y Logs

### Ver logs de la aplicación

```bash
# PM2
pm2 logs

# Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Usar PM2 Plus (opcional - monitoreo avanzado)

```bash
pm2 link [secret_key] [public_key]
```

## 🔐 Backup de la Base de Datos

```bash
# Crear script de backup
nano ~/backup-db.sh
```

Contenido:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp ~/secureshop-vpn/backend/database/secureshop.db ~/backups/secureshop_$DATE.db
# Mantener solo los últimos 7 backups
ls -t ~/backups/secureshop_*.db | tail -n +8 | xargs rm -f
```

```bash
# Hacer ejecutable
chmod +x ~/backup-db.sh

# Crear directorio de backups
mkdir -p ~/backups

# Agregar a cron (ejecutar diariamente a las 2 AM)
crontab -e
```

Agregar esta línea:

```
0 2 * * * /home/secureshop/backup-db.sh
```

## ✅ Checklist de Despliegue

- [ ] Node.js instalado
- [ ] PM2 instalado
- [ ] Backend configurado con variables de entorno correctas
- [ ] Backend compilado y ejecutándose en PM2
- [ ] Frontend compilado
- [ ] Nginx instalado y configurado
- [ ] Firewall configurado
- [ ] SSL configurado (si tienes dominio)
- [ ] Webhook de MercadoPago configurado
- [ ] Probado crear una compra de prueba
- [ ] Backup automático configurado

## 🎉 ¡Listo!

Tu tienda VPN debería estar funcionando en:
- **Frontend**: http://149.50.148.6
- **API**: http://149.50.148.6/api
- **Health Check**: http://149.50.148.6/api/health

---

**¿Problemas?** Revisa los logs con `pm2 logs secureshop-api` y los logs de Nginx en `/var/log/nginx/`.

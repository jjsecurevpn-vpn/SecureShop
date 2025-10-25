# 🚀 Guía Rápida de Despliegue - VPS 149.50.148.6

## Opción 1: Despliegue Automático (Recomendado)

### Requisitos previos:
1. Acceso SSH al VPS configurado
2. Usuario root o sudo en el VPS

### Pasos:

```bash
# 1. Desde tu máquina local, en la carpeta del proyecto:
cd /c/Users/JHServices/Documents/SecureShop/secureshop-vpn

# 2. Hacer el script ejecutable
chmod +x deploy.sh

# 3. Ejecutar el despliegue
bash deploy.sh
```

El script:
- ✅ Verificará la conexión al VPS
- ✅ Instalará Node.js, PM2 y Nginx
- ✅ Creará el usuario de aplicación
- ✅ Subirá todos los archivos
- ✅ Compilará backend y frontend
- ✅ Configurará PM2 para mantener el backend corriendo
- ✅ Configurará Nginx como reverse proxy
- ✅ Configurará el firewall

### Después del script:

El script te pedirá configurar las variables de entorno. Conéctate al servidor:

```bash
ssh root@149.50.148.6
su - secureshop
cd secureshop-vpn/backend
nano .env
```

Pega el contenido de `.env.production` que ya está preparado con tus credenciales.

---

## Opción 2: Despliegue Manual

### 1. Conectar al VPS

```bash
ssh root@149.50.148.6
```

### 2. Instalar dependencias

```bash
# Actualizar sistema
apt update && apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Instalar herramientas
apt install -y git nginx
npm install -g pm2
```

### 3. Crear usuario de aplicación

```bash
adduser --disabled-password --gecos "" secureshop
su - secureshop
```

### 4. Subir archivos

Desde tu máquina local:

```bash
cd /c/Users/JHServices/Documents/SecureShop

# Subir archivos (sin node_modules)
rsync -avz --exclude 'node_modules' --exclude 'dist' --exclude '.git' \
    secureshop-vpn/ root@149.50.148.6:/home/secureshop/secureshop-vpn/
```

### 5. Configurar backend

En el VPS:

```bash
su - secureshop
cd secureshop-vpn/backend

# Copiar archivo de entorno de producción
cp .env.production .env

# Instalar dependencias
npm install --production

# Compilar
npm run build

# Iniciar con PM2
pm2 start npm --name "secureshop-api" -- start
pm2 save
pm2 startup
```

### 6. Configurar frontend

```bash
cd ../frontend

# Copiar archivo de entorno
cp .env.production .env

# Instalar y compilar
npm install
npm run build
```

### 7. Configurar Nginx

Como root:

```bash
exit  # Salir del usuario secureshop

# Crear configuración
cat > /etc/nginx/sites-available/secureshop << 'EOF'
server {
    listen 80;
    server_name 149.50.148.6;

    root /home/secureshop/secureshop-vpn/frontend/dist;
    index index.html;

    access_log /var/log/nginx/secureshop_access.log;
    error_log /var/log/nginx/secureshop_error.log;

    location / {
        try_files $uri $uri/ /index.html;
    }

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
    }
}
EOF

# Activar sitio
ln -sf /etc/nginx/sites-available/secureshop /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Verificar y reiniciar
nginx -t
systemctl restart nginx
systemctl enable nginx
```

### 8. Configurar firewall

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

---

## 🔍 Verificación

### Verificar que todo funciona:

```bash
# Health check
curl http://149.50.148.6/api/health

# Ver planes
curl http://149.50.148.6/api/planes

# Ver logs
su - secureshop
pm2 logs secureshop-api
```

### Abrir en el navegador:

- **Frontend**: http://149.50.148.6
- **API**: http://149.50.148.6/api/health

---

## 📝 Configurar Webhook de MercadoPago

1. Ve a https://www.mercadopago.com.ar/developers
2. Entra a tu aplicación
3. En **Webhooks**, configura:
   ```
   http://149.50.148.6/api/webhook
   ```

---

## 🔄 Actualizar la aplicación

Cuando hagas cambios, usa el script de actualización:

```bash
# Desde tu máquina local
cd /c/Users/JHServices/Documents/SecureShop/secureshop-vpn
bash update.sh
```

---

## 🐛 Comandos útiles

```bash
# Ver logs en tiempo real
ssh root@149.50.148.6 -t "su - secureshop -c 'pm2 logs secureshop-api'"

# Reiniciar aplicación
ssh root@149.50.148.6 -t "su - secureshop -c 'pm2 restart secureshop-api'"

# Ver estado de PM2
ssh root@149.50.148.6 -t "su - secureshop -c 'pm2 status'"

# Ver logs de Nginx
ssh root@149.50.148.6 "tail -f /var/log/nginx/error.log"
```

---

## 🔒 (Opcional) Configurar HTTPS con dominio

Si tienes un dominio apuntando a 149.50.148.6:

```bash
ssh root@149.50.148.6

# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Obtener certificado
certbot --nginx -d tu-dominio.com

# Actualizar .env con HTTPS
su - secureshop
cd secureshop-vpn/backend
nano .env
# Cambiar MP_WEBHOOK_URL a https://tu-dominio.com/api/webhook
# Cambiar CORS_ORIGIN a https://tu-dominio.com

# Reiniciar
pm2 restart secureshop-api
```

---

## ✅ Checklist

- [ ] SSH configurado para acceder al VPS
- [ ] Node.js, PM2 y Nginx instalados
- [ ] Archivos subidos al servidor
- [ ] Variables de entorno configuradas (.env)
- [ ] Backend compilado y corriendo en PM2
- [ ] Frontend compilado
- [ ] Nginx configurado y corriendo
- [ ] Firewall habilitado
- [ ] Health check respondiendo: `curl http://149.50.148.6/api/health`
- [ ] Frontend accesible: http://149.50.148.6
- [ ] Webhook configurado en MercadoPago

---

## 📞 ¿Problemas?

1. **Backend no inicia**: `pm2 logs secureshop-api`
2. **Nginx error 502**: Verificar que PM2 esté corriendo
3. **CORS error**: Verificar CORS_ORIGIN en .env
4. **Webhook no funciona**: Verificar logs con `pm2 logs`

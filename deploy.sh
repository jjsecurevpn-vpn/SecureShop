#!/bin/bash

# Script de despliegue automatizado para SecureShop VPN
# VPS: 149.50.148.6

set -e

echo "🚀 Iniciando despliegue de SecureShop VPN..."
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
VPS_IP="149.50.148.6"
VPS_USER="root"
APP_USER="secureshop"
APP_DIR="/home/$APP_USER/secureshop-vpn"

echo -e "${YELLOW}📋 Información del despliegue:${NC}"
echo "  VPS IP: $VPS_IP"
echo "  Usuario: $VPS_USER"
echo "  Directorio: $APP_DIR"
echo ""

# Función para ejecutar comandos en el VPS
run_remote() {
    ssh $VPS_USER@$VPS_IP "$1"
}

# Paso 1: Verificar conexión
echo -e "${YELLOW}🔌 Verificando conexión al VPS...${NC}"
if ssh -o ConnectTimeout=5 $VPS_USER@$VPS_IP "echo 'Conexión exitosa'" 2>/dev/null; then
    echo -e "${GREEN}✅ Conexión establecida${NC}"
else
    echo -e "${RED}❌ No se pudo conectar al VPS${NC}"
    echo "Verifica que:"
    echo "  1. La IP sea correcta: $VPS_IP"
    echo "  2. Tengas acceso SSH"
    echo "  3. Tu clave SSH esté configurada"
    exit 1
fi

# Paso 2: Preparar el servidor
echo ""
echo -e "${YELLOW}📦 Preparando el servidor...${NC}"
run_remote "apt update -qq"

# Verificar si Node.js está instalado
echo -e "${YELLOW}🔍 Verificando Node.js...${NC}"
if run_remote "command -v node" > /dev/null; then
    NODE_VERSION=$(run_remote "node --version")
    echo -e "${GREEN}✅ Node.js ya instalado: $NODE_VERSION${NC}"
else
    echo -e "${YELLOW}📥 Instalando Node.js...${NC}"
    run_remote "curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt-get install -y nodejs"
    echo -e "${GREEN}✅ Node.js instalado${NC}"
fi

# Verificar si PM2 está instalado
echo -e "${YELLOW}🔍 Verificando PM2...${NC}"
if run_remote "command -v pm2" > /dev/null; then
    echo -e "${GREEN}✅ PM2 ya instalado${NC}"
else
    echo -e "${YELLOW}📥 Instalando PM2...${NC}"
    run_remote "npm install -g pm2"
    echo -e "${GREEN}✅ PM2 instalado${NC}"
fi

# Verificar si Nginx está instalado
echo -e "${YELLOW}🔍 Verificando Nginx...${NC}"
if run_remote "command -v nginx" > /dev/null; then
    echo -e "${GREEN}✅ Nginx ya instalado${NC}"
else
    echo -e "${YELLOW}📥 Instalando Nginx...${NC}"
    run_remote "apt install -y nginx"
    echo -e "${GREEN}✅ Nginx instalado${NC}"
fi

# Paso 3: Crear usuario de aplicación si no existe
echo ""
echo -e "${YELLOW}👤 Configurando usuario de aplicación...${NC}"
if run_remote "id -u $APP_USER" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Usuario $APP_USER ya existe${NC}"
else
    echo -e "${YELLOW}📝 Creando usuario $APP_USER...${NC}"
    run_remote "adduser --disabled-password --gecos '' $APP_USER"
    echo -e "${GREEN}✅ Usuario creado${NC}"
fi

# Paso 4: Subir archivos
echo ""
echo -e "${YELLOW}📤 Subiendo archivos al VPS...${NC}"
echo "Esto puede tomar varios minutos..."

# Crear directorio remoto
run_remote "mkdir -p $APP_DIR"

# Subir todo el proyecto (excluyendo node_modules)
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude 'dist' \
    --exclude '.git' \
    --exclude 'database/*.db' \
    ./ $VPS_USER@$VPS_IP:$APP_DIR/

echo -e "${GREEN}✅ Archivos subidos${NC}"

# Cambiar propietario
run_remote "chown -R $APP_USER:$APP_USER $APP_DIR"

# Paso 5: Configurar variables de entorno
echo ""
echo -e "${YELLOW}⚙️  Configurando variables de entorno...${NC}"
echo -e "${RED}⚠️  IMPORTANTE: Necesitas configurar las credenciales manualmente${NC}"
echo ""
echo "Ejecuta estos comandos:"
echo ""
echo -e "${YELLOW}ssh $VPS_USER@$VPS_IP${NC}"
echo -e "${YELLOW}su - $APP_USER${NC}"
echo -e "${YELLOW}cd $APP_DIR/backend${NC}"
echo -e "${YELLOW}nano .env${NC}"
echo ""
echo "Y configura:"
echo "  - SERVEX_API_KEY"
echo "  - MP_ACCESS_TOKEN"
echo "  - MP_PUBLIC_KEY"
echo "  - MP_WEBHOOK_URL=http://149.50.148.6/api/webhook"
echo "  - NODE_ENV=production"
echo ""
read -p "Presiona Enter cuando hayas configurado las variables..."

# Paso 6: Instalar dependencias y compilar
echo ""
echo -e "${YELLOW}📦 Instalando dependencias del backend...${NC}"
run_remote "su - $APP_USER -c 'cd $APP_DIR/backend && npm install --production'"
echo -e "${GREEN}✅ Dependencias del backend instaladas${NC}"

echo ""
echo -e "${YELLOW}🔨 Compilando backend...${NC}"
run_remote "su - $APP_USER -c 'cd $APP_DIR/backend && npm run build'"
echo -e "${GREEN}✅ Backend compilado${NC}"

echo ""
echo -e "${YELLOW}📦 Instalando dependencias del frontend...${NC}"
run_remote "su - $APP_USER -c 'cd $APP_DIR/frontend && npm install'"
echo -e "${GREEN}✅ Dependencias del frontend instaladas${NC}"

echo ""
echo -e "${YELLOW}🔨 Compilando frontend...${NC}"
run_remote "su - $APP_USER -c 'cd $APP_DIR/frontend && npm run build'"
echo -e "${GREEN}✅ Frontend compilado${NC}"

# Paso 7: Configurar PM2
echo ""
echo -e "${YELLOW}🚀 Configurando PM2...${NC}"

# Detener proceso anterior si existe
run_remote "su - $APP_USER -c 'pm2 delete secureshop-api || true'"

# Iniciar aplicación
run_remote "su - $APP_USER -c 'cd $APP_DIR/backend && pm2 start npm --name secureshop-api -- start'"

# Guardar configuración de PM2
run_remote "su - $APP_USER -c 'pm2 save'"

# Configurar inicio automático
run_remote "env PATH=\$PATH:/usr/bin pm2 startup systemd -u $APP_USER --hp /home/$APP_USER"

echo -e "${GREEN}✅ PM2 configurado${NC}"

# Paso 8: Configurar Nginx
echo ""
echo -e "${YELLOW}🌐 Configurando Nginx...${NC}"

# Crear configuración de Nginx
run_remote "cat > /etc/nginx/sites-available/secureshop << 'EOF'
server {
    listen 80;
    server_name $VPS_IP;

    # Frontend (archivos estáticos)
    root $APP_DIR/frontend/dist;
    index index.html;

    # Logs
    access_log /var/log/nginx/secureshop_access.log;
    error_log /var/log/nginx/secureshop_error.log;

    # Frontend - React Router (SPA)
    location / {
        try_files \\\$uri \\\$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
        proxy_cache_bypass \\\$http_upgrade;
        proxy_read_timeout 30s;
    }

    # Seguridad
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
}
EOF"

# Activar sitio
run_remote "ln -sf /etc/nginx/sites-available/secureshop /etc/nginx/sites-enabled/"
run_remote "rm -f /etc/nginx/sites-enabled/default"

# Verificar configuración
if run_remote "nginx -t"; then
    echo -e "${GREEN}✅ Configuración de Nginx válida${NC}"
    run_remote "systemctl restart nginx"
    run_remote "systemctl enable nginx"
    echo -e "${GREEN}✅ Nginx reiniciado${NC}"
else
    echo -e "${RED}❌ Error en configuración de Nginx${NC}"
    exit 1
fi

# Paso 9: Configurar Firewall
echo ""
echo -e "${YELLOW}🔒 Configurando firewall...${NC}"
run_remote "ufw allow 22/tcp"
run_remote "ufw allow 80/tcp"
run_remote "ufw allow 443/tcp"
run_remote "echo 'y' | ufw enable" || true
echo -e "${GREEN}✅ Firewall configurado${NC}"

# Verificación final
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 ¡Despliegue completado exitosamente!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📊 Verificación:${NC}"
echo ""

# Verificar PM2
echo -e "${YELLOW}Backend (PM2):${NC}"
run_remote "su - $APP_USER -c 'pm2 list'"

# Verificar Nginx
echo ""
echo -e "${YELLOW}Nginx:${NC}"
run_remote "systemctl status nginx --no-pager | head -5"

# URLs de acceso
echo ""
echo -e "${GREEN}🌍 Tu aplicación está disponible en:${NC}"
echo ""
echo -e "  Frontend:     ${GREEN}http://$VPS_IP${NC}"
echo -e "  API:          ${GREEN}http://$VPS_IP/api${NC}"
echo -e "  Health Check: ${GREEN}http://$VPS_IP/api/health${NC}"
echo ""

# Próximos pasos
echo -e "${YELLOW}📝 Próximos pasos:${NC}"
echo ""
echo "1. Verifica que la aplicación funcione:"
echo "   curl http://$VPS_IP/api/health"
echo ""
echo "2. Configura el webhook en MercadoPago:"
echo "   URL: http://$VPS_IP/api/webhook"
echo ""
echo "3. (Opcional) Configura un dominio y SSL:"
echo "   - Apunta tu dominio a $VPS_IP"
echo "   - Ejecuta: ssh $VPS_USER@$VPS_IP"
echo "   - Luego: certbot --nginx -d tu-dominio.com"
echo ""
echo "4. Ver logs:"
echo "   ssh $VPS_USER@$VPS_IP"
echo "   su - $APP_USER"
echo "   pm2 logs secureshop-api"
echo ""

echo -e "${GREEN}✅ ¡Todo listo!${NC}"

#!/bin/bash

# Script rápido de actualización
# Usar después del despliegue inicial

set -e

VPS_IP="149.50.148.6"
VPS_USER="root"
APP_USER="secureshop"
APP_DIR="/home/$APP_USER/secureshop-vpn"

echo "🔄 Actualizando SecureShop VPN en $VPS_IP..."

# Subir cambios
echo "📤 Subiendo archivos..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude 'dist' \
    --exclude '.git' \
    --exclude 'database/*.db' \
    --exclude '.env' \
    ./ $VPS_USER@$VPS_IP:$APP_DIR/

# Cambiar propietario
ssh $VPS_USER@$VPS_IP "chown -R $APP_USER:$APP_USER $APP_DIR"

# Actualizar backend
echo "🔨 Compilando backend..."
ssh $VPS_USER@$VPS_IP "su - $APP_USER -c 'cd $APP_DIR/backend && npm install --production && npm run build'"

# Actualizar frontend
echo "🔨 Compilando frontend..."
ssh $VPS_USER@$VPS_IP "su - $APP_USER -c 'cd $APP_DIR/frontend && npm install && npm run build'"

# Reiniciar PM2
echo "🚀 Reiniciando aplicación..."
ssh $VPS_USER@$VPS_IP "su - $APP_USER -c 'pm2 restart secureshop-api'"

echo "✅ Actualización completada"
echo ""
echo "Ver logs: ssh $VPS_USER@$VPS_IP -t 'su - $APP_USER -c \"pm2 logs secureshop-api\"'"

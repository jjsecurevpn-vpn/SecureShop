#!/bin/bash

# Script de deploy seguro para SecureShop VPN
# Este script evita conflictos de PM2 durante los deploys

echo "🚀 Iniciando deploy seguro..."

# Variables
REMOTE_HOST="root@149.50.148.6"
BACKEND_PATH="/home/secureshop/secureshop-vpn/backend"
FRONTEND_PATH="/home/secureshop/secureshop-vpn/frontend"

# Paso 1: Detener todos los procesos cleanly
echo "⏹️  Deteniendo procesos..."
ssh $REMOTE_HOST "pm2 stop all && sleep 2"

# Paso 2: Esperar a que los puertos se liberen
echo "⏳ Esperando liberación de puertos (5 segundos)..."
sleep 5

# Paso 3: Forzar liberación del puerto 4001 si persiste
echo "🔓 Liberando puerto 4001 si está ocupado..."
ssh $REMOTE_HOST "fuser -k 4001/tcp 2>/dev/null || true"

# Paso 4: Transferir archivos del frontend
echo "📤 Transferiendo frontend..."
scp -r ./frontend/dist/* $REMOTE_HOST:$FRONTEND_PATH/dist/ 2>/dev/null

# Paso 5: Esperar a que se transfieran los archivos
sleep 2

# Paso 6: Reiniciar PM2
echo "🔄 Reiniciando PM2..."
ssh $REMOTE_HOST "cd $BACKEND_PATH && pm2 start ecosystem.config.js && pm2 save"

# Paso 7: Verificar estado
echo "✅ Verificando estado..."
ssh $REMOTE_HOST "pm2 status"

echo "✨ Deploy completado exitosamente!"

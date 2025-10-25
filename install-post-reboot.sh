#!/bin/bash
# Script de instalación rápida después del reinicio del VPS

echo "🚀 Instalación SecureShop VPN - Post Reinicio"
echo ""

# Conectar y ejecutar todo
ssh root@149.50.148.6 << 'ENDSSH'

# Ir al directorio del proyecto
cd /home/secureshop/secureshop-vpn/backend

# Crear .env
cat > .env << 'EOF'
PORT=4000
NODE_ENV=production
SERVEX_API_KEY=sx_9c57423352279d267f4e93f3b14663c510c1c150fd788ceef393ece76a5f521c
SERVEX_BASE_URL=https://servex.ws/api
SERVEX_TIMEOUT=30000
MP_ACCESS_TOKEN=APP_USR-8757932973898001-081011-11b3d5038392a44bcbb684a733b5539d-222490274
MP_PUBLIC_KEY=APP_USR-59bd1954-749b-43c7-9bfc-1c1a5e26a22d
MP_WEBHOOK_URL=http://149.50.148.6/api/webhook
DATABASE_PATH=./database/secureshop.db
CORS_ORIGIN=http://149.50.148.6
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF

# Como root, instalar dependencias
echo "Instalando backend..."
su - secureshop -c 'cd secureshop-vpn/backend && npm install --omit=dev && npm run build'

# Frontend
cd /home/secureshop/secureshop-vpn/frontend
cat > .env << 'EOF'
VITE_API_URL=http://149.50.148.6/api
EOF

echo "Instalando frontend..."
su - secureshop -c 'cd secureshop-vpn/frontend && npm install && npm run build'

# PM2
echo "Iniciando con PM2..."
su - secureshop -c 'cd secureshop-vpn/backend && pm2 start npm --name secureshop-api -- start && pm2 save'

# Nginx
systemctl restart nginx

echo ""
echo "✅ Listo! Verifica: http://149.50.148.6"

ENDSSH

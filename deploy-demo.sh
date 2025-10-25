#!/bin/bash

# Script de Deploy para Demo Feature
# Actualizar backend y frontend en la VPS

VPS_USER="root"
VPS_HOST="149.50.148.6"
VPS_PATH="/home/secureshop/secureshop-vpn"

echo "🚀 Iniciando Deploy..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. Subir backend dist
echo "📦 Subiendo backend/dist..."
scp -r ./backend/dist root@${VPS_HOST}:${VPS_PATH}/backend/

# 2. Subir frontend dist
echo "📦 Subiendo frontend/dist..."
scp -r ./frontend/dist root@${VPS_HOST}:${VPS_PATH}/frontend/

# 3. Conectar y ejecutar scripts en VPS
echo "🔄 Ejecutando scripts en VPS..."
ssh root@${VPS_HOST} << 'EOF'
  # Ir a carpeta del proyecto
  cd /home/secureshop/secureshop-vpn
  
  # Crear tabla de demos en la BD
  echo "📋 Creando tabla de demos en SQLite..."
  sqlite3 data/database.db < database/crear_tabla_demos.sql
  
  # Reiniciar PM2
  echo "♻️  Reiniciando proceso PM2..."
  pm2 restart all
  
  # Esperar a que se reinicie
  sleep 5
  
  # Verificar health del backend
  echo "✅ Verificando health del backend..."
  curl -s http://localhost/api/planes | head -c 100
  
  echo ""
  echo "🎉 Deploy completado exitosamente!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
EOF

echo "✨ Completado!"

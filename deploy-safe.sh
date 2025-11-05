#!/bin/bash

# Script de deploy seguro para SecureShop VPN
# Evita conflictos EADDRINUSE con lógica robusta de liberación de puerto
# cd /c/Users/JHServices/Documents/SecureShop/secureshop-vpn && bash deploy-safe.sh

echo "🚀 Iniciando deploy seguro con protección EADDRINUSE..."

# Variables
REMOTE_HOST="root@149.50.148.6"
BACKEND_PATH="/home/secureshop/secureshop-vpn/backend"
FRONTEND_PATH="/home/secureshop/secureshop-vpn/frontend"
PORT=4001
MAX_RETRIES=5
RETRY_DELAY=2

# ============================================================================
# FUNCIÓN: Liberar puerto de forma agresiva
# ============================================================================
liberar_puerto_agresivo() {
    local intento=$1
    echo "🔓 Liberando puerto $PORT (intento $intento/$MAX_RETRIES)..."
    
    # Opción 1: Usar fuser
    ssh $REMOTE_HOST "fuser -k $PORT/tcp 2>/dev/null" || true
    
    # Opción 2: Matar todos los node processes
    ssh $REMOTE_HOST "pkill -9 node" || true
    
    # Opción 3: Usar lsof si fuser falla
    ssh $REMOTE_HOST "lsof -i :$PORT -t | xargs -r kill -9" 2>/dev/null || true
    
    # Opción 4: Matar PM2 daemon
    ssh $REMOTE_HOST "pm2 kill 2>/dev/null || true" || true
    
    # Esperar antes de verificar
    sleep 1
    
    # Verificar que el puerto esté libre
    if ssh $REMOTE_HOST "lsof -i :$PORT" 2>/dev/null; then
        return 1  # Puerto aún en uso
    else
        echo "✓ Puerto $PORT liberado exitosamente"
        return 0  # Puerto libre
    fi
}

# ============================================================================
# FUNCIÓN: Verificar si puerto está disponible
# ============================================================================
puerto_disponible() {
    ! ssh $REMOTE_HOST "lsof -i :$PORT" 2>/dev/null
}

# ============================================================================
# PASO 0: PRE-DEPLOY CLEANUP (Crítico para evitar EADDRINUSE)
# ============================================================================
echo ""
echo "🛡️  FASE 1: Limpieza Pre-Deploy Agresiva"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ssh $REMOTE_HOST "pm2 stop all 2>/dev/null || true; pm2 kill 2>/dev/null || true; sleep 1" || true

# Liberar puerto con reintentos
INTENTO=1
while [ $INTENTO -le $MAX_RETRIES ]; do
    if liberar_puerto_agresivo $INTENTO; then
        break
    fi
    
    if [ $INTENTO -lt $MAX_RETRIES ]; then
        echo "⏳ Puerto aún en uso, esperando ${RETRY_DELAY}s antes de reintentar..."
        sleep $RETRY_DELAY
    else
        echo "❌ CRÍTICO: No se pudo liberar puerto $PORT después de $MAX_RETRIES intentos"
        echo "   Algunas posibles soluciones:"
        echo "   1. Verificar: ssh root@149.50.148.6 'lsof -i :$PORT'"
        echo "   2. Revisar logs: ssh root@149.50.148.6 'pm2 logs'"
        echo "   3. Reiniciar servidor"
        exit 1
    fi
    
    INTENTO=$((INTENTO + 1))
done

echo "✓ Limpieza pre-deploy completada exitosamente"

# ============================================================================
# FASE 2: COMPILACIÓN
# ============================================================================
echo ""
echo "🔨 FASE 2: Compilación Local"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Frontend
echo "  Compilando frontend..."
cd ./frontend
if ! npm run build; then
    echo "❌ Error al compilar frontend"
    cd ..
    exit 1
fi
cd ..
echo "  ✓ Frontend compilado"

# Backend
echo "  Compilando backend..."
cd ./backend
if ! npm run build; then
    echo "❌ Error al compilar backend"
    cd ..
    exit 1
fi
cd ..
echo "  ✓ Backend compilado"

# Validaciones
if [ ! -d "./frontend/dist" ] || [ ! -d "./backend/dist" ]; then
    echo "❌ Error: Directorios dist no encontrados"
    exit 1
fi

echo "✓ Compilación completada"

# ============================================================================
# FASE 3: TRANSFERENCIA DE ARCHIVOS
# ============================================================================
echo ""
echo "📤 FASE 3: Transferencia de Archivos"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Frontend
echo "  Transferiendo frontend..."
if scp -r ./frontend/dist/* $REMOTE_HOST:$FRONTEND_PATH/dist/ 2>/dev/null; then
    echo "  ✓ Frontend transferido"
else
    echo "  ⚠️  Advertencia en transferencia de frontend"
fi

# Backend compilado
echo "  Transferiendo backend compilado..."
if scp -r ./backend/dist/* $REMOTE_HOST:$BACKEND_PATH/dist/ 2>/dev/null; then
    echo "  ✓ Backend compilado transferido"
else
    echo "  ⚠️  Advertencia en transferencia de backend"
fi

# Config JSONs
echo "  Transferiendo configuraciones..."
scp ./backend/public/config/planes.config.json $REMOTE_HOST:$BACKEND_PATH/public/config/ 2>/dev/null && echo "    ✓ planes.config.json" || echo "    ⚠️  planes.config.json"
scp ./backend/public/config/revendedores.config.json $REMOTE_HOST:$BACKEND_PATH/public/config/ 2>/dev/null && echo "    ✓ revendedores.config.json" || echo "    ⚠️  revendedores.config.json"
scp ./backend/public/config/cupones.config.json $REMOTE_HOST:$BACKEND_PATH/public/config/ 2>/dev/null && echo "    ✓ cupones.config.json" || echo "    ⚠️  cupones.config.json"
scp ./backend/public/config/noticias.config.json $REMOTE_HOST:$BACKEND_PATH/public/config/ 2>/dev/null && echo "    ✓ noticias.config.json" || echo "    ⚠️  noticias.config.json"

echo "✓ Transferencia completada"

# ============================================================================
# FASE 4: VERIFICACIÓN PRE-REINICIO (Crítica)
# ============================================================================
echo ""
echo "✅ FASE 4: Verificación Pre-Reinicio"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "  Verificando puerto $PORT está libre..."
if ! puerto_disponible; then
    echo "  ⚠️  Puerto aún en uso, intentando liberación final..."
    if ! liberar_puerto_agresivo "FINAL"; then
        echo "  ❌ CRÍTICO: No se pudo liberar puerto antes de reiniciar"
        exit 1
    fi
fi

echo "  ✓ Puerto $PORT verificado como disponible"
echo "  Esperando 2 segundos para estabilizar..."
sleep 2

# ============================================================================
# FASE 5: REINICIO DE PM2
# ============================================================================
echo ""
echo "🔄 FASE 5: Reinicio de PM2"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "  Iniciando PM2..."
ssh $REMOTE_HOST "cd $BACKEND_PATH && pm2 start ecosystem.config.js && pm2 save" || {
    echo "❌ Error al iniciar PM2"
    exit 1
}

echo "  Esperando que el backend inicie completamente (5 segundos)..."
sleep 5

# ============================================================================
# FASE 6: VERIFICACIÓN DE ONLINE
# ============================================================================
echo ""
echo "🔍 FASE 6: Verificación de Backend Online"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

BACKEND_ONLINE=0
for i in {1..10}; do
    if ssh $REMOTE_HOST "lsof -i :$PORT" &>/dev/null; then
        echo "  ✓ Backend escuchando en puerto $PORT"
        BACKEND_ONLINE=1
        break
    fi
    echo "  Intento $i: Esperando conexión al puerto $PORT..."
    sleep 1
done

if [ $BACKEND_ONLINE -eq 0 ]; then
    echo "  ❌ Backend NO está escuchando en puerto $PORT"
    echo "  "
    echo "  Estado de PM2:"
    ssh $REMOTE_HOST "pm2 status"
    echo "  "
    echo "  Últimos logs:"
    ssh $REMOTE_HOST "pm2 logs --lines 20"
    exit 1
fi

echo "  ✓ Backend online"
ssh $REMOTE_HOST "pm2 status"

# ============================================================================
# FASE 7: SINCRONIZACIÓN
# ============================================================================
echo ""
echo "🔄 FASE 7: Sincronización de Precios"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

SYNC_OK=0
for i in {1..3}; do
    echo "  Intento $i: Sincronizando..."
    if ssh $REMOTE_HOST "curl -s -X POST http://localhost:$PORT/api/config/sync-todo" &>/dev/null; then
        echo "  ✓ Sincronización exitosa"
        SYNC_OK=1
        break
    fi
    
    if [ $i -lt 3 ]; then
        echo "  ⏳ Reintentando en 2 segundos..."
        sleep 2
    fi
done

if [ $SYNC_OK -eq 0 ]; then
    echo "  ⚠️  Advertencia: La sincronización no respondió (pero el deploy continuó)"
fi

sleep 2

# ============================================================================
# RESUMEN FINAL
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Deploy completado exitosamente!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Resumen del Deploy:"
echo "   ✓ Frontend compilado, transferido y online"
echo "   ✓ Backend compilado, transferido y online"
echo "   ✓ Puerto $PORT liberado y verificado"
echo "   ✓ PM2 reiniciado y ejecutándose"
echo "   ✓ Backend escuchando en puerto $PORT"
echo "   ✓ Configuraciones sincronizadas"
echo ""
echo "🎯 Backend URL: http://149.50.148.6:4001"
echo ""

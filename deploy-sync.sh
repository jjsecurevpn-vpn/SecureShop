#!/bin/bash

# SecureShop VPN - Script de Despliegue Automático
# Sincroniza backend, frontend y reinicia servicios en VPS

set -e  # Salir si hay algún error

echo "🚀 Iniciando despliegue automático de SecureShop VPN..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes coloreados
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "No se encuentra la estructura de directorios esperada (backend/ y frontend/)"
    print_error "Ejecuta este script desde la raíz del proyecto: ./deploy-sync.sh"
    exit 1
fi

print_status "Verificando estructura del proyecto..."
if [ -f "backend/package.json" ] && [ -f "frontend/package.json" ]; then
    print_success "Estructura del proyecto verificada ✓"
else
    print_error "Archivos package.json no encontrados"
    exit 1
fi

# Paso 1: Build del Backend
print_status "🔨 Construyendo backend..."
cd backend
if npm run build; then
    print_success "Backend construido exitosamente ✓"
else
    print_error "Error al construir el backend"
    exit 1
fi
cd ..

# Paso 2: Build del Frontend
print_status "🎨 Construyendo frontend..."
cd frontend
if npm run build; then
    print_success "Frontend construido exitosamente ✓"
else
    print_error "Error al construir el frontend"
    exit 1
fi
cd ..

# Paso 3: Subir Backend al VPS
print_status "📤 Subiendo backend al VPS..."
if scp -r ./backend/dist root@149.50.148.6:/home/secureshop/secureshop-vpn/backend/; then
    print_success "Backend subido exitosamente ✓"
else
    print_error "Error al subir el backend"
    exit 1
fi

# Paso 4: Subir Frontend al VPS
print_status "📤 Subiendo frontend al VPS..."
if scp -r ./frontend/dist root@149.50.148.6:/home/secureshop/secureshop-vpn/frontend/; then
    print_success "Frontend subido exitosamente ✓"
else
    print_error "Error al subir el frontend"
    exit 1
fi

# Paso 5: Reiniciar servicios en VPS
print_status "🔄 Reiniciando servicios en VPS..."
if ssh -t root@149.50.148.6 "cd /home/secureshop/secureshop-vpn && pm2 restart secureshop-backend"; then
    print_success "Servicios reiniciados exitosamente ✓"
else
    print_error "Error al reiniciar servicios"
    exit 1
fi

print_success "🎉 ¡Despliegue completado exitosamente!"
print_status "SecureShop VPN está actualizado y funcionando"
echo ""
print_status "📊 Resumen del despliegue:"
echo "  ✅ Backend construido y subido"
echo "  ✅ Frontend construido y subido"
echo "  ✅ Servicios reiniciados"
echo ""
print_status "🌐 Tu aplicación está lista en: https://tu-dominio.com"
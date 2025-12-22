# ✅ CHECKLIST - SISTEMA DE NOTICIAS PRODUCCIÓN

## 1️⃣ EJECUTAR EN SUPABASE (SQL)
```
Copiar contenido de: supabase/migrations/009_noticias_system.sql
Ir a: https://supabase.com/dashboard/project/[TU_PROJECT]/sql/new
Pegar y ejecutar
```

## 2️⃣ BACKEND - Reiniciar servidor
```bash
cd backend
npm run dev
# O reinicia si está corriendo
```

## 3️⃣ FRONTEND - Instalar y generar tipos (opcional pero recomendado)
```bash
cd frontend
npm run build
# Si hay errores de tipos, revisar imports en:
# - frontend/src/types/index.ts
# - frontend/src/hooks/useNoticiasDB.ts
```

## 4️⃣ PROBAR EN ADMIN
1. Abre el AdminTools (http://localhost:5173)
2. Ve a Panel → Avisos (debería mostrar nuevo sistema)
3. Click "+ Nueva Noticia"
4. Prueba crear una noticia:
   - Título: "Test"
   - Descripción: "Descripción de prueba"
   - Categoría: Selecciona una
   - Click Guardar

## 5️⃣ VERIFICAR EN BD (SQL)
```sql
SELECT * FROM noticias;
SELECT * FROM noticia_categories;
```

## 6️⃣ PRUEBAS DE API (opcional)

### Obtener noticias públicas
```bash
curl http://localhost:3000/api/noticias
```

### Crear noticia (admin)
```bash
curl -X POST http://localhost:3000/api/admin/noticias \
  -H "Content-Type: application/json" \
  -d '{
    "titulo":"Test",
    "descripcion":"Test",
    "categoria_id":"[UUID_CATEGORIA]",
    "estado":"publicada"
  }'
```

## 7️⃣ VERIFICAR COMPONENTES

✅ Frontend:
- NoticiasManagementSection.tsx
- NoticiasFormModal.tsx
- NoticiasList.tsx
- NoticiasFilters.tsx
- NoticiasCard.tsx
- NoticiasPopoverSeccion.tsx
- useNoticiasDB.ts hook

✅ Backend:
- noticias.service.ts
- noticias.routes.ts
- Registrado en server.ts

✅ Database:
- 009_noticias_system.sql

## 8️⃣ CAMBIOS REALIZADOS AUTOMÁTICAMENTE

✅ backend/src/server.ts
   - Importado: noticiasRouter
   - Registrado: this.app.use("/api", noticiasRouter)

✅ frontend/src/types/index.ts
   - Agregados tipos: Noticia, NoticiaCategoria, CrearNoticia, etc.

✅ frontend/src/pages/AdminToolsPage/index.tsx
   - Importado: NoticiasManagementSection
   - Reemplazada: Lógica de "noticias" en renderSectionContent()

✅ frontend/src/pages/AdminToolsPage/components/index.ts
   - Exportados: NoticiasManagementSection, NoticiasFormModal, etc.

## 9️⃣ ENDPOINTS DISPONIBLES

```
GET  /api/noticias                 - Listar noticias públicas
GET  /api/noticias?categoria=slug  - Filtrar por categoría
GET  /api/noticias/:id             - Detalle
GET  /api/noticias/categorias/todas - Todas las categorías

POST   /api/admin/noticias         - Crear
PUT    /api/admin/noticias/:id     - Actualizar
DELETE /api/admin/noticias/:id     - Eliminar
PATCH  /api/admin/noticias/:id/estado - Cambiar estado
POST   /api/admin/categorias       - Crear categoría
```

## 🔟 LISTO PARA PRODUCCIÓN

Una vez verificado todo:
```bash
# Backend
npm run build && npm start

# Frontend
npm run build
# Deploy dist/ a hosting
```

---

## ⚠️ IMPORTANTE

- La migración 009_noticias_system.sql crea todas las tablas, índices y RLS policies
- Los cambios de código ya están implementados
- No necesitas hacer nada más que ejecutar la migración SQL y reiniciar servidores
- El sistema está 100% integrado en AdminTools

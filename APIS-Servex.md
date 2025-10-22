# 🚀 Servex API – Documentación Simplificada

Bienvenido a la API de **Servex**, una plataforma diseñada para gestionar clientes, revendedores, categorías y datos en tiempo real mediante WebSockets.

---

## 🔐 Autenticación

Todas las peticiones requieren una **API Key**, enviada en el encabezado HTTP:




**Dónde obtenerla:**
- 👨‍💼 **Admin:** Configurações  
- 💼 **Revendedor:** Menú del perfil (header)

---

## 👤 Clientes

### ➤ Listar clientes
**GET** `https://servex.ws/api/clients`  
*(Admin / Revendedor)*  

**Parámetros opcionales:**
| Parámetro | Tipo | Descripción |
|------------|------|-------------|
| `page` | integer | Página actual (default: 1) |
| `limit` | integer | Ítems por página (default: 10) |
| `search` | string | Buscar por usuario, UUID o nota |
| `status` | string | `active`, `expired`, `expires_today`, `expires_soon`, `suspended` |
| `scope` | string | `meus` (default), `todos` (admin), `dos_revendedores` |
| `resellerId` | integer | Filtra por ID de revendedor |

---

### ➤ Crear cliente
**POST** `https://servex.ws/api/clients`

**Campos:**
| Campo | Tipo | Descripción |
|--------|------|-------------|
| `username` | string | Usuario del cliente |
| `password` | string | Contraseña |
| `category_id` | integer | ID de la categoría |
| `connection_limit` | integer | Límite de conexiones |
| `duration` | integer | Días (user) o minutos (test) |
| `type` | string | `user` o `test` |
| `observation` | string | (Opcional) Notas |
| `v2ray_uuid` | string | (Opcional) UUID V2Ray |
| `owner_id` | integer | (Opcional, Admin) ID de revendedor |

---

### ➤ Editar cliente
**PUT** `https://servex.ws/api/clients/{id}`  
Modifica campos existentes.

### ➤ Eliminar cliente
**DELETE** `https://servex.ws/api/clients/{id}`

### ➤ Renovar cliente
**POST** `https://servex.ws/api/clients/{id}/renew`  
Campos: `days` → días a añadir

### ➤ Suspender / Reactivar cliente
**PUT** `https://servex.ws/api/clients/{id}/suspend`

---

## 💼 Revendedores

### ➤ Listar revendedores
**GET** `https://servex.ws/api/resellers`  
*(Admin / Revendedor)*

**Parámetros:**  
`page`, `limit`, `search`, `status`, `scope`

---

### ➤ Crear revendedor
**POST** `https://servex.ws/api/resellers`

| Campo | Tipo | Descripción |
|--------|------|-------------|
| `name` | string | Nombre |
| `username` | string | Usuario |
| `password` | string | Contraseña |
| `max_users` | integer | Límite de usuarios o créditos |
| `account_type` | string | `validity` o `credit` |
| `category_ids` | array | IDs de categorías permitidas |
| `expiration_date` | string | (Obligatorio si `validity`) formato `YYYY-MM-DD` |
| `obs` | string | (Opcional) Observaciones |

---

### ➤ Editar revendedor
**PUT** `https://servex.ws/api/resellers/{id}`  
Campos opcionales iguales al POST.

### ➤ Eliminar revendedor
**DELETE** `https://servex.ws/api/resellers/{id}`  
Elimina el revendedor y toda su jerarquía.

### ➤ Renovar revendedor
**POST** `https://servex.ws/api/resellers/{id}/renew`  
Campo: `days`

### ➤ Activar / Desactivar revendedor
**PUT** `https://servex.ws/api/resellers/{id}/toggle-status`

---

## 📂 Categorías

### ➤ Listar categorías
**GET** `https://servex.ws/api/categories`  
(Admin / Revendedor)  
Devuelve solo las categorías disponibles para el usuario.

---

### ➤ Crear categoría
**POST** `https://servex.ws/api/categories`  
(Admin)

| Campo | Tipo | Descripción |
|--------|------|-------------|
| `name` | string | Nombre |
| `description` | string | (Opcional) Descripción |
| `limiter_active` | boolean | (Opcional) Activa limitador (default: false) |

---

### ➤ Editar categoría
**PUT** `https://servex.ws/api/categories/{id}`  
(Admin)  
Permite actualizar nombre, descripción o limitador.

### ➤ Eliminar categoría
**DELETE** `https://servex.ws/api/categories/{id}`  
(Admin)  
Solo si no tiene vínculos con servidores, clientes o revendedores.

---

## 🔄 WebSockets API (Datos en tiempo real)

Para información en tiempo real, la API usa **WebSockets**.

### 1️⃣ Obtener token temporal
**GET** `https://servex.ws/api/auth/sse-token`

**Respuesta:**
```json
{
  "token": "ey...",
  "exp": 1678886400
}


wss://front.servex.ws/ws/{endpoint}?token={token}


const ws = new WebSocket(`wss://front.servex.ws/ws/user-status?token=${token}`);

| Endpoint              | Acceso             | Descripción                                             |
| --------------------- | ------------------ | ------------------------------------------------------- |
| `/ws/server-status`   | Admin              | Estado de CPU, RAM, usuarios online                     |
| `/ws/command-updates` | Admin              | Actualizaciones de comandos (instalación, etc.)         |
| `/ws/user-status`     | Admin / Revendedor | Estado de clientes (online/offline, conexiones, método) |


{
  "type": "update_filter",
  "usernames": ["cliente1", "cliente2"]
}


📎 Notas finales

API base: https://servex.ws/api

WebSocket base: wss://front.servex.ws/ws

Autenticación: Bearer Token

Tokens SSE expiran en 24 horas


-- Tabla para planes de revendedores
CREATE TABLE IF NOT EXISTS planes_revendedores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio REAL NOT NULL,
  max_users INTEGER NOT NULL, -- Límite de usuarios o créditos
  account_type TEXT NOT NULL CHECK(account_type IN ('validity', 'credit')),
  dias INTEGER, -- Solo para cuentas de validez
  activo INTEGER DEFAULT 1,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para pagos de revendedores
CREATE TABLE IF NOT EXISTS pagos_revendedores (
  id TEXT PRIMARY KEY,
  plan_revendedor_id INTEGER NOT NULL,
  monto REAL NOT NULL,
  estado TEXT NOT NULL CHECK(estado IN ('pendiente', 'aprobado', 'rechazado', 'cancelado')),
  metodo_pago TEXT NOT NULL,
  cliente_email TEXT NOT NULL,
  cliente_nombre TEXT NOT NULL,
  mp_payment_id TEXT,
  mp_preference_id TEXT,
  servex_revendedor_id INTEGER,
  servex_username TEXT,
  servex_password TEXT,
  servex_max_users INTEGER,
  servex_account_type TEXT,
  servex_expiracion TEXT,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (plan_revendedor_id) REFERENCES planes_revendedores(id)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_pagos_revendedores_email ON pagos_revendedores(cliente_email);
CREATE INDEX IF NOT EXISTS idx_pagos_revendedores_estado ON pagos_revendedores(estado);
CREATE INDEX IF NOT EXISTS idx_pagos_revendedores_mp_payment ON pagos_revendedores(mp_payment_id);
CREATE INDEX IF NOT EXISTS idx_planes_revendedores_activo ON planes_revendedores(activo);

-- Insertar planes de ejemplo
INSERT INTO planes_revendedores (nombre, descripcion, precio, max_users, account_type, dias) 
VALUES ('Revendedor Básico', 'Plan inicial con 30 días de validez', 15000, 50, 'validity', 30);

INSERT INTO planes_revendedores (nombre, descripcion, precio, max_users, account_type, dias) 
VALUES ('Revendedor Pro', 'Plan profesional con 30 días de validez', 25000, 100, 'validity', 30);

INSERT INTO planes_revendedores (nombre, descripcion, precio, max_users, account_type) 
VALUES ('Revendedor Créditos 50', 'Plan con 50 créditos', 10000, 50, 'credit');

INSERT INTO planes_revendedores (nombre, descripcion, precio, max_users, account_type) 
VALUES ('Revendedor Créditos 100', 'Plan con 100 créditos', 18000, 100, 'credit');

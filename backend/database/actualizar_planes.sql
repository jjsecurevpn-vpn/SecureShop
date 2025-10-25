-- Limpiar planes existentes
DELETE FROM planes;

-- PLANES CORTOS (7-15 días)

-- 7 DÍAS
INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit) 
VALUES ('Plan Básico 7D', '1 dispositivo - 7 días', 7, 3000, 1, 1);

INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit) 
VALUES ('Plan Doble 7D', '2 dispositivos - 7 días', 7, 5000, 1, 2);

INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit) 
VALUES ('Plan Triple 7D', '3 dispositivos - 7 días', 7, 7000, 1, 3);

INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit) 
VALUES ('Plan Familiar 7D', '4 dispositivos - 7 días', 7, 9000, 1, 4);

-- 15 DÍAS
INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit) 
VALUES ('Plan Básico 15D', '1 dispositivo - 15 días', 15, 4500, 1, 1);

INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit) 
VALUES ('Plan Doble 15D', '2 dispositivos - 15 días', 15, 7000, 1, 2);

INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit) 
VALUES ('Plan Triple 15D', '3 dispositivos - 15 días', 15, 10000, 1, 3);

INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit) 
VALUES ('Plan Familiar 15D', '4 dispositivos - 15 días', 15, 12000, 1, 4);

-- PLANES LARGOS (30 días)

INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit) 
VALUES ('Plan Básico 30D', '1 dispositivo - 30 días', 30, 6000, 1, 1);

INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit) 
VALUES ('Plan Doble 30D', '2 dispositivos - 30 días', 30, 10000, 1, 2);

INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit) 
VALUES ('Plan Triple 30D', '3 dispositivos - 30 días', 30, 12000, 1, 3);

INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit) 
VALUES ('Plan Familiar 30D', '4 dispositivos - 30 días', 30, 15000, 1, 4);


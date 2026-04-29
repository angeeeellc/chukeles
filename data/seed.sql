-- Script de inicialización para Chukeles
-- Este archivo se ejecuta automáticamente al levantar el contenedor mysql por primera vez

CREATE DATABASE IF NOT EXISTS chukeles;
USE chukeles;

-- Las tablas se crearán automáticamente por Hibernate (JPA) en la Fase 1
-- Este archivo servirá para insertar los ~40 lugares reales de A Coruña en la Fase 1.

-- Ejemplo de estructura inicial (comentado):
-- CREATE TABLE IF NOT EXISTS places (...);
-- INSERT INTO places (name, category, ...) VALUES (...);

SELECT 'Base de datos chukeles inicializada correctamente' AS message;

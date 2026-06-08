-- Seed data para Chukeles - A Coruna pet-friendly

-- Desactivar checks para limpieza total (MySQL)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE lugares;
TRUNCATE TABLE usuarios;
TRUNCATE TABLE publicaciones_tablon;
TRUNCATE TABLE anuncios_mercado;
TRUNCATE TABLE eventos;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Carga de usuarios (Especificando ID explícito para consistencia de FKs)
INSERT INTO usuarios (id, email, contrasena, nombre, telefono, rol, foto_url, bloqueado) VALUES
(1, 'admin@chukeles.es',   '$2a$12$vdwKm82fWRYBwDxdumH6F.8Y1iYEBfaUxD8Dd.yCIONRDxe5sMCZu', 'Administrador',  '600000000', 'ROL_ADMIN',   NULL, false),
(2, 'usuario@chukeles.es', '$2a$12$QOlR2Q1luwRAVg0HuR.b4eWWBWG6.pshhH18iTRiNDDKvK/TUUqRK', 'Usuario Prueba', '611111111', 'ROL_USUARIO', NULL, false);

-- 2. Carga de lugares
INSERT INTO lugares (nombre, categoria, direccion, lat, lng, descripcion, telefono, sitio_web, foto_url, aprobado) VALUES
('Parque de Santa Margarita', 'PARQUE', 'Rua de Santa Margarita, s/n, 15005 A Coruna', 43.3617, -8.4125, 'Extenso parque ideal para pasear con perros, con amplias zonas verdes y mucha sombra.', '981 18 42 00', '', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800', true),
('Clinica Veterinaria Elvina', 'VETERINARIO', 'Rua Pintor Luis Mosquera, 4, 15008 A Coruna', 43.3461, -8.4105, 'Servicio de urgencias y medicina general para mascotas.', '981 91 81 61', 'https://elvinavets.com', 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&q=80&w=800', true),
('Playa de Riazor (Zona Canina)', 'PARQUE', 'Paseo Maritimo, 15004 A Coruna', 43.3691, -8.4091, 'Habilitada para perros durante la temporada permitida (consultar normativa municipal).', '', '', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800', true),
('El Arca Centro Veterinario', 'VETERINARIO', 'Av. Primo de Rivera, 8, 15006 A Coruna', 43.3596, -8.4035, 'Especialistas en cirugia y diagnostico avanzado.', '981 15 45 92', 'https://elarcaveterinaria.es', 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&q=80&w=800', true),
('Parque de Bens', 'PARQUE', 'Lugar de Bens, s/n, 15008 A Coruna', 43.3668, -8.4423, 'Antiguo vertedero convertido en un parque inmenso con vistas al mar y zona canina vallada.', '', '', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800', true),
('Avenida Poodle', 'PELUQUERIA', 'Calle Rafael Alberti, 17, 15008 A Coruna', 43.3421, -8.4111, 'Peluqueria canina de alta gama y tienda de accesorios.', '698 97 62 86', 'https://avenidapoodle.es', 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=800', true),
('Dog Beach Riazor', 'PET_FRIENDLY', 'Praia de Riazor, 15004 A Coruna', 43.3691, -8.4091, 'Zona de arena permitida para perros en periodos especificos.', '', '', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800', true),
('Parque de Eiris', 'PARQUE', 'Rua Lamadosa, s/n, 15009 A Coruna', 43.3466, -8.3957, 'Parque moderno con zona de juegos y areas para mascotas.', '', '', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800', true),
('Clinica Veterinaria Canis', 'VETERINARIO', 'Rua Antonio Machado, 24, 15008 A Coruna', 43.3471, -8.4077, 'Clinica veterinaria con servicios integrales para tu mascota.', '981 23 23 23', 'https://cvcanis.com', 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=800', true),
('Montegatto Residencial', 'HOTEL', 'Lugar das Viñas, s/n, 15380 Oza dos Ríos, A Coruña', 43.2216, -8.1993, 'Residencia canina y centro de adiestramiento a las afueras de la ciudad.', '600 00 00 00', 'https://montegatto.com', 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&q=80&w=800', true),
('Miss Maruja', 'PET_FRIENDLY', 'Rua Zalaeta, 4, 15002 A Coruna', 43.3730, -8.4002, 'Cafeteria muy popular para desayunos y brunch, admite perros.', '696 21 87 71', '', 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=800', true),
('Waco Coffee', 'PET_FRIENDLY', 'Rua Alameda, 22, 15003 A Coruna', 43.3671, -8.4051, 'Cafe de especialidad en ambiente moderno. Dog friendly.', '881 12 13 14', '', 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=800', true),
('Arnica Cafe', 'PET_FRIENDLY', 'Rua Herrerias, 2, 15001 A Coruna', 43.3712, -8.3930, 'Establecimiento muy bien valorado en la comunidad perruna.', '881 12 13 15', '', 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&q=80&w=800', true),
('Cafe Universal', 'PET_FRIENDLY', 'Rua San Andres, 1, 15003 A Coruna', 43.3714, -8.4002, 'Clasico de la ciudad con un ambiente relajado, perfecto para ir con mascota.', '881 12 13 16', '', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800', true),
('Inzo Coffee', 'PET_FRIENDLY', 'Rua Rosalia de Castro, 2, 15004 A Coruna', 43.3655, -8.4072, 'Excelente opcion para los amantes del buen cafe que van acompanados de su perro.', '881 12 13 17', '', 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=800', true),
('Restaurante Peculiar', 'PET_FRIENDLY', 'Rua Galera, 24, 15003 A Coruna', 43.3704, -8.4001, 'Apuesta por productos frescos y de calidad, ambiente pet friendly.', '981 97 58 97', '', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800', true),
('La Teresa Coruna', 'PET_FRIENDLY', 'Rua Capitan Troncoso, 14, 15001 A Coruna', 43.3710, -8.3947, 'Cocina local con toques italianos donde tu perro es bienvenido.', '881 12 13 18', '', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800', true),
('Canton 23', 'PET_FRIENDLY', 'Canton Pequeno, 23, 15003 A Coruna', 43.3668, -8.4045, 'Lugar versatil para cafe, picoteo o cenas en el centro.', '881 12 13 19', '', 'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&q=80&w=800', true),
('Nana Pancha', 'PET_FRIENDLY', 'Rua Alameda, 44, 15003 A Coruna', 43.3679, -8.4058, 'Tacos artesanales y autentica comida mexicana dog friendly.', '881 12 13 20', '', 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?auto=format&fit=crop&q=80&w=800', true),
('Casto', 'PET_FRIENDLY', 'Rua Galera, 2, 15003 A Coruna', 43.3708, -8.3993, 'Vino, cocteles y bocados sofisticados en un entorno amigable con animales.', '881 12 13 21', '', 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800', true),
('Kohlanta', 'PET_FRIENDLY', 'Plaza Cormelana, 1, 15003 A Coruna', 43.3685, -8.4061, 'Restaurante tailandes con platos originales que admite mascotas.', '881 12 13 22', '', 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&q=80&w=800', true),
('El Valentin', 'PET_FRIENDLY', 'Rua San Agustin, 30, 15001 A Coruna', 43.3714, -8.3989, 'Platos saludables, poke bowls y bagels caseros pet friendly.', '881 12 13 23', '', 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800', true),
('Kiwoko Marineda', 'TIENDA', 'CC Marineda City, 15008 A Coruna', 43.3461, -8.4272, 'Gran tienda de animales y accesorios.', '881 12 13 24', 'https://www.kiwoko.com', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800', true),
('Tiendanimal Espacio', 'TIENDA', 'CC Espacio Coruna, 15008 A Coruna', 43.3376, -8.4104, 'Todo lo que necesitas para tu mascota.', '881 12 13 25', 'https://www.tiendanimal.es', 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&q=80&w=800', true),
('Parque de la Torre de Hercules', 'PARQUE', 'Av. Navarra s/n, 15002 A Coruna', 43.3859, -8.4065, 'Amplia zona verde alrededor de la Torre, perfecta para pasear con perros.', '', '', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800', true),
('Veterinario Anubis', 'VETERINARIO', 'Rua Sargento Provisional, 27, 15006 A Coruna', 43.3542, -8.4098, 'Clinica veterinaria con urgencias 24 horas y servicio de peluqueria.', '981 22 46 09', '', 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&q=80&w=800', true),
('Hospital Atlantico Veterinario', 'VETERINARIO', 'Rua Maestranza, 31, 15001 A Coruna', 43.3720, -8.3982, 'Hospital veterinario de referencia con UCI y cirugia especializada.', '981 20 03 24', 'https://hospitalatlanticoveterinario.com', 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&q=80&w=800', true),
('Paraiso del Can', 'PELUQUERIA', 'Av. Conchiñas, 16, 15010 A Coruna', 43.3619, -8.4191, 'Peluqueria canina con servicio a domicilio y productos naturales.', '981 26 78 90', '', 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=800', true),
('Quinta das Mascotas', 'HOTEL', 'Lugar Quintans, 23, 15008 A Coruna', 43.3299, -8.4183, 'Residencia para perros y gatos con amplios espacios y atencion personalizada.', '609 12 34 56', 'https://quintadasmascotas.com', 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&q=80&w=800', true),
('Parque Adolfo Suarez', 'PARQUE', 'Rúa San Pedro de Visma, 15011 A Coruna', 43.3703, -8.4299, 'Parque amplio con zona de paseo para perros y senderos arbolados.', '', '', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800', true),
('Centro Canino Gaia', 'ADIESTRAMIENTO', 'Polg. Ind. A Grela, Nave 12, 15008 A Coruna', 43.3382, -8.4255, 'Centro de adiestramiento, agility y comportamiento animal.', '981 45 67 89', 'https://centrocaninoGaia.es', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800', true),
('Cafe Malabar', 'PET_FRIENDLY', 'Rua Compostela, 4, 15003 A Coruna', 43.3695, -8.4020, 'Cafe con encanto en el centro, terraza y ambiente tranquilo dog friendly.', '881 12 13 26', '', 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&q=80&w=800', true),
('Tiendanimal Oleiros', 'TIENDA', 'Av. Das Mariñas, N-VI, km. 585, 15171 Oleiros', 43.3212, -8.3169, 'Tienda especializada en alimentacion natural y accesorios premium para mascotas.', '981 34 56 78', '', 'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&q=80&w=800', true);

-- 3. Carga de publicaciones del tablón
INSERT INTO publicaciones_tablon (id, titulo, contenido, info_contacto, user_id, creado_en) VALUES
(1, 'Busco paseador de perros en zona de Riazor', 'Hola! Necesito a alguien de confianza que pueda pasear a mi golden retriever los martes y jueves por la tarde. Zona del paseo marítimo/Riazor.', 'Contacto: 655 44 33 22 (Martín)', 2, '2026-05-17 10:00:00'),
(2, 'Campamento canino este fin de semana', 'Os informo de que quedan plazas libres para el campamento de socialización que organiza Montegatto este sábado. ¡Muy recomendable!', 'Más info en la web de Montegatto', 2, '2026-05-17 12:30:00');

-- 4. Carga de anuncios de mercado (tienda)
INSERT INTO anuncios_mercado (id, titulo, precio, descripcion, foto_url, categoria, estado, info_contacto, user_id, creado_en) VALUES
(1, 'Transportín homologado mediano', 45.0, 'Vendo transportín en perfecto estado, usado solo dos veces. Medidas 60x40x40 cm. Homologado por IATA para viajar en avión.', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800', 'ACCESORIOS', 'DISPONIBLE', 'Martín - 655 44 33 21', 2, '2026-05-17 09:15:00'),
(2, 'Arnés ajustable Julius K9 (Talla L)', 25.0, 'Arnés de color rojo reflectante, ultra resistente. Ideal para perros de raza mediana a grande (20-30 kg). Prácticamente nuevo.', 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=800', 'ACCESORIOS', 'DISPONIBLE', 'Laura - 655 44 33 22', 2, '2026-05-17 11:45:00');

-- 5. Carga de quedadas caninas (eventos)
INSERT INTO eventos (id, titulo, fecha, hora, ubicacion, lat, lng, max_participantes, descripcion, user_id) VALUES
(1, 'Quedada Golden Retrievers en Bens', '2026-06-20', '11:00:00', 'Parque de Bens (Zona Canina)', 43.3668, -8.4423, 15, 'Quedada informal para pasar la mañana, correr y socializar a nuestros peludos en la zona vallada de Bens. ¡Traed agua!', 2),
(2, 'Paseo grupal por Santa Margarita', '2026-06-27', '18:30:00', 'Entrada principal de Santa Margarita', 43.3617, -8.4125, 10, 'Paseo tranquilo con correa por las zonas arboladas del parque. Excelente para perros tímidos o en proceso de socialización.', 2);


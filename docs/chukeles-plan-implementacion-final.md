# 🐶 Plan de Implementación — Chukeles
> **A Coruña con tu perro** · Documentación de estado final · Junio 2026

---

## Stack tecnológico implementado

| Capa | Tecnología |
|---|---|
| **Backend** | Java 21 · Spring Boot 3.3.4 · Spring Data JPA · Spring Security · JWT (JJWT 0.12.6) · Lombok |
| **Base de datos (dev)** | H2 en fichero (`./data/chukeles`) con modo MySQL, consola habilitada |
| **Base de datos (prod)** | MySQL 8 (contenedor Docker) |
| **Frontend** | React 19 · Vite 8 · TypeScript 6 · Tailwind CSS 3.4 · React Router DOM v7 · Zustand 5 |
| **Mapa** | Google Maps JavaScript API — `@react-google-maps/api` v2 |
| **Imágenes** | `MultipartFile` → volumen Docker `/app/uploads` (max 10 MB) |
| **Documentación API** | Springdoc OpenAPI 2.6 / Swagger UI |
| **Infraestructura** | Docker Compose · Dockerfile multi-stage (backend y frontend) · Nginx |
| **Hosting (producción)** | Sliplane — 3 servicios desplegados: `chukeles_frontend`, `chukeles_backend`, `chukeles_bd` |
| **CI/CD** | GitHub Actions |
| **Iconos** | FontAwesome 7 (SVG Core + Free Solid) |
| **HTTP Client** | Axios con interceptores JWT y manejo global de errores |

---

## 🌿 Estrategia de ramas Git

```
main            ← código estable y presentable
  └── develop   ← integración de funcionalidades terminadas
```

---

## 📋 Fases implementadas

| Fase | Contenido | Estado |
|---|---|---|
| 0 | Setup, Git, Docker, estructura base | ✅ Completa |
| 1 | Base de datos, modelos y seed de A Coruña | ✅ Completa |
| 2 | Autenticación JWT y API core | ✅ Completa |
| 3 | Frontend base y Google Maps | ✅ Completa |
| 4 | Integración completa y filtros avanzados | ✅ Completa |
| 5 | Panel de administración | ✅ Completa |
| 6 | Subida de fotos | ✅ Completa |
| 7 | Tablón de anuncios | ✅ Completa |
| 8 | Marketplace + Quedadas caninas | ✅ Completa |
| 9 | Docker final, CI/CD, README | ✅ Completa |

---

## FASE 0 — Setup y configuración del entorno

### Estructura de carpetas

```
chukeles/
├── backend/            ← Spring Boot (Java 21)
├── frontend/           ← React + Vite + TypeScript
├── data/               ← seed.sql con lugares reales de A Coruña
├── docs/               ← Documentación del proyecto
├── uploads/            ← Fotos subidas en desarrollo local
├── .github/workflows/  ← CI/CD con GitHub Actions
├── docker-compose.yml  ← Orquestación de los 3 servicios
├── .env                ← Variables de entorno (no commitear)
└── .env.example        ← Plantilla de variables de entorno
```

### Variables de entorno (`.env`)

| Variable | Propósito | Valor por defecto |
|---|---|---|
| `DB_ROOT_PASSWORD` | Contraseña root de MySQL | `root` |
| `DB_USER` | Usuario de la BD | `chukeles_user` |
| `DB_PASSWORD` | Contraseña de la BD | `chukeles_pass` |
| `DB_NAME` | Nombre de la base de datos | `chukeles` |
| `SPRING_PROFILES_ACTIVE` | Perfil Spring activo | `dev` |
| `SERVER_PORT` | Puerto del backend | `8080` |
| `UPLOADS_PATH` | Ruta de uploads | `./uploads` |
| `VITE_API_URL` | URL base del backend para el frontend | `http://localhost:8080` |
| `VITE_GOOGLE_MAPS_KEY` | API Key de Google Maps | *(requerida)* |
| `COMPOSE_PROJECT_NAME` | Nombre del proyecto en Docker | `chukeles_app` |

### Entregable
`docker-compose up --build` levanta los tres servicios sin errores.

---

## FASE 1 — Base de datos, modelos y seed

### Entidades implementadas

#### `Usuario` — tabla `usuarios`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | Long | PK, auto-generado |
| `email` | String | Único, validación `@Email` |
| `contrasena` | String | BCrypt, `@JsonIgnore` en respuestas |
| `nombre` | String | Nombre del usuario |
| `telefono` | String | Opcional |
| `rol` | Enum `Rol` | `ROL_USUARIO` / `ROL_ADMIN` |
| `fotoUrl` | String | Opcional |
| `bloqueado` | boolean | Por defecto `false` |

#### `Lugar` — tabla `lugares`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | Long | PK, auto-generado |
| `nombre` | String | Único, obligatorio |
| `categoria` | Enum `Categoria` | Ver valores abajo |
| `direccion` | String | Obligatoria |
| `lat` | Double | Latitud geográfica |
| `lng` | Double | Longitud geográfica |
| `descripcion` | String | TEXT, opcional |
| `telefono` | String | Opcional |
| `sitioWeb` | String | Opcional |
| `fotoUrl` | String | URL relativa (`/uploads/...`) |
| `aprobado` | Boolean | Por defecto `false` |

**Categorías de lugar (`Categoria`):**
`VETERINARIO · PELUQUERIA · PET_FRIENDLY · PARQUE · TIENDA · HOTEL · ADIESTRAMIENTO · OTRO`

#### `Evento` — tabla `eventos`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | Long | PK |
| `titulo` | String | Obligatorio |
| `fecha` | LocalDate | Obligatoria |
| `hora` | LocalTime | Obligatoria |
| `ubicacion` | String | Descripción textual |
| `lat` / `lng` | Double | Coordenadas opcionales |
| `maxParticipantes` | Integer | Opcional |
| `descripcion` | String | TEXT, opcional |
| `usuario` | `@ManyToOne` Usuario | Creador del evento |
| `participantes` | `@ManyToMany` Set\<Usuario\> | Tabla `evento_participantes` |
| `creadoEn` | LocalDateTime | Auto `@PrePersist` |

#### `AnuncioMercado` — tabla `anuncios_mercado`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | Long | PK |
| `titulo` | String | Obligatorio |
| `precio` | Double | Obligatorio |
| `descripcion` | String | TEXT |
| `fotoUrl` | String | URL relativa opcional |
| `categoria` | Enum `CategoriaMercado` | Ver valores abajo |
| `estado` | String | `DISPONIBLE` / `VENDIDO` |
| `infoContacto` | String | Datos de contacto |
| `usuario` | `@ManyToOne` Usuario | Autor |
| `creadoEn` | LocalDateTime | Auto `@PrePersist` |

**Categorías de mercado (`CategoriaMercado`):**
`COMIDA · ACCESORIOS · ROPA · JUGUETES · SALUD · OTRO`

#### `PublicacionTablon` — tabla `publicaciones_tablon`
| Campo | Tipo | Notas |
|---|---|---|
| `id` | Long | PK |
| `titulo` | String | Obligatorio |
| `contenido` | String | TEXT, obligatorio |
| `tipo` | Enum `TipoPublicacion` | `DUDA` / `INFO` |
| `fotoUrl` | String | Foto adjunta opcional |
| `infoContacto` | String | Datos de contacto |
| `usuario` | `@ManyToOne` Usuario | `EAGER`, autor |
| `creadoEn` | LocalDateTime | Auto `@PrePersist` |

> **Nota de diseño:** Las ventas tienen su propio módulo (`/api/mercado`). El tablón solo admite `DUDA` e `INFO`.

### Seed de datos — `data.sql`

El fichero `src/main/resources/data.sql` contiene ~40 lugares reales de A Coruña en todas las categorías, insertados con coordenadas reales.

El `DataSeeder` (implementa `CommandLineRunner`) lo ejecuta automáticamente solo si la tabla `lugares` está vacía, evitando duplicados en cada reinicio.

En Docker (prod), el fichero `data/seed.sql` se monta en `/docker-entrypoint-initdb.d/` para ser ejecutado por MySQL en el primer arranque.

---

## FASE 2 — Autenticación JWT y API core

### Seguridad implementada

| Clase | Responsabilidad |
|---|---|
| `JwtUtil` | Generación y validación de tokens HMAC-SHA512 |
| `JwtFiltroAutenticacion` | Intercepta cada request, valida `Authorization: Bearer <token>` |
| `ServicioDetallesUsuario` | Implementa `UserDetailsService` para Spring Security |
| `ConfiguracionSeguridad` | Define cadena de filtros, rutas públicas/privadas, CORS, BCrypt |

**Configuración de sesión:** Stateless (sin cookies de sesión del servidor).

### Rutas de autenticación

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/auth/registro` | Público | Registrar usuario |
| POST | `/api/auth/login` | Público | Login, devuelve token JWT |
| GET | `/api/auth/yo` | Autenticado | Datos del usuario actual |
| GET | `/api/auth/forzar-admin` | Público* | Asignar rol admin por email |

> ⚠️ El endpoint `/api/auth/forzar-admin` es un helper de desarrollo. No tiene protección de token, solo comprueba si el email existe.

### Matriz de permisos por ruta

| Nivel de acceso | Rutas |
|---|---|
| **Público (GET)** | `/api/lugares/**` · `/api/categorias/**` · `/api/eventos/**` · `/api/tablon/**` · `/api/mercado/**` · `/uploads/**` |
| **Público (todos los métodos)** | `/api/auth/**` · `/swagger-ui/**` · `/v3/api-docs/**` · `/h2-console/**` |
| **Solo `ROL_ADMIN`** | `POST/PUT/DELETE /api/lugares/**` · `GET/PUT/DELETE /api/admin/**` · `POST /api/fotos/lugares/**` |
| **Autenticado (cualquier rol)** | Todo lo demás (`anyRequest().authenticated()`) |

> El control de autor vs. admin en `DELETE /api/mercado/{id}`, `DELETE /api/eventos/{id}` y `DELETE /api/tablon/{id}` se delega a la capa de servicio.

### CORS

Configuración permisiva (todos los orígenes, métodos GET/POST/PUT/DELETE/OPTIONS, credenciales habilitadas). Apta para desarrollo local y Docker interno.

---

## FASE 3 — Frontend base y Google Maps

### Diseño visual

- **Colores principales:** Verde bosque (`forest-green`, `#15803d`) y blanco.
- **Tipografía:** Inter (Google Fonts, cargada en `index.html`).
- **Layout:** Full viewport height (`h-[100dvh]`), navbar fijo + contenido scrollable.
- **Responsive:** Mobile-first. Menú hamburguesa en móvil, menú horizontal en desktop.

### Rutas del frontend

| Ruta | Componente | Descripción |
|---|---|---|
| `/` | `Inicio` | Mapa principal + buscador + lista de lugares |
| `/place/:id` | `DetalleLugar` | Detalle de un lugar con foto, datos e iframe de Maps |
| `/eventos` | `Eventos` | Listado de quedadas caninas con join/leave |
| `/tablon` | `TablonAnuncios` | Tablón comunitario (DUDA / INFO) |
| `/mercado` | `Mercado` | Marketplace de productos caninos |
| `/iniciar-sesion` | `IniciarSesion` | Formulario de login |
| `/registro` | `Registro` | Formulario de registro |
| `/admin/*` | `PanelAdministrador` | Panel de administración (protegido) |
| `/quienes-somos` | `QuienesSomos` | Página informativa del proyecto |
| `*` | `NoEncontrado` | Página 404 personalizada |

### Componente Google Maps — `ComponenteMapa.tsx`

- Renderiza marcadores para todos los lugares visibles.
- `InfoWindow` al hacer click en un marcador (nombre, categoría, botón "Ver detalle").
- Sincronización bidireccional con la lista: click en tarjeta → centra mapa; click en marcador → resalta tarjeta.
- Botón "¿Cómo llegar?" → abre Google Maps nativo en nueva pestaña.

### Componente Google Maps para admin — `ComponenteMapaAdmin.tsx`

- Permite al admin hacer click en el mapa para seleccionar coordenadas.
- Marcador móvil que se actualiza al hacer click.
- Los campos `lat` / `lng` del formulario se rellenan automáticamente.

### Estado global con Zustand

| Store | Fichero | Contenido |
|---|---|---|
| `useUserStore` | `estadoUsuario.ts` | `user`, `token`, `isAuthenticated`, `login()`, `logout()` |
| `usePlaceStore` | `estadoLugar.ts` | `lugares`, `lugarSeleccionado`, filtros activos |
| `useUiStore` | `estadoUi.ts` | `loading`, `toasts`, `addToast()` |

**Persistencia de sesión:** El token y datos del usuario se guardan en `localStorage` (si "recordar sesión" está activo) o `sessionStorage`. El interceptor de Axios los lee automáticamente.

### Custom Hook

- `useDebounce.ts` — debounce configurable para el buscador por nombre (evita llamadas al backend en cada tecla).

---

## FASE 4 — Integración completa y filtros avanzados

### Cliente API — `clienteApi.ts`

Instancia de Axios configurada con:
- `baseURL: '/api'` (relativo, compatible con proxy Nginx en producción).
- **Interceptor de request:** inyecta `Authorization: Bearer <token>` si existe en `localStorage` o `sessionStorage`.
- **Interceptor de response:** manejo global de errores:
  - `401` → limpia sesión y redirige a `/iniciar-sesion`
  - `403` → toast de permisos
  - `404` → toast informativo
  - `5xx` → toast de error de servidor
  - Sin red → toast de conexión

### Filtros de búsqueda en `Inicio`

| Filtro | Implementación |
|---|---|
| **Por nombre** | Input con debounce 300 ms → `GET /api/lugares?nombre=X` |
| **Por categoría** | Chips seleccionables → `GET /api/lugares?categoria=Y` |
| **Por radio de distancia** | Slider 1–20 km + geolocalización del navegador → `GET /api/lugares?lat=A&lng=B&radio=R` (Haversine en backend) |
| **Combinados** | Todos los filtros son combinables entre sí |

### Filtro Haversine (backend)

El `ServicioLugar` implementa la fórmula Haversine en memoria sobre el resultado de la consulta JPA, filtrando los lugares cuya distancia al punto del usuario supera el radio indicado. Radio de la Tierra: 6371 km.

### UX y estados

- Skeleton loaders mientras cargan los datos.
- Mensaje "No hay resultados" si la búsqueda está vacía.
- Toast de éxito/error para todas las acciones mutantes.
- Navbar con indicador de sección activa (`NavLink` + clases condicionales).
- Página 404 personalizada con enlace al inicio.

---

## FASE 5 — Panel de administración

### Flujo de autenticación admin

- Ruta `/admin/login` (`IniciarSesionAdmin.tsx`) → formulario email + contraseña.
- Al autenticarse con `ROL_ADMIN`, el token se almacena en el store de Zustand + storage.
- Redirige automáticamente a `/admin`.
- Desde la navbar pública aparece un botón "Admin" (amarillo) si el usuario tiene `ROL_ADMIN`.

### Dashboard — `PanelAdministrador.tsx`

El panel tiene pestañas/secciones con:

| Sección | Funcionalidad |
|---|---|
| **Lugares** | Listado con botones Editar / Eliminar / Ver foto. Formulario de creación con mapa interactivo. |
| **Eventos** | Listado de todas las quedadas con botón Eliminar. |
| **Tablón** | Listado de todas las publicaciones con botón Eliminar. |
| **Mercado** | Listado de todos los anuncios con botón Eliminar. |
| **Usuarios** | Listado de usuarios, cambio de rol, bloqueo/desbloqueo, eliminación. |

### Formulario de lugar — `FormularioLugar.tsx`

- Todos los campos del modelo `Lugar` (nombre, categoría, dirección, lat, lng, descripción, teléfono, sitio web, foto URL, aprobado).
- Mapa interactivo con `ComponenteMapaAdmin` para seleccionar coordenadas con un click.
- Subida de foto mediante `POST /api/fotos/lugares/{id}` (multipart).
- Validaciones en cliente antes de enviar.

### Endpoints de administración de usuarios

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/admin/usuarios` | Listar todos los usuarios |
| PUT | `/api/admin/usuarios/{id}/rol` | Cambiar rol (`ROL_USUARIO` / `ROL_ADMIN`) |
| PUT | `/api/admin/usuarios/{id}/bloquear` | Bloquear o desbloquear usuario |
| DELETE | `/api/admin/usuarios/{id}` | Eliminar usuario |

> No se puede bloquear ni eliminar a otro administrador.

---

## FASE 6 — Subida de fotos

### Backend — `ServicioFotos`

- Valida extensión del archivo (`jpg`, `jpeg`, `png`, `gif`, `webp`).
- Valida tamaño máximo: 10 MB (configurable en `application.yml`).
- Genera nombre único: `{entidad}_{id}_{UUID}.{ext}`.
- Guarda en la ruta configurada en `chukeles.upload.ruta` (dev: `./uploads`, prod: `/app/uploads`).
- Devuelve la URL pública relativa `/uploads/{nombre}`.

### Endpoints de fotos

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/fotos/lugares/{id}` | Admin | Sube foto y la asocia a un lugar |
| POST | `/api/fotos/subir` | Autenticado | Sube foto genérica (para anuncios y eventos) |

### Servicio de archivos estáticos

`ConfiguracionRecursosEstaticos` registra el directorio `./uploads` (o `/app/uploads` en prod) como recurso estático en Spring, accesible en `GET /uploads/**` (ruta pública).

En Docker, Nginx también hace proxy de `/uploads` al backend, para que el frontend pueda obtener las imágenes en producción.

---

## FASE 7 — Tablón de anuncios

### Tipos de publicación

| Tipo | Descripción |
|---|---|
| `DUDA` | Pregunta o solicitud de consejo a la comunidad |
| `INFO` | Información útil compartida con la comunidad |

> Las ventas tienen su propio módulo en `/api/mercado`.

### Endpoints del tablón

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/tablon` | Público | Listar publicaciones (filtro `?tipo=DUDA` opcional) |
| GET | `/api/tablon/{id}` | Público | Detalle de una publicación |
| POST | `/api/tablon` | Autenticado | Crear publicación |
| PUT | `/api/tablon/{id}` | Autor | Editar publicación |
| DELETE | `/api/tablon/{id}` | Autor o admin | Eliminar publicación |

### Frontend — `TablonAnuncios.tsx`

- Listado con filtros por tipo (chips de color distinto por tipo).
- Tarjeta con tipo, título, contenido, fecha, info de contacto y foto (si la hay).
- Formulario con todos los campos (tipo, título, contenido, contacto, foto opcional).
- Botón "Eliminar" visible solo para el autor o admin (basado en `user.id`).
- Ordenación por fecha descendente con formato relativo ("hace X horas").

---

## FASE 8 — Marketplace y Quedadas caninas

### Marketplace

#### Endpoints

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/mercado` | Público | Listar (filtros `?categoria=X&estado=Y`) |
| GET | `/api/mercado/{id}` | Público | Detalle del anuncio |
| POST | `/api/mercado` | Autenticado | Publicar producto |
| PUT | `/api/mercado/{id}` | Autor | Editar anuncio |
| PUT | `/api/mercado/{id}/estado` | Autor | Cambiar estado (DISPONIBLE/VENDIDO) |
| DELETE | `/api/mercado/{id}` | Autor o admin | Eliminar |

#### Frontend — `Mercado.tsx`

- Grid de tarjetas con foto, título, precio y categoría destacados.
- Badge de estado: `Disponible` / `Vendido`.
- Filtros por categoría y estado.
- Formulario con subida de foto, precio obligatorio y datos de contacto.

### Quedadas caninas

#### Endpoints

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/eventos` | Público* | Listar eventos futuros |
| GET | `/api/eventos/{id}` | Público* | Detalle con participantes |
| POST | `/api/eventos` | Autenticado | Crear quedada |
| PUT | `/api/eventos/{id}` | Autor | Editar quedada |
| POST | `/api/eventos/{id}/unirse` | Autenticado | Apuntarse a la quedada |
| DELETE | `/api/eventos/{id}/salir` | Autenticado | Abandonar la quedada |
| DELETE | `/api/eventos/{id}` | Autor o admin | Eliminar quedada |

> *El listado de eventos acepta token opcional (`Principal` nullable) para indicar si el usuario ya se ha apuntado.

#### Frontend — `Eventos.tsx`

- Listado de todas las quedadas (pasadas y futuras) ordenadas por fecha.
- Tarjeta con título, fecha, hora, ubicación, número de participantes y descripción.
- Botón "Apuntarme" / "Ya estoy apuntado" condicional según estado del usuario.
- Formulario de creación con todos los campos del modelo `Evento`.
- Botón "Salir" para abandonar una quedada en la que ya estás.
- Botón "Eliminar" visible solo para el autor o admin.

---

## FASE 9 — DevOps, CI/CD y cierre

### Docker Compose — `docker-compose.yml`

Orquesta tres servicios en la red `chukeles_network`:

#### Servicio `mysql`
- Imagen: `mysql:8.0`
- Healthcheck cada 10 s con `mysqladmin ping`
- Volumen persistente `chukeles_mysql_data` en `/var/lib/mysql`
- Seed inicial montado desde `./data/seed.sql`

#### Servicio `backend`
- Build desde `./backend/Dockerfile` (multi-stage: Maven → JRE 21)
- Depende de `mysql` con `condition: service_healthy`
- Volumen `chukeles_uploads` en `/app/uploads`
- Variables de entorno: perfil `prod`, datasource MySQL, JWT, puerto 8080
- Healthcheck con `curl` a `/api/categorias`

#### Servicio `frontend`
- Build desde `./frontend/Dockerfile` (multi-stage: Node 20 → Nginx Alpine)
- `VITE_API_URL` y `VITE_GOOGLE_MAPS_KEY` pasadas como `ARG` en build
- Puerto host `5173:80`
- Nginx hace proxy de `/api` y `/uploads` al backend (`http://chukeles-backend:8080`)

### Dockerfiles

#### Backend — `backend/Dockerfile`
```
Build: maven:3.9.6-eclipse-temurin-21
  mvn clean package -DskipTests
Run: eclipse-temurin:21-jdk-jammy
  java -jar app.jar (perfil prod)
  VOLUME /app/uploads
  EXPOSE 8080
```

#### Frontend — `frontend/Dockerfile`
```
Build: node:20-alpine
  npm install + npm run build
  ARGs: VITE_API_URL, VITE_GOOGLE_MAPS_KEY
Run: nginx:alpine
  Copia dist/ a /usr/share/nginx/html
  Nginx con proxy a backend (DNS dinámico)
  EXPOSE 80
```

#### Nginx — `frontend/nginx.conf`
- `try_files $uri $uri/ /index.html` → soporte de SPA con React Router.
- `location /api` → proxy al backend (`http://chukeles-backend:8080`).
- `location /uploads` → proxy al backend para servir imágenes.
- `client_max_body_size 10M`.
- DNS resolver dinámico (inyectado en el CMD del Dockerfile).

### CI/CD — `.github/workflows/ci.yml`

**Triggers:** Push a `develop` + Pull Requests a `develop` y `main`.

#### Job `backend` (Java 21 · Maven)
1. Checkout del código.
2. Setup Java 21 (Temurin) con caché de Maven.
3. `chmod +x mvnw`
4. `./mvnw test --batch-mode` (usa H2 en memoria, sin MySQL).
5. Publica resultados Surefire como artefacto (retención 7 días).

#### Job `frontend` (Node 20 · Vite)
1. Checkout del código.
2. Setup Node.js 20 con caché de npm.
3. `npm install`
4. `npm run build` (con `VITE_GOOGLE_MAPS_KEY=CI_PLACEHOLDER_KEY`).
5. Publica `frontend/dist/` como artefacto (retención 7 días).

### Swagger / OpenAPI

Disponible en `http://localhost:8080/swagger-ui.html` (ruta pública).

Configurado en `ConfiguracionSwagger` con:
- Título: "Chukeles API", versión 1.0.0.
- Esquema de seguridad `Bearer` (JWT) para probar endpoints privados.
- Todos los controladores anotados con `@Tag`, `@Operation` y `@SecurityRequirement`.

---

## 📊 Resumen de funcionalidades implementadas

| Módulo | Funcionalidad | Estado |
|---|---|---|
| **Búsqueda** | Por nombre (debounce 300 ms) | ✅ |
| **Búsqueda** | Por categoría (chips) | ✅ |
| **Búsqueda** | Por radio de distancia (Haversine, 1–20 km) + geolocalización | ✅ |
| **Búsqueda** | Filtros combinados | ✅ |
| **Mapa** | Google Maps con marcadores e InfoWindow | ✅ |
| **Mapa** | Sincronización mapa ↔ lista | ✅ |
| **Mapa** | Botón "¿Cómo llegar?" (Google Maps nativo) | ✅ |
| **Mapa** | Mapa interactivo para admin (click → lat/lng) | ✅ |
| **Detalle lugar** | Foto, datos, iframe de navegación | ✅ |
| **Auth** | Registro de usuario | ✅ |
| **Auth** | Login con JWT (24 h) | ✅ |
| **Auth** | Persistencia en localStorage / sessionStorage | ✅ |
| **Auth** | Logout limpiando estado y storage | ✅ |
| **Auth** | Protección de rutas privadas | ✅ |
| **Auth** | Renovación automática (401 → redirige a login) | ✅ |
| **Admin** | Login admin separado | ✅ |
| **Admin** | CRUD completo de lugares | ✅ |
| **Admin** | Subida de foto a lugares | ✅ |
| **Admin** | Gestión de eventos, tablón, mercado | ✅ |
| **Admin** | Gestión de usuarios (rol, bloqueo, eliminación) | ✅ |
| **Fotos** | Subida genérica para usuarios autenticados | ✅ |
| **Fotos** | Servidas por Nginx en producción | ✅ |
| **Tablón** | CRUD de publicaciones (DUDA / INFO) | ✅ |
| **Tablón** | Filtro por tipo | ✅ |
| **Tablón** | Eliminar por autor o admin | ✅ |
| **Mercado** | CRUD de anuncios con foto y precio | ✅ |
| **Mercado** | Filtro por categoría y estado | ✅ |
| **Mercado** | Marcar como VENDIDO / DISPONIBLE | ✅ |
| **Eventos** | CRUD de quedadas caninas | ✅ |
| **Eventos** | Apuntarse / Salir de una quedada | ✅ |
| **Eventos** | Contador de participantes en tiempo real | ✅ |
| **DevOps** | Docker Compose (mysql + backend + frontend) | ✅ |
| **DevOps** | Dockerfiles multi-stage | ✅ |
| **DevOps** | Nginx como servidor de producción del frontend | ✅ |
| **DevOps** | Volúmenes persistentes (BD + uploads) | ✅ |
| **DevOps** | CI/CD con GitHub Actions | ✅ |
| **DevOps** | Swagger UI configurado y accesible | ✅ |
| **DevOps** | README completo | ✅ |
| **Hosting** | Desplegado en Sliplane (3 servicios: frontend, backend, BD) | ✅ |
| **Hosting** | URL pública: https://chukeles-frontend.sliplane.app | ✅ |
| **UX** | Toasts globales (éxito / error / info) | ✅ |
| **UX** | Skeleton loaders | ✅ |
| **UX** | Página 404 personalizada | ✅ |
| **UX** | Navbar responsive con menú hamburguesa | ✅ |
| **UX** | Página "Quiénes somos" | ✅ |

---

## 🗂️ Estructura de paquetes — Backend

```
com.chukeles.app/
├── ChukelesApplication.java
├── configuracion/
│   ├── ConfiguracionSeguridad.java   ← Spring Security + CORS
│   ├── ConfiguracionSwagger.java     ← OpenAPI / Swagger UI
│   ├── ConfiguracionRecursosEstaticos.java ← Sirve /uploads/**
│   └── DataSeeder.java               ← Seed automático al arrancar
├── controlador/
│   ├── ControladorAuth.java
│   ├── ControladorLugar.java
│   ├── ControladorEvento.java
│   ├── ControladorAnuncioMercado.java
│   ├── ControladorPublicacionTablon.java
│   ├── ControladorFotos.java
│   └── ControladorAdmin.java
├── servicio/
│   ├── ServicioAuth.java
│   ├── ServicioLugar.java            ← Haversine implementado aquí
│   ├── ServicioEvento.java           ← Lógica join/leave
│   ├── ServicioAnuncioMercado.java
│   ├── ServicioPublicacionTablon.java
│   └── ServicioFotos.java
├── repositorio/
│   ├── RepositorioUsuario.java
│   ├── RepositorioLugar.java
│   ├── RepositorioEvento.java
│   ├── RepositorioAnuncioMercado.java
│   └── RepositorioPublicacionTablon.java
├── modelo/
│   ├── Usuario.java · Lugar.java · Evento.java
│   ├── AnuncioMercado.java · PublicacionTablon.java
│   ├── Rol.java · Categoria.java · CategoriaMercado.java · TipoPublicacion.java
├── seguridad/
│   ├── JwtUtil.java
│   ├── JwtFiltroAutenticacion.java
│   └── ServicioDetallesUsuario.java
├── transferencia/           ← DTOs (Request/Response)
└── excepcion/               ← RecursoNoEncontradoException, etc.
```

## 🗂️ Estructura de paquetes — Frontend

```
src/
├── App.tsx                  ← Router, Navbar, rutas
├── main.tsx
├── index.css
├── componentes/
│   ├── ComponenteMapa.tsx          ← Google Maps público
│   ├── ComponenteMapaAdmin.tsx     ← Google Maps admin (click → coords)
│   ├── Notificacion.tsx            ← Toast notifications
│   └── Footer.tsx
├── paginas/
│   ├── Inicio.tsx           ← Mapa + buscador + lista
│   ├── DetalleLugar.tsx
│   ├── Eventos.tsx
│   ├── TablonAnuncios.tsx
│   ├── Mercado.tsx
│   ├── QuienesSomos.tsx
│   ├── NoEncontrado.tsx
│   ├── auth/
│   │   ├── IniciarSesion.tsx
│   │   └── Registro.tsx
│   └── admin/
│       ├── PanelAdministrador.tsx
│       ├── IniciarSesionAdmin.tsx
│       └── FormularioLugar.tsx
├── servicios/
│   ├── clienteApi.ts        ← Axios + interceptores
│   ├── servicioAutenticacion.ts
│   ├── servicioLugar.ts
│   ├── servicioEvento.ts
│   ├── servicioMercado.ts
│   ├── servicioTablon.ts
│   ├── servicioFotos.ts
│   └── servicioAdmin.ts
├── estado/
│   ├── estadoUsuario.ts     ← Zustand: user, token, auth
│   ├── estadoLugar.ts       ← Zustand: lugares, filtros
│   └── estadoUi.ts          ← Zustand: loading, toasts
└── ganchos/
    └── useDebounce.ts
```

---

## 🌍 Hosting en producción — Sliplane

La aplicación está desplegada en producción en **[Sliplane](https://sliplane.io)**, una plataforma de hosting basada en contenedores Docker.

### URL pública

| Servicio | URL |
|---|---|
| **Frontend** | **[https://chukeles-frontend.sliplane.app](https://chukeles-frontend.sliplane.app)** |
| **Backend** | Accesible internamente desde el frontend a través de Nginx |
| **Swagger (prod)** | No expuesto públicamente (solo interno) |

### Servicios desplegados en Sliplane — Proyecto `CHUKELES`

Los tres servicios corren en el mismo servidor `CHUKELES_SERVER`:

| Servicio | Imagen / Repo | Tag | Descripción |
|---|---|---|---|
| `chukeles_frontend` | `angeeeellc/chukeles` (GitHub) | `main` | React + Nginx compilado |
| `chukeles_backend` | `angeeeellc/chukeles` (GitHub) | `main` | Spring Boot JAR |
| `chukeles_bd` | `docker.io/library/mysql:9.6.0` | `9.6.0` | Base de datos MySQL |

> Los deploys de `chukeles_frontend` y `chukeles_backend` se disparan automáticamente desde el repositorio de GitHub en la rama `main`.

### Base de datos — `chukeles_bd`

MySQL 9.6.0 desplegado como servicio independiente en Sliplane.

**Endpoint interno:** `chukeles-bd.internal` (accesible solo dentro del mismo servidor Sliplane, no expuesto a internet).

**Variables de entorno configuradas:**

| Variable | Valor |
|---|---|
| `HOST` | `0.0.0.0` |
| `MYSQL_BIND_ADDRESS` | `0.0.0.0` |
| `MYSQL_DATABASE` | `chukeles` |
| `MYSQL_USER` | `chukeles_user` |
| `MYSQL_PASSWORD` | `chukeles123abc` |
| `MYSQL_ROOT_HOST` | `%` |
| `MYSQL_ROOT_PASSWORD` | `chukelesroot123abc` |
| `PORT` | `3306` |

### Arquitectura en producción (Sliplane)

```
Internet
    │
    ▼
chukeles_frontend  (Nginx · puerto 80/443)
    │
    ├──► /api/*      → chukeles_backend:8080  (proxy interno)
    └──► /uploads/*  → chukeles_backend:8080  (proxy interno)
                              │
                              ▼
                        chukeles_bd:3306
                    (chukeles-bd.internal)
```

---

## ▶️ Cómo ejecutar el proyecto

### Con Docker (recomendado para evaluación)

```bash
# 1. Copiar variables de entorno
cp .env.example .env
# 2. Editar .env y añadir tu VITE_GOOGLE_MAPS_KEY
# 3. Levantar todos los servicios
docker-compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger-ui.html`

### Sin Docker — modo desarrollo

**Backend:**
```bash
cd backend
./mvnw spring-boot:run
# Perfil por defecto: H2 en fichero + seed automático
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# Variables necesarias en frontend/.env:
# VITE_API_URL=http://localhost:8080
# VITE_GOOGLE_MAPS_KEY=tu_clave_aqui
```

---

*Documento generado a partir del estado real del código fuente. Junio 2026.*

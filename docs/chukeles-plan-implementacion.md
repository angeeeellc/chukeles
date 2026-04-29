# 🐶 Plan de Implementación — Chukeles
> **A Coruña con tu perro** · Versión fusionada · Junio 2026

---

## Stack tecnológico confirmado

| Capa | Tecnología |
|---|---|
| Backend | Java 21 · Spring Boot 3.3 · Spring Data JPA · Spring Security · JWT · Lombok |
| Base de datos | MySQL 8 |
| Frontend | React 19 · Vite · TypeScript · Tailwind CSS · React Router · Zustand |
| Mapa | Google Maps JavaScript API (con API Key) |
| Imágenes | MultipartFile → volumen Docker `/uploads` |
| Herramientas | GitHub (Git Flow) · Docker Compose · Swagger · Postman · GitHub Actions |

---

## 🌿 Estrategia de ramas Git

```
main            ← código estable y presentable. Solo via Pull Request con tag de versión
  └── develop   ← integración de funcionalidades terminadas
       ├── feature/fase-0-setup
       ├── feature/fase-1-base-datos
       ├── feature/fase-2-auth-jwt
       ├── feature/fase-3-busqueda-mapa
       ├── feature/fase-4-admin-panel
       ├── feature/fase-5-fotos
       ├── feature/fase-6-tablon
       ├── feature/fase-7-marketplace
       ├── feature/fase-8-quedadas
       └── feature/fase-9-cierre
```

**Reglas de trabajo:**
- Cada `feature/*` se crea desde `develop`
- Al terminar, se mergea a `develop` con `--no-ff`
- Al final de cada semana funcional → merge `develop` → `main` con tag (ej: `v1.0-week1`)
- Nunca se trabaja directamente en `main`

---

## 📋 Calendario resumen

| Fase | Contenido | Semana | Días est. | Prioridad |
|---|---|---|---|---|
| 0 | Setup, Git, Docker | 1 | 2–3 | 🔴 Crítica |
| 1 | Base de datos + seed A Coruña | 1 | 4–5 | 🔴 Crítica |
| 2 | Autenticación JWT + API core | 2 | 6 | 🔴 Crítica |
| 3 | Búsqueda + Google Maps | 3 | 6 | 🔴 Crítica |
| 4 | Integración + filtros avanzados | 4 | 5 | 🔴 Crítica |
| 5 | Panel de administración | 5 | 5 | 🟡 Alta |
| 6 | Subida de fotos | 5–6 | 4 | 🟡 Alta |
| 7 | Tablón de anuncios | 6 | 4 | 🟡 Alta |
| 8 | Marketplace + Quedadas | 7 | 6 | 🟢 Media |
| 9 | Testing, CI/CD, cierre | 8–9 | 7 | 🟡 Alta |

> **Regla de oro:** Con las fases 0–4 completadas tienes una aplicación funcional y presentable. Las fases 5–8 son valor añadido.

---

## FASE 0 — Setup y configuración del entorno
**Duración estimada: 2–3 días · Semana 1**

### Objetivo
Tener toda la infraestructura lista antes de escribir una sola línea funcional.

### Tareas

**Repositorio GitHub**
- Crear repositorio `chukeles-app` con ramas `main` y `develop`
- Añadir `.gitignore` (Java, Node, `.env`, `uploads/`), `.env.example` y `README.md` inicial
- Crear tablero en GitHub Projects con columnas: _Por hacer · En progreso · En revisión · Hecho_
- Añadir una tarjeta por cada fase del plan

**Estructura de carpetas**
```
chukeles-app/
├── backend/
├── frontend/
├── docker/
├── docs/
└── data/        ← seed.sql con lugares reales
```

**Docker Compose**
- Tres servicios: `mysql`, `backend`, `frontend`
- Volúmenes persistentes para MySQL y para la carpeta `/uploads`
- Puertos: `3306` (MySQL) · `8080` (backend) · `5173` (frontend)

**Backend — Spring Boot**
- Inicializar en `start.spring.io` con Java 21 y las dependencias: Web, JPA, MySQL Driver, Security, Validation, JWT, Lombok
- Configurar `application.yml` con perfiles `dev` y `prod`
- Dockerizar con multi-stage build

**Frontend — React + Vite**
- Inicializar con Vite + React + TypeScript + Tailwind CSS
- Instalar: `axios`, `react-router-dom`, `@react-google-maps/api`, `zustand`
- Configurar ESLint, Prettier y proxy a `http://localhost:8080`

### Entregable
`docker-compose up --build` levanta los tres servicios sin errores.

---

## FASE 1 — Base de datos, modelos y seed
**Duración estimada: 4–5 días · Semana 1**

### Objetivo
MySQL con todas las entidades del dominio y ~40 lugares reales de A Coruña.

### Entidades principales

| Entidad | Campos clave |
|---|---|
| `User` | id, email, password (BCrypt), name, phone, role, photoUrl |
| `Category` | Enum: `VET, GROOMING, PET_FRIENDLY, PARK, STORE, HOTEL, TRAINING, OTHER` |
| `Place` | id, name, category, address, lat, lng, description, phone, website, photoUrl, approved |
| `MarketListing` | id, title, price, description, photoUrl, category, status, user, createdAt |
| `Event` (quedadas) | id, title, date, time, location, lat, lng, maxParticipants, description, user |
| `BulletinPost` | id, title, content, contactInfo, user, createdAt |

### Datos iniciales — seed.sql (~40 lugares reales)

**Veterinarios (aprox. 8):** El Arca, Clínica Elviña, Anubis, Canis Pajaritas, Hospital Atlántico, y otros con coordenadas reales.

**Peluquerías caninas (aprox. 6):** Avenida Poodle, Paraíso del Can, y otros locales reales de la ciudad.

**Parques y zonas pet-friendly (aprox. 10):** Parque de Bens, Santa Margarita, Eirís, Adolfo Suárez, Mesoiro, Dog Beach Riazor, y otros.

**Tiendas y residencias (aprox. 8):** Quinta das Mascotas, Complexo Canino Gaia, Montegatto, y otros.

**Otros (pet-friendly, adiestramiento, etc.) (aprox. 8).**

### Repositorios JPA
- `PlaceRepository` → búsqueda por categoría, nombre (containing ignore case) y combinación de ambos
- `EventRepository` → listar eventos futuros ordenados por fecha ascendente
- `BulletinPostRepository` → listar ordenados por fecha descendente
- `MarketListingRepository` → filtrar por categoría y estado

### Entregable
Base de datos con datos reales funcionando. `GET /api/places` devuelve los 40 lugares.

---

## FASE 2 — Autenticación JWT y API core
**Duración estimada: 6 días · Semana 2**

### Objetivo
Sistema de seguridad completo y búsqueda potente con filtros de distancia.

### Endpoints de autenticación

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | Público | Registrar usuario con email + password |
| POST | `/api/auth/login` | Público | Login, devuelve token JWT |
| GET | `/api/auth/me` | Privado | Datos del usuario autenticado |

### Seguridad
- `JwtUtil` → generación y validación de tokens
- `JwtAuthenticationFilter` → intercepta cada petición, valida el header `Authorization: Bearer <token>`
- `SecurityConfig` → rutas públicas (GET de lugares, categorías, eventos, posts) vs. privadas
- Contraseñas con BCrypt
- `@PreAuthorize` para proteger endpoints de admin

### Búsqueda avanzada de lugares

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/places?name=X&category=Y&lat=Z&lng=W&radius=R` | Público | Filtros combinados + distancia (Haversine) |
| GET | `/api/places/{id}` | Público | Detalle de un lugar |
| POST | `/api/places` | Admin | Crear lugar |
| PUT | `/api/places/{id}` | Admin | Editar lugar |
| DELETE | `/api/places/{id}` | Admin | Eliminar lugar |
| GET | `/api/categories` | Público | Listar categorías |

### Configuración de seguridad por ruta

```
Públicas:
  GET /api/places/**
  GET /api/categories/**
  GET /api/events/**
  GET /api/bulletin/**
  POST /api/auth/**

Privadas (usuario autenticado):
  POST /api/events
  POST /api/bulletin
  POST /api/market

Privadas (solo admin):
  POST/PUT/DELETE /api/places/**
  DELETE /api/bulletin/**
  DELETE /api/market/**
```

### Entregable
Colección Postman completa con autenticación y todos los filtros funcionando (incluyendo radio en km).

---

## FASE 3 — Frontend base y mapa Google Maps
**Duración estimada: 6 días · Semana 3**

### Objetivo
UI moderna con mapa interactivo potente sincronizado con la lista.

### Diseño y estilo
- Paleta de colores: verde bosque `#15803d` y azul océano `#1e40af`
- Logo: texto "Chukeles" con silueta de perro estilizado + tagline "A Coruña con tu perro"
- Tailwind CSS para todos los componentes
- Responsive mobile-first

### Páginas y rutas

| Ruta | Página | Descripción |
|---|---|---|
| `/` | Home | Buscador principal + mapa + lista |
| `/place/:id` | PlaceDetail | Detalle completo del lugar |
| `/events` | Events | Listado de quedadas |
| `/board` | BulletinBoard | Tablón de anuncios |
| `/market` | Marketplace | Compra-venta |
| `/login` | Login | Formulario de acceso |
| `/register` | Register | Formulario de registro |
| `/admin/*` | Admin | Panel de administración (protegido) |

### Componente Google Maps

- Marcadores con `InfoWindow` (nombre, categoría, foto pequeña, botón "Ver detalle")
- Cluster de marcadores para zonas con muchos puntos
- Chips de categoría como filtros visuales encima del mapa
- Click en tarjeta de la lista → centra y abre el `InfoWindow` del marcador correspondiente
- Click en marcador → resalta la tarjeta en la lista y hace scroll hasta ella
- Botón "¿Cómo llegar?" → abre Google Maps nativo

### Estado global con Zustand

```
userStore     → usuario autenticado, token JWT
placeStore    → lista de lugares, lugar seleccionado, filtros activos
uiStore       → loading states, toasts, modales abiertos
```

### Entregable
Buscar "veterinario" muestra lista de resultados + mapa con pins reales de A Coruña sincronizados.

---

## FASE 4 — Integración completa y filtros avanzados
**Duración estimada: 5 días · Semana 4**

### Objetivo
Funcionalidad principal al 100% con UX pulida para usuarios no autenticados.

### Tareas

**Conexión frontend-backend**
- Variables de entorno por perfil (`VITE_API_URL`, `VITE_GOOGLE_MAPS_KEY`)
- Interceptor Axios con token JWT en las cabeceras
- Manejo global de errores de API (401, 403, 404, 500)

**Filtros avanzados**
- Filtro por distancia: slider de 1 a 20 km usando geolocalización del navegador
- Filtro multi-categoría: selección múltiple de chips
- Buscador por nombre con debounce (300ms)
- Todos los filtros combinables entre sí

**UX y estados**
- Skeleton loaders mientras se cargan los datos
- Mensaje "No hay resultados" con sugerencias
- Toast de éxito/error para todas las acciones
- Página 404 personalizada con link al inicio
- Navbar con indicador de sección activa

**Dark mode** (opcional pero recomendado para la temática)

### Entregable
Usuario invitado puede usar toda la búsqueda y el mapa sin problemas. App es responsive en móvil.

---

## FASE 5 — Panel de administración
**Duración estimada: 5 días · Semana 5**

### Objetivo
Admin puede gestionar todo el contenido desde un panel protegido, con mapa interactivo para añadir lugares.

### Funcionalidades del panel

**Login de admin**
- Ruta `/admin/login` → formulario con email + password
- Token almacenado en memoria (Zustand) + `sessionStorage`
- Redirección a `/admin/dashboard` tras autenticarse

**Dashboard**
- Listado de lugares con botones Editar / Eliminar / Ver foto
- Formulario de creación/edición de lugar con todos los campos
- Listado de posts del tablón con botón Eliminar
- Listado de productos del marketplace con botón Eliminar
- Listado de quedadas con botón Eliminar

**Mapa interactivo para admin** ⭐
- Al crear o editar un lugar, el formulario incluye un mapa de Leaflet
- El admin hace click en el mapa para seleccionar la ubicación exacta
- Los campos `lat` y `lng` se rellenan automáticamente
- Hay un marcador que se mueve al hacer click

### Entregable
Admin puede crear, editar y eliminar lugares. Al añadir uno nuevo, puede pinchar en el mapa para establecer las coordenadas.

---

## FASE 6 — Subida de fotos
**Duración estimada: 4 días · Semanas 5–6**

### Objetivo
Fotos en lugares (admin) y en anuncios/productos (usuarios).

### Backend
- Configurar ruta de uploads: `chukeles.upload.path=./uploads`
- Servir archivos estáticos desde `/uploads/**`
- Validación de archivos: solo `jpg`, `png`, máximo 5MB
- Nombres únicos: `{entidad}_{id}_{timestamp}.jpg`
- Endpoint reutilizable para lugares, productos y anuncios

### Frontend — lugares (admin)
- Input `type="file"` en el formulario de admin
- Previsualización de imagen antes de subir
- Mostrar foto actual con opción de cambiarla
- Indicador de carga durante el upload

### Frontend — productos y anuncios (usuarios)
- Hasta 3 fotos por producto/anuncio
- Previsualización múltiple antes de enviar
- Placeholder visual si no hay foto

### Entregable
Lugares con fotos visibles en lista y detalle. Backend preparado para fotos en cualquier entidad.

---

## FASE 7 — Tablón de anuncios
**Duración estimada: 4 días · Semana 6**

### Objetivo
Espacio comunitario para publicar dudas, información y anuncios de venta.

### Tipos de anuncio

| Tipo | Descripción | Precio |
|---|---|---|
| `duda` | El usuario tiene una pregunta o necesita consejo | No |
| `info` | El usuario comparte información útil | No |
| `venta` | El usuario vende un objeto relacionado con mascotas | Sí |

### Endpoints

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/bulletin?type=duda` | Público | Listar con filtro por tipo |
| GET | `/api/bulletin/{id}` | Público | Detalle de un anuncio |
| POST | `/api/bulletin` | Autenticado | Publicar anuncio |
| DELETE | `/api/bulletin/{id}` | Admin o autor | Eliminar |

### Frontend
- Ruta `/board` → listado con filtros por tipo (badges de color distinto por tipo)
- Tarjeta con tipo, título, descripción, fecha, contacto y precio (si es venta)
- Formulario con campo precio que aparece solo cuando tipo === `venta`
- Ordenación por fecha descendente con formateo legible (ej: "hace 2 horas")
- Botón "Eliminar" visible solo para el autor o admin

### Entregable
Tablón completamente funcional. Usuario puede publicar y filtrar por tipo.

---

## FASE 8 — Marketplace y Quedadas caninas
**Duración estimada: 6 días · Semana 7**

### Objetivo
Dos funcionalidades secundarias de comunidad: compra-venta con fotos y organización de encuentros.

### Marketplace

**Endpoints:**

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/market?category=X` | Público | Listar con filtro |
| GET | `/api/market/{id}` | Público | Detalle |
| POST | `/api/market` | Autenticado | Publicar producto |
| PUT | `/api/market/{id}` | Autor | Editar / marcar como vendido |
| DELETE | `/api/market/{id}` | Autor o admin | Eliminar |

**Categorías de producto:** Alimentación · Accesorios · Ropa · Juguetes · Salud · Otros

**Frontend:**
- Grid de tarjetas (no lista) con foto, título, precio y categoría destacados
- Badge de estado: `Disponible` / `Vendido`
- Sección "Mis anuncios" para el usuario autenticado
- Formulario con hasta 3 fotos, precio obligatorio y datos de contacto

### Quedadas caninas

**Endpoints:**

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/events` | Público | Listar eventos futuros |
| GET | `/api/events/{id}` | Público | Detalle con participantes |
| POST | `/api/events` | Autenticado | Crear quedada |
| POST | `/api/events/{id}/join` | Autenticado | Apuntarse |
| DELETE | `/api/events/{id}/leave` | Autenticado | Borrarse |
| DELETE | `/api/events/{id}` | Autor o admin | Eliminar |

**Frontend:**
- Ruta `/events` → listado con fecha, lugar y número de participantes
- Tarjeta con botón "Apuntarme" / "Ya me apunté" (condicional según estado del usuario)
- Formulario con datepicker (solo fechas futuras) y campo de ubicación
- Opción de toggle en el mapa principal para mostrar las quedadas como iconos diferenciados

### Entregable
Usuario autenticado puede publicar en marketplace y crear o unirse a quedadas.

---

## FASE 9 — Testing, CI/CD y cierre
**Duración estimada: 7 días · Semanas 8–9**

### Objetivo
Aplicación estable, bien documentada y lista para presentar en junio.

### Testing backend (JUnit + MockMvc)

Pruebas unitarias mínimas requeridas:
- `PlaceService` → búsqueda con cada combinación de filtros
- `AuthController` → registro, login correcto y login incorrecto
- `PlaceController` → GET público funciona, POST sin token devuelve 401
- `EventService` → unirse y salir de una quedada

### Checklist de pruebas manuales

**Búsqueda y mapa:**
- [ ] Búsqueda vacía → muestra todos los lugares en lista y mapa
- [ ] Buscar por nombre → filtra correctamente
- [ ] Filtrar por categoría → filtra correctamente
- [ ] Filtrar por radio de distancia → filtra correctamente
- [ ] Click en marcador del mapa → resalta tarjeta en la lista
- [ ] Click en tarjeta → centra el mapa y abre InfoWindow
- [ ] La app es responsive en móvil

**Autenticación:**
- [ ] Registro de usuario → funciona y redirige al inicio
- [ ] Login → guarda token y actualiza el navbar
- [ ] Logout → limpia el estado y el token
- [ ] Ruta protegida sin token → redirige a login

**Funcionalidades de comunidad:**
- [ ] Crear quedada → aparece en el listado
- [ ] Unirse / Salir de quedada → actualiza el contador
- [ ] Publicar anuncio tipo "venta" → aparece el campo de precio
- [ ] Publicar anuncio → aparece en el tablón
- [ ] Subir foto a producto → se muestra en la tarjeta

**Admin:**
- [ ] Login de admin → accede al dashboard
- [ ] Crear lugar pinchando en el mapa → lat/lng se rellenan automáticamente
- [ ] Subir foto a un lugar → se muestra en el detalle público
- [ ] Eliminar cualquier contenido desde el panel

### GitHub Actions — CI/CD

```yaml
# .github/workflows/ci.yml
# Se ejecuta en push a develop y en Pull Requests a develop y main

Jobs:
  backend:  → mvnw test (Java 21, Ubuntu latest)
  frontend: → npm install + npm run build (Node 20, Ubuntu latest)
```

### Docker final

- Dockerfile del frontend con multi-stage build + Nginx para servir el bundle
- `docker-compose.yml` final con todos los servicios, volúmenes y variables de entorno
- Verificar que `docker-compose up` funciona desde cero en una máquina limpia

### Documentación

- `README.md` completo con: descripción del proyecto, requisitos, instrucciones de instalación, variables de entorno necesarias y guía de uso
- Swagger UI disponible en `http://localhost:8080/swagger-ui.html`
- Video demo de 3–5 minutos

### Release final
- Merge `develop` → `main`
- Tag `v1.0.0` y GitHub Release con notas de cambios

### Entregable final
Proyecto completo desplegable con `docker-compose up`. App lista para presentar en junio 2026.

---

## 📊 Resumen de funcionalidades

| Tipo | Funcionalidad | Estado |
|---|---|---|
| Principal | Buscar lugares por nombre, categoría y distancia | ✅ |
| Principal | Ver en lista + Google Maps sincronizados | ✅ |
| Principal | Detalle de lugar con enlace a navegación | ✅ |
| Principal | App responsive para móvil | ✅ |
| Admin | Login JWT | ✅ |
| Admin | CRUD de lugares con mapa interactivo para seleccionar coordenadas | ✅ |
| Admin | Subida de fotos a lugares | ✅ |
| Admin | Eliminar cualquier contenido | ✅ |
| Comunidad | Tablón de anuncios (duda / info / venta) | ✅ |
| Comunidad | Marketplace con fotos | ✅ |
| Comunidad | Quedadas caninas (crear, unirse, salir) | ✅ |
| DevOps | CI/CD con GitHub Actions | ✅ |
| DevOps | Despliegue completo con Docker Compose | ✅ |

---

*Documento generado a partir de la fusión de los tres planes de implementación del proyecto Chukeles.*

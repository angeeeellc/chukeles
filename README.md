<p align="center">
  <!-- Logo eliminado para mantener el repositorio limpio -->
</p>

<h1 align="center">🐶 Chukeles — A Coruña con tu perro</h1>

<p align="center">
  Directorio interactivo de lugares pet-friendly en A Coruña con mapa Google Maps,
  tablón de anuncios comunitario, marketplace y quedadas caninas.
</p>

<p align="center">
  <img alt="Java" src="https://img.shields.io/badge/Java-21-orange?logo=openjdk"/>
  <img alt="Spring Boot" src="https://img.shields.io/badge/Spring%20Boot-3.3-brightgreen?logo=spring"/>
  <img alt="React" src="https://img.shields.io/badge/React-19-61dafb?logo=react"/>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript"/>
  <img alt="MySQL" src="https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white"/>
  <img alt="Docker" src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white"/>
  <img alt="CI" src="https://github.com/angeeeellc/chukeles/actions/workflows/ci.yml/badge.svg"/>
</p>

---

## 📖 Descripción del proyecto

**Chukeles** es una aplicación web full-stack que centraliza todo lo relacionado con perros en la ciudad de A Coruña:

| Módulo | Descripción |
|---|---|
| 🗺️ **Mapa interactivo** | ~40 lugares reales (veterinarios, parques, peluquerías, tiendas…) con Google Maps y filtros combinados por nombre, categoría y radio de distancia |
| 🛒 **Marketplace** | Compra-venta de artículos para mascotas con fotos y estados |
| 📋 **Tablón de anuncios** | Posts de tipo "duda", "info" o "venta" de la comunidad |
| 🐕 **Quedadas caninas** | Crear y unirse a quedadas para pasear con otros dueños |
| 🔒 **Auth JWT** | Registro, login y rutas protegidas por rol (usuario / admin) |
| 🖼️ **Subida de fotos** | Fotos para lugares, anuncios y productos, almacenadas en volumen Docker |
| ⚙️ **Panel de admin** | CRUD completo de lugares con mapa interactivo para seleccionar coordenadas |

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|---|---|
| **Backend** | Java 21 · Spring Boot 3.3 · Spring Data JPA · Spring Security · JWT (JJWT 0.12) · Lombok |
| **Base de datos** | MySQL 8 |
| **Frontend** | React 19 · Vite · TypeScript · Tailwind CSS · React Router v7 · Zustand |
| **Mapa** | Google Maps JavaScript API (`@react-google-maps/api`) |
| **DevOps** | Docker · Docker Compose · GitHub Actions |

---

## ⚙️ Requisitos previos

| Herramienta | Versión mínima | Necesario para |
|---|---|---|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | 24+ | Despliegue completo |
| [Docker Compose](https://docs.docker.com/compose/) | v2+ | Incluido en Docker Desktop |
| [Java 21](https://adoptium.net/) | 21 (LTS) | Desarrollo backend |
| [Node.js](https://nodejs.org/) | 20 LTS | Desarrollo frontend |
| [Maven](https://maven.apache.org/) | 3.9+ | Incluido vía `mvnw` |
| Clave de API Google Maps | — | Visualización del mapa |

---

## 🚀 Instalación y puesta en marcha

### 1. Clonar el repositorio

```bash
git clone https://github.com/angeeeellc/chukeles.git
cd chukeles
```

### 2. Configurar las variables de entorno

```bash
cp .env.example .env
```

Edita `.env` y rellena al menos la clave de Google Maps (el resto tiene valores por defecto válidos para desarrollo):

```env
VITE_GOOGLE_MAPS_KEY=TU_CLAVE_AQUI
```

> **Nota:** Consulta la sección [Variables de entorno](#-variables-de-entorno) para una descripción completa de todas las variables.

### 3. Arrancar con Docker Compose

```bash
docker-compose up --build
```

El primer arranque tarda ~2-3 minutos mientras se construyen las imágenes y se inicializa la base de datos con el seed de A Coruña.

| Servicio | URL |
|---|---|
| 🌐 Frontend | http://localhost:5173 |
| ⚙️ Backend API | http://localhost:8080 |
| 🗄️ MySQL | localhost:3306 |

Para parar los servicios:

```bash
docker-compose down
```

Para parar y **borrar los datos** (volúmenes):

```bash
docker-compose down -v
```

---

## 💻 Desarrollo local (sin Docker)

### Backend

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Requiere una instancia de MySQL corriendo en `localhost:3306`. Puedes levantar solo la base de datos con Docker:

```bash
docker-compose up mysql
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

La app de desarrollo estará en http://localhost:5173 y hará proxy automático al backend en `http://localhost:8080`.

---

## 🔐 Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores. El archivo `.env` **nunca** debe subirse al repositorio (está en `.gitignore`).

### Base de datos

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `DB_NAME` | `chukeles` | Nombre de la base de datos |
| `DB_ROOT_PASSWORD` | `root` | Contraseña del usuario root de MySQL |
| `DB_USER` | `chukeles_user` | Usuario de la aplicación |
| `DB_PASSWORD` | `chukeles_pass` | Contraseña del usuario de la aplicación |
| `DB_PORT` | `3306` | Puerto expuesto de MySQL |

### Backend

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `dev` | Perfil activo (`dev` / `prod`) |
| `SERVER_PORT` | `8080` | Puerto del servidor Spring Boot |
| `JWT_SECRET` | *(ver .env.example)* | Clave secreta para firmar tokens JWT. **Cambia esto en producción.** |
| `JWT_EXPIRATION_MS` | `86400000` | Expiración del token JWT en ms (por defecto 24 h) |
| `UPLOAD_PATH` | `./uploads` | Ruta donde se almacenan las imágenes subidas |

### Frontend

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080` | URL base de la API del backend |
| `VITE_GOOGLE_MAPS_KEY` | — | **Obligatorio.** Clave de la Google Maps JavaScript API |
| `FRONTEND_PORT` | `5173` | Puerto en el que Nginx sirve el frontend |

---

## 📁 Estructura del proyecto

```
chukeles/
├── backend/                  # Spring Boot (Java 21)
│   ├── src/
│   │   └── main/java/com/chukeles/
│   │       ├── controller/   # Endpoints REST
│   │       ├── service/      # Lógica de negocio
│   │       ├── repository/   # Spring Data JPA
│   │       ├── model/        # Entidades JPA
│   │       ├── dto/          # Data Transfer Objects
│   │       └── security/     # JWT, filtros y configuración de Spring Security
│   ├── Dockerfile            # Multi-stage build (Maven → JRE)
│   └── pom.xml
├── frontend/                 # React 19 + Vite + TypeScript
│   ├── src/
│   │   ├── componentes/      # Componentes reutilizables
│   │   ├── paginas/          # Páginas de la app
│   │   ├── estado/           # Stores de Zustand
│   │   ├── servicios/        # Llamadas Axios a la API
│   │   └── ganchos/          # Custom hooks
│   ├── Dockerfile            # Multi-stage build (Node → Nginx)
│   └── nginx.conf            # Configuración Nginx con proxy /api y /uploads
├── data/
│   └── seed.sql              # ~40 lugares reales de A Coruña
├── uploads/                  # Imágenes subidas (ignorado en Git)
├── docker-compose.yml        # Orquestación de los tres servicios
├── .env.example              # Plantilla de variables de entorno
└── .github/
    └── workflows/
        └── ci.yml            # GitHub Actions CI/CD
```

---

## 🧭 Guía de uso

### Usuario invitado (sin cuenta)
- Accede a **http://localhost:5173** y usa el buscador principal.
- Filtra por **nombre**, **categoría** (veterinario, parque, peluquería…) o **radio de distancia** desde tu ubicación.
- Haz click en los marcadores del mapa para ver el detalle del lugar.
- Consulta el **tablón de anuncios** y los **eventos** sin necesidad de registrarte.

### Usuario registrado
1. Haz click en **Registrarse** e introduce tu email y contraseña.
2. Publica en el **Tablón de anuncios** (dudas, información, venta).
3. Crea o únete a **Quedadas caninas**.
4. Publica y gestiona tus anuncios en el **Marketplace**.

### Administrador
- Accede a **/admin** con las credenciales de administrador.
- Crea, edita y elimina **lugares** haciendo click en el mapa para seleccionar coordenadas exactas.
- Sube fotos a cualquier lugar.
- Modera contenido del tablón, marketplace y quedadas.

> **Credenciales de admin por defecto (seed):**  
> Email: `admin@chukeles.com` · Contraseña: `Admin1234!`  
> *(Cámbialas en producción editando el seed.sql antes del primer arranque)*

---

## 🔌 API — Resumen de endpoints

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/register` | Público | Registrar usuario |
| `POST` | `/api/auth/login` | Público | Login → devuelve JWT |
| `GET` | `/api/auth/me` | Autenticado | Datos del usuario activo |
| `GET` | `/api/places` | Público | Listar/buscar lugares (filtros: `name`, `category`, `lat`, `lng`, `radius`) |
| `GET` | `/api/places/{id}` | Público | Detalle de un lugar |
| `POST` | `/api/places` | Admin | Crear lugar |
| `PUT` | `/api/places/{id}` | Admin | Editar lugar |
| `DELETE` | `/api/places/{id}` | Admin | Eliminar lugar |
| `GET` | `/api/categories` | Público | Listar categorías |
| `GET` | `/api/bulletin` | Público | Listar anuncios del tablón |
| `POST` | `/api/bulletin` | Autenticado | Publicar anuncio |
| `DELETE` | `/api/bulletin/{id}` | Admin/Autor | Eliminar anuncio |
| `GET` | `/api/market` | Público | Listar productos |
| `POST` | `/api/market` | Autenticado | Publicar producto |
| `PUT` | `/api/market/{id}` | Autor | Editar/marcar como vendido |
| `DELETE` | `/api/market/{id}` | Admin/Autor | Eliminar producto |
| `GET` | `/api/events` | Público | Listar quedadas futuras |
| `POST` | `/api/events` | Autenticado | Crear quedada |
| `POST` | `/api/events/{id}/join` | Autenticado | Apuntarse a quedada |
| `DELETE` | `/api/events/{id}/leave` | Autenticado | Borrarse de quedada |
| `DELETE` | `/api/events/{id}` | Admin/Autor | Eliminar quedada |
| `POST` | `/api/upload` | Autenticado | Subir imagen (max 5 MB, jpg/png) |

---

## 🤝 Contribuir

1. Crea una rama desde `develop`: `git checkout -b feature/mi-funcionalidad develop`
2. Realiza tus cambios con commits descriptivos.
3. Abre un Pull Request hacia `develop`.
4. El CI (GitHub Actions) validará el build de backend y frontend automáticamente.
5. Tras la revisión, se hará merge con `--no-ff`.

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

<p align="center">
  Hecho con ❤️ y 🐶 en A Coruña · 2026
</p>

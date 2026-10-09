# CampusDesk

Plataforma web de gestión de incidencias tecnológicas para TechNova Solutions: centraliza las solicitudes de soporte, controla su ciclo de vida (OPEN → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED) y protege la información según el rol de cada usuario.

> Dueño de este archivo: Persona 4. Cada persona le pasa los datos de su zona.

## Integrantes

| Persona | Nombre | Rama | Zona |
|---|---|---|---|
| Persona 1 | _pendiente_ | `DevJonatan` | Backend: seguridad, usuarios e indicadores |
| Persona 2 | _pendiente_ | `DevNic` | Backend: tickets y reglas del negocio |
| Persona 3 | _pendiente_ | `DevSergy` | Frontend |
| Persona 4 | _pendiente_ | `DevMic` | Base de datos, pruebas y documentación |

## Avance

Actualizado el 2026-10-09.

| Zona | Hecho | Pendiente |
|---|---|---|
| Seguridad, usuarios e indicadores (P1) | DTOs de auth y usuarios, `ErrorResponse` y `GlobalExceptionHandler`. En su rama: JWT, `SecurityConfig`, registro, login, `GET /users` y `/users/technicians`, con pruebas | Resumen del dashboard (`/reports/summary`), `DataInitializer`, CORS y Swagger |
| Tickets y reglas del negocio (P2) | DTOs de tickets, máquina de estados (`TicketTransitionPolicy`) y `POST /tickets` | Listado con filtros, detalle, edición, asignación, cambio de estado, comentarios, historial y pruebas |
| Frontend (P3) | Interfaz de las pantallas en su rama, conectada a la API con `apiFetch` | Integración con los endpoints reales y revisión de páginas duplicadas |
| Base de datos (P4) | Enums, entidades, repositorios, `schema.sql`, diagrama ER, PostgreSQL con Docker y pruebas de repositorios | `data.sql` |
| Documentación y evidencias (P4) | README, contrato de la API, guía de pasos iniciales | Roles, Swagger, decisiones de diseño y evidencias |

## Tecnologías

- Backend: Java 21, Spring Boot 4.1.1 (Web, Data JPA, Security, Validation), JWT (JJWT 0.13.0), SpringDoc OpenAPI 3.1.0 (Swagger), Gradle
- Base de datos: PostgreSQL 17 (con Docker o instalado en el computador); H2 en memoria solo para las pruebas
- Frontend: HTML5, CSS3 y JavaScript sin frameworks

## Estructura del repositorio

```
campusdesk/
├── backend/                              Proyecto Spring Boot (Gradle)
│   ├── build.gradle                      Dependencias
│   ├── gradlew, gradlew.bat              Ejecutan Gradle sin instalarlo
│   ├── .env.example                      Variables de entorno (copiar como .env)
│   ├── docker-compose.yml   Persona 4    PostgreSQL para desarrollo (opcional)
│   ├── src/main/java/com/technova/campusdesk/
│   │   ├── CampusDeskApplication.java   Clase principal
│   │   ├── config/          Persona 1    CORS, Swagger, DataInitializer
│   │   ├── security/        Persona 1    JWT, filtros, SecurityConfig
│   │   ├── exception/       Persona 1    ErrorResponse, GlobalExceptionHandler
│   │   ├── controller/      P1 y P2      Auth/User/Report (P1) · Ticket* (P2)
│   │   ├── service/         P1 y P2      Auth/User/Report (P1) · Ticket*, Comment, StatusHistory (P2)
│   │   ├── dto/request/     P1 y P2
│   │   ├── dto/response/    P1 y P2
│   │   ├── mapper/          Persona 2
│   │   ├── entity/          Persona 4    User, Ticket, Comment, StatusHistory
│   │   ├── entity/enums/    Persona 4    Role, Category, Priority, TicketStatus
│   │   └── repository/      Persona 4
│   └── src/test/
│       ├── resources/application-test.yml   Persona 4    Perfil de pruebas (H2)
│       └── java/.../repository/             Persona 4    Pruebas de repositorios
├── frontend/                Persona 3    5 pantallas, css/, js/
├── database/                Persona 4    schema.sql, data.sql
└── docs/                    Persona 4    api-contract.md, er-diagram.md, evidencias/
```

En los paquetes compartidos (`controller`, `service`, `dto`) cada persona trabaja en sus propios archivos, así no hay conflictos de Git.

## Ramas

- `main`: versión estable para la entrega. Solo recibe merges desde `develop`.
- `develop`: integración del equipo. Solo recibe pull requests desde las ramas personales.
- `DevJonatan`, `DevNic`, `DevSergy`, `DevMic`: rama de trabajo de cada integrante (ver tabla de integrantes).

Nadie hace push directo a `develop` ni a `main`. Más detalle en `PASOS_INICIALES.md`.

## Requisitos previos

- JDK 21 (los cuatro con la misma versión)
- PostgreSQL 17, de una de estas dos formas:
  - Docker con Docker Compose (recomendado: no hay que instalar PostgreSQL), o
  - PostgreSQL instalado en el computador
- Git
- VS Code con la extensión Live Server (o similar) para el frontend

No hace falta instalar Gradle: el proyecto trae `gradlew`, que lo descarga solo la primera vez.

## Configuración (variables de entorno)

Copiar `backend/.env.example` como `backend/.env` y completar los valores. El archivo `.env` no se sube al repositorio. Spring Boot y Docker Compose lo leen al ejecutarse desde la carpeta `backend/`.

| Variable | Para qué sirve | Valor por defecto |
|---|---|---|
| `DB_URL` | URL JDBC de la base | `jdbc:postgresql://localhost:5432/campusdesk` |
| `DB_USERNAME` | Usuario de PostgreSQL (con Docker, se crea con este nombre) | — (obligatoria) |
| `DB_PASSWORD` | Contraseña de PostgreSQL (con Docker, se crea con esta contraseña) | — (obligatoria) |
| `JPA_DDL_AUTO` | Qué hace Hibernate con las tablas. Recomendado: `validate`, porque las tablas las crea `schema.sql` | `update` |
| `SERVER_PORT` | Puerto del backend | `8080` |
| `JWT_SECRET` | Clave para firmar los tokens. Mínimo 32 caracteres; se puede generar con `openssl rand -base64 48` | — (obligatoria) |
| `JWT_EXPIRATION_MS` | Duración del token en milisegundos | `3600000` (1 hora) |
| `CORS_ALLOWED_ORIGINS` | Orígenes del frontend que pueden llamar a la API | `http://127.0.0.1:5500,http://localhost:5500` |
| `ADMIN_EMAIL` | Correo del ADMIN que crea el DataInitializer | — |
| `ADMIN_PASSWORD` | Contraseña de ese ADMIN | — |
| `TECH_PASSWORD` | Contraseña de los técnicos que crea el DataInitializer | — |

## Preparar PostgreSQL

### Opción A: Docker (recomendada)

Desde la carpeta `backend/`, con el `.env` ya creado:

```bash
docker compose up -d       # crea el contenedor campusdesk-postgres, la base campusdesk y ejecuta schema.sql
docker compose down        # lo detiene (los datos se conservan)
docker compose down -v     # borra la base; al volver a levantarla se ejecuta otra vez schema.sql
```

`database/schema.sql` solo se ejecuta cuando la base se crea desde cero. Si cambia el esquema, hay que hacer `docker compose down -v` y `docker compose up -d`.

### Opción B: PostgreSQL instalado

```bash
psql -U postgres -c "CREATE DATABASE campusdesk;"
psql -U postgres -d campusdesk -f database/schema.sql
```

`schema.sql` borra y vuelve a crear las tablas, así que se puede ejecutar de nuevo para empezar desde cero.

### Datos de prueba

_pendiente: `database/data.sql` (usuarios, tickets en todos los estados, comentarios e historial)._

### Modelo de datos

Tablas `users`, `tickets`, `comments` y `status_history`. El diagrama entidad-relación está en [`docs/er-diagram.md`](docs/er-diagram.md).

## Ejecución

Backend, desde la carpeta `backend/`:

- Mac o Linux: `./gradlew bootRun`
- Windows: `gradlew.bat bootRun`

Queda escuchando en `http://localhost:8080`. Si `JPA_DDL_AUTO=validate` y la aplicación arranca, las entidades coinciden con las tablas de `schema.sql`.

Frontend: _pendiente: abrir `frontend/index.html` con Live Server en `http://127.0.0.1:5500`._

## Pruebas

Desde la carpeta `backend/`:

```bash
./gradlew test
```

Las pruebas usan el perfil `test` (`src/test/resources/application-test.yml`): una base H2 en memoria en modo PostgreSQL, así que no necesitan PostgreSQL, Docker ni el archivo `.env`. Cargan el mismo `database/schema.sql` y validan las entidades contra él: si el esquema y las entidades dejan de coincidir, las pruebas fallan.

| Clase | Qué prueba |
|---|---|
| `CampusDeskApplicationTests` | Que la aplicación arranca |
| `UserRepositoryTest` | Búsqueda por correo, correo duplicado rechazado, técnicos ordenados por nombre |
| `TicketRepositoryTest` | Estado inicial `OPEN`, carga de solicitante y técnico, filtros combinados, conteos del dashboard |
| `TicketActivityRepositoryTest` | Comentarios e historial en orden cronológico, con su autor |

_pendiente: pruebas de los servicios y de la API (reglas de negocio, permisos por rol y transiciones de estado)._

## Roles

_pendiente: qué puede hacer ADMIN, TECHNICIAN y USER, y cómo se crean las cuentas de ADMIN y técnicos._

## Swagger

Con el backend en marcha: `http://localhost:8080/swagger-ui.html`.

_pendiente: cómo usar el botón Authorize con el token JWT (cuando esté la seguridad de Persona 1)._

## Decisiones de diseño

- Todos los nombres del código y los valores de los enums están en inglés (`OPEN`, `HIGH`, `NETWORK`...), como pide la especificación del proyecto.
- Los enums se guardan como texto y la base los restringe con `CHECK`.
- La tabla de usuarios se llama `users` porque `user` es palabra reservada en PostgreSQL.
- Las tablas las crea `database/schema.sql`, no Hibernate: así el esquema queda versionado y revisado.

_pendiente: las decisiones sobre los puntos ambiguos del enunciado (ver "Decisiones pendientes" en `docs/api-contract.md`)._

## Evidencias

_pendiente: capturas en `docs/evidencias/` (inicio de sesión, gestión de tickets, asignación, cambios de estado, historial y comentarios, dashboard, Swagger)._

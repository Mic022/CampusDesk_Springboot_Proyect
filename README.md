# CampusDesk

Plataforma web de gestión de incidencias tecnológicas para TechNova Solutions: centraliza las solicitudes de soporte, controla su ciclo de vida (OPEN → ASSIGNED → IN_PROGRESS → RESOLVED → CLOSED) y protege la información según el rol de cada usuario.

> Dueño de este archivo: Persona 4. Cada persona le pasa los datos de su zona.

## Integrantes

| Persona | Nombre | Zona |
|---|---|---|
| Persona 1 | _pendiente_ | Backend: seguridad, usuarios e indicadores |
| Persona 2 | _pendiente_ | Backend: tickets y reglas del negocio |
| Persona 3 | _pendiente_ | Frontend |
| Persona 4 | _pendiente_ | Base de datos, pruebas y documentación |

## Tecnologías

- Backend: Java 21, Spring Boot 4.1.1 (Web, Data JPA, Security, Validation), JWT (JJWT 0.13.0), SpringDoc OpenAPI 3.1.0 (Swagger), Gradle
- Base de datos: PostgreSQL
- Frontend: HTML5, CSS3 y JavaScript sin frameworks

## Estructura del repositorio

```
campusdesk/
├── backend/                              Proyecto Spring Boot (Gradle)
│   ├── build.gradle                      Dependencias
│   ├── gradlew, gradlew.bat              Ejecutan Gradle sin instalarlo
│   ├── .env.example                      Variables de entorno (copiar como .env)
│   └── src/main/java/com/technova/campusdesk/
│       ├── CampusDeskApplication.java   Clase principal
│       ├── config/          Persona 1    CORS, Swagger, DataInitializer
│       ├── security/        Persona 1    JWT, filtros, SecurityConfig
│       ├── exception/       Persona 1    ErrorResponse, GlobalExceptionHandler
│       ├── controller/      P1 y P2      Auth/User/Report (P1) · Ticket* (P2)
│       ├── service/         P1 y P2      Auth/User/Report (P1) · Ticket*, Comment, StatusHistory (P2)
│       ├── dto/request/     P1 y P2
│       ├── dto/response/    P1 y P2
│       ├── mapper/          Persona 2
│       ├── entity/          Persona 4    User, Ticket, Comment, StatusHistory
│       ├── entity/enums/    Persona 4    Role, Category, Priority, TicketStatus
│       └── repository/      Persona 4
├── frontend/                Persona 3    5 pantallas, css/, js/
├── database/                Persona 4    schema.sql, data.sql
└── docs/                    Persona 4    api-contract.md, diagrama ER, evidencias/
```

En los paquetes compartidos (`controller`, `service`, `dto`) cada persona trabaja en sus propios archivos, así no hay conflictos de Git.

## Requisitos previos

_pendiente: JDK 21, PostgreSQL (versión), Git y la extensión Live Server (o similar). Gradle no hace falta instalarlo._

## Preparar PostgreSQL

_pendiente: crear la base `campusdesk` y ejecutar `database/schema.sql` y `database/data.sql`._

## Configuración (variables de entorno)

Copiar `backend/.env.example` como `backend/.env` y completar los valores. El archivo `.env` no se sube al repositorio.

_pendiente: tabla con cada variable y para qué sirve._

## Ejecución

_pendiente: backend (`./gradlew bootRun` o `gradlew.bat bootRun` desde `backend/`) y frontend (Live Server en `http://127.0.0.1:5500`)._

## Roles

_pendiente: qué puede hacer ADMIN, TECHNICIAN y USER, y cómo se crean las cuentas de ADMIN y técnicos._

## Swagger

_pendiente: `http://localhost:8080/swagger-ui.html` y cómo usar el botón Authorize._

## Decisiones de diseño

_pendiente: las decisiones tomadas sobre los puntos ambiguos del enunciado (ver `docs/api-contract.md`)._

## Evidencias

_pendiente: capturas en `docs/evidencias/` (inicio de sesión, gestión de tickets, asignación, cambios de estado, historial y comentarios, dashboard, Swagger)._

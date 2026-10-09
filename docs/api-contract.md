# Contrato de la API — CAMPUSDESK

> **Propuesta inicial.** Dueños: Persona 1 (auth, usuarios, resumen) y Persona 2 (tickets). Se revisa y se ajusta en la reunión de arranque. Después de eso, cualquier cambio se le avisa a Persona 3 (frontend) y a Persona 4 (pruebas).

## Convenciones

- URL base: `http://localhost:8080/api`
- Nombres de campos en inglés y `camelCase`. Valores de enums también en inglés y en `UPPER_SNAKE_CASE`.
- Fechas en ISO-8601 sin zona: `"2026-10-08T14:30:00"`.
- Endpoints privados: header `Authorization: Bearer <token>`.
- Nunca se devuelven entidades ni contraseñas, solo los DTOs de este documento.

### Enums

| Enum | Valores |
|---|---|
| `Role` | `ADMIN`, `TECHNICIAN`, `USER` |
| `Category` | `HARDWARE`, `SOFTWARE`, `NETWORK`, `ACCESS`, `OTHER` |
| `Priority` | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `TicketStatus` | `OPEN`, `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `CLOSED` |

### Formato de error (todas las respuestas 4xx y 5xx)

```json
{
  "timestamp": "2026-10-08T14:30:00",
  "status": 409,
  "error": "Conflict",
  "message": "Transición no permitida: ASSIGNED → RESOLVED",
  "path": "/api/tickets/5/status",
  "errors": { "title": "El título es obligatorio" }
}
```

`errors` solo aparece en errores de validación (400).

## Objetos de respuesta

```json
// UserResponse
{ "id": 3, "fullName": "Ana Pérez", "email": "ana@technova.com", "role": "USER" }

// UserSummary (dentro de otros objetos)
{ "id": 3, "fullName": "Ana Pérez" }

// TicketResponse
{
  "id": 12,
  "title": "No enciende el monitor",
  "description": "El monitor del puesto 4 no enciende desde esta mañana",
  "category": "HARDWARE",
  "priority": "HIGH",
  "status": "ASSIGNED",
  "requester": { "id": 3, "fullName": "Ana Pérez" },
  "technician": { "id": 2, "fullName": "Luis Gómez" },
  "createdAt": "2026-10-08T09:10:00",
  "updatedAt": "2026-10-08T10:02:00"
}
// "technician" es null mientras el ticket no está asignado

// CommentResponse
{ "id": 40, "content": "Ya revisé el cable", "author": { "id": 2, "fullName": "Luis Gómez" }, "createdAt": "2026-10-08T10:30:00" }

// StatusHistoryResponse
{ "id": 7, "previousStatus": "OPEN", "newStatus": "ASSIGNED", "changedBy": { "id": 1, "fullName": "Admin" }, "changedAt": "2026-10-08T10:02:00" }
// "previousStatus" es null en el registro de creación

// SummaryResponse
{ "total": 20, "open": 5, "assigned": 4, "inProgress": 6, "resolved": 3, "closed": 2 }
```

## Endpoints

### Autenticación y usuarios — Persona 1

| Método | Ruta | Quién | Body | Respuesta OK | Errores |
|---|---|---|---|---|---|
| POST | `/auth/register` | Público | `{ "fullName", "email", "password" }` | 201 `UserResponse` (rol siempre `USER`) | 400 validación · 409 correo duplicado |
| POST | `/auth/login` | Público | `{ "email", "password" }` | 200 `{ "token", "tokenType": "Bearer", "expiresIn", "user": UserResponse }` | 400 · 401 credenciales inválidas |
| GET | `/users` | ADMIN | — | 200 `UserResponse[]` | 401 · 403 |
| GET | `/users/technicians` | ADMIN | — | 200 `UserResponse[]` (solo `TECHNICIAN`) | 401 · 403 |
| GET | `/reports/summary` | Autenticado | — | 200 `SummaryResponse` (ADMIN: todo; TECHNICIAN: asignados; USER: propios) | 401 |

Política de contraseña propuesta: mínimo 8 caracteres, con al menos una mayúscula, una minúscula y un número.

### Tickets — Persona 2

| Método | Ruta | Quién | Body | Respuesta OK | Errores |
|---|---|---|---|---|---|
| GET | `/tickets?status=&priority=&category=` | Autenticado (ADMIN todos, TECHNICIAN asignados, USER propios) | — | 200 `TicketResponse[]` | 400 enum inválido · 401 |
| GET | `/tickets/{id}` | Dueño, técnico asignado o ADMIN | — | 200 `TicketResponse` | 401 · 403 · 404 |
| POST | `/tickets` | USER | `{ "title", "description", "category", "priority" }` | 201 `TicketResponse` (estado `OPEN`) | 400 · 401 · 403 |
| PUT | `/tickets/{id}` | Dueño, si está `OPEN` y sin técnico | `{ "title", "description", "category", "priority" }` | 200 `TicketResponse` | 400 · 403 · 404 · 409 |
| PATCH | `/tickets/{id}/assign` | ADMIN | `{ "technicianId" }` | 200 `TicketResponse` (estado `ASSIGNED`) | 400 no es técnico · 403 · 404 · 409 |
| PATCH | `/tickets/{id}/status` | Técnico asignado (`IN_PROGRESS`, `RESOLVED`) o dueño (`CLOSED`) | `{ "status" }` | 200 `TicketResponse` | 400 · 403 · 404 · 409 transición no permitida |
| GET | `/tickets/{id}/comments` | Dueño, técnico asignado o ADMIN | — | 200 `CommentResponse[]` en orden cronológico | 403 · 404 |
| POST | `/tickets/{id}/comments` | Dueño, técnico asignado o ADMIN | `{ "content" }` | 201 `CommentResponse` | 400 · 403 · 404 · 409 ticket `CLOSED` |
| GET | `/tickets/{id}/history` | Dueño, técnico asignado o ADMIN | — | 200 `StatusHistoryResponse[]` en orden cronológico | 403 · 404 |

Validaciones propuestas: `title` de 5 a 150 caracteres, `description` de 10 a 2000, `content` de 1 a 1000.

## Decisiones pendientes (anotar aquí lo que se acuerde)

- [ ] ¿Se puede reasignar un ticket en `IN_PROGRESS` o solo en `ASSIGNED`?
- [ ] ¿El ADMIN puede crear tickets?
- [ ] Ticket ajeno: ¿403 o 404? (los dos son válidos para CP-06; elegir uno)
- [ ] Correo duplicado: ¿409 o 400?

---

### Detalle: Crear un nuevo ticket (POST /api/tickets)

- **Autenticación:** requiere JWT de un USER. Un TECHNICIAN recibe 403. Si el ADMIN puede crear tickets está en "Decisiones pendientes".
- **Descripción:** crea un ticket nuevo. El estado inicial siempre es `OPEN`, el solicitante es el usuario autenticado y se guarda el primer registro del historial (`null → OPEN`).

**Request body:**

```json
{
  "title": "No enciende el monitor",
  "description": "El monitor del puesto 4 no enciende desde esta mañana",
  "category": "HARDWARE",
  "priority": "HIGH"
}
```

**Respuesta 201:**

```json
{
  "id": 12,
  "title": "No enciende el monitor",
  "description": "El monitor del puesto 4 no enciende desde esta mañana",
  "category": "HARDWARE",
  "priority": "HIGH",
  "status": "OPEN",
  "requester": { "id": 3, "fullName": "Ana Pérez" },
  "technician": null,
  "createdAt": "2026-10-09T10:00:00",
  "updatedAt": "2026-10-09T10:00:00"
}
```

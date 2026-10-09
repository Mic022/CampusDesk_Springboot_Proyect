# Diagrama entidad-relación — CAMPUSDESK

> Dueño: Persona 4. Refleja `database/schema.sql` y las entidades del paquete `entity`; si cambia uno, se actualizan los tres.

```mermaid
erDiagram
    users ||--o{ tickets : "solicita (requester_id)"
    users |o--o{ tickets : "atiende (technician_id)"
    users ||--o{ comments : "escribe (author_id)"
    users ||--o{ status_history : "cambia (changed_by_id)"
    tickets ||--o{ comments : "tiene"
    tickets ||--o{ status_history : "registra"

    users {
        BIGINT id PK
        VARCHAR(100) full_name "NOT NULL"
        VARCHAR(150) email UK "NOT NULL"
        VARCHAR(255) password "NOT NULL, hash BCrypt"
        VARCHAR(20) role "ADMIN | TECHNICIAN | USER"
        TIMESTAMP created_at "NOT NULL"
    }

    tickets {
        BIGINT id PK
        VARCHAR(150) title "NOT NULL"
        VARCHAR(2000) description "NOT NULL"
        VARCHAR(20) category "HARDWARE | SOFTWARE | NETWORK | ACCESS | OTHER"
        VARCHAR(20) priority "LOW | MEDIUM | HIGH | CRITICAL"
        VARCHAR(20) status "OPEN | ASSIGNED | IN_PROGRESS | RESOLVED | CLOSED"
        BIGINT requester_id FK "NOT NULL"
        BIGINT technician_id FK "NULL mientras no está asignado"
        TIMESTAMP created_at "NOT NULL"
        TIMESTAMP updated_at "NOT NULL"
    }

    comments {
        BIGINT id PK
        BIGINT ticket_id FK "NOT NULL"
        BIGINT author_id FK "NOT NULL"
        VARCHAR(1000) content "NOT NULL"
        TIMESTAMP created_at "NOT NULL"
    }

    status_history {
        BIGINT id PK
        BIGINT ticket_id FK "NOT NULL"
        VARCHAR(20) previous_status "NULL en el registro de creación"
        VARCHAR(20) new_status "NOT NULL"
        BIGINT changed_by_id FK "NOT NULL"
        TIMESTAMP changed_at "NOT NULL"
    }
```

## Notas

- `users` se llama así porque `user` es palabra reservada en PostgreSQL.
- Los enums se guardan como texto (`@Enumerated(EnumType.STRING)`) y la base los restringe con `CHECK`.
- Un ticket tiene dos relaciones con `users`: quien lo pide (obligatoria) y el técnico asignado (opcional).
- Al borrar un ticket se borran sus comentarios y su historial (`ON DELETE CASCADE`). La API no tiene endpoint para borrar tickets; es solo para limpiar datos de prueba.
- Índices: `tickets(requester_id)`, `tickets(technician_id)`, `tickets(status)`, `comments(ticket_id)`, `status_history(ticket_id)`.

-- =============================================================
-- CAMPUSDESK · Datos de prueba
-- Dueño: Persona 4
--
-- ORDEN: primero schema.sql, luego arrancar el backend UNA vez
-- (su DataInitializer crea al ADMIN y a los técnicos tech1/tech2), y después este archivo:
--   Docker:    docker exec -i campusdesk-postgres psql -U postgres -d campusdesk -v ON_ERROR_STOP=1 < database/data.sql
--   Instalado: psql -U postgres -d campusdesk -v ON_ERROR_STOP=1 -f database/data.sql
--
-- Se puede ejecutar varias veces: borra y vuelve a crear los tickets de los usuarios de prueba.
-- Contraseña de los tres usuarios USER: User12345 (aquí solo va su hash BCrypt).
-- Correos siempre en minúsculas: el backend los normaliza al registrar y al iniciar sesión.
-- =============================================================

BEGIN;

-- 0. Verificar que el backend ya creó al ADMIN y a los técnicos
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE role = 'ADMIN')
       OR NOT EXISTS (SELECT 1 FROM users WHERE email = 'tech1@technova.com')
       OR NOT EXISTS (SELECT 1 FROM users WHERE email = 'tech2@technova.com') THEN
        RAISE EXCEPTION 'Faltan el ADMIN o los técnicos. Arranca el backend una vez (DataInitializer) y vuelve a ejecutar data.sql';
    END IF;
END $$;

-- 1. Usuarios USER (contraseña: User12345)
INSERT INTO users (full_name, email, password, role) VALUES
    ('Ana Pérez',    'ana@technova.com',   '$2a$10$E8F9plUyO4GAFD57BAc4o.sBV5.PXys3vvQall2D0BfZ2MtHTRUAS', 'USER'),
    ('Pedro Díaz',   'pedro@technova.com', '$2a$10$E8F9plUyO4GAFD57BAc4o.sBV5.PXys3vvQall2D0BfZ2MtHTRUAS', 'USER'),
    ('Sofía Torres', 'sofia@technova.com', '$2a$10$E8F9plUyO4GAFD57BAc4o.sBV5.PXys3vvQall2D0BfZ2MtHTRUAS', 'USER')
ON CONFLICT (email) DO NOTHING;

-- 2. Empezar de cero con los tickets de prueba (comentarios e historial se borran en cascada)
DELETE FROM tickets
WHERE requester_id IN (SELECT id FROM users WHERE email IN ('ana@technova.com', 'pedro@technova.com', 'sofia@technova.com'));

-- 3. Funciones temporales (desaparecen al cerrar la sesión)

-- Crea un ticket con todo su historial hasta final_status, siguiendo el ciclo de vida:
-- OPEN (solicitante) → ASSIGNED (admin) → IN_PROGRESS (técnico) → RESOLVED (técnico) → CLOSED (solicitante).
-- El ticket se crea hace "age" y cada cambio de estado ocurre 3 horas después del anterior.
CREATE FUNCTION pg_temp.demo_ticket(
    p_title TEXT, p_description TEXT, p_category TEXT, p_priority TEXT, p_final_status TEXT,
    p_requester_email TEXT, p_technician_email TEXT, p_age INTERVAL
) RETURNS BIGINT AS $$
DECLARE
    v_steps       TEXT[] := ARRAY['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
    v_last        INT    := array_position(v_steps, p_final_status);
    v_requester   BIGINT := (SELECT id FROM users WHERE email = p_requester_email);
    v_technician  BIGINT := (SELECT id FROM users WHERE email = p_technician_email);
    v_admin       BIGINT := (SELECT id FROM users WHERE role = 'ADMIN' ORDER BY id LIMIT 1);
    v_created     TIMESTAMP := LOCALTIMESTAMP - p_age;
    v_ticket      BIGINT;
    v_changed_by  BIGINT;
BEGIN
    IF v_last IS NULL OR v_requester IS NULL OR (v_last > 1 AND v_technician IS NULL) THEN
        RAISE EXCEPTION 'Datos inválidos para el ticket "%"', p_title;
    END IF;

    INSERT INTO tickets (title, description, category, priority, status, requester_id, technician_id, created_at, updated_at)
    VALUES (p_title, p_description, p_category, p_priority, p_final_status, v_requester,
            CASE WHEN v_last > 1 THEN v_technician END,
            v_created, v_created + (v_last - 1) * INTERVAL '3 hours')
    RETURNING id INTO v_ticket;

    FOR i IN 1..v_last LOOP
        v_changed_by := CASE v_steps[i]
            WHEN 'OPEN'     THEN v_requester
            WHEN 'ASSIGNED' THEN v_admin
            WHEN 'CLOSED'   THEN v_requester
            ELSE v_technician
        END;
        INSERT INTO status_history (ticket_id, previous_status, new_status, changed_by_id, changed_at)
        VALUES (v_ticket, CASE WHEN i > 1 THEN v_steps[i - 1] END, v_steps[i], v_changed_by,
                v_created + (i - 1) * INTERVAL '3 hours');
    END LOOP;

    RETURN v_ticket;
END;
$$ LANGUAGE plpgsql;

-- Agrega un comentario "p_after" después de creado el ticket. author_email NULL = el ADMIN.
CREATE FUNCTION pg_temp.demo_comment(p_ticket BIGINT, p_author_email TEXT, p_content TEXT, p_after INTERVAL)
RETURNS VOID AS $$
    INSERT INTO comments (ticket_id, author_id, content, created_at)
    SELECT t.id,
           COALESCE((SELECT id FROM users WHERE email = p_author_email),
                    (SELECT id FROM users WHERE role = 'ADMIN' ORDER BY id LIMIT 1)),
           p_content, t.created_at + p_after
    FROM tickets t
    WHERE t.id = p_ticket;
$$ LANGUAGE sql;

-- 4. Tickets en todos los estados, con comentarios
DO $$
DECLARE
    t BIGINT;
BEGIN
    -- OPEN
    PERFORM pg_temp.demo_ticket('No enciende el monitor del puesto 4',
        'El monitor del puesto 4 de la sala de sistemas no enciende desde esta mañana; el cable de poder está conectado.',
        'HARDWARE', 'HIGH', 'OPEN', 'ana@technova.com', NULL, INTERVAL '5 hours');

    t := pg_temp.demo_ticket('Sin acceso a la plataforma de notas',
        'Al iniciar sesión en la plataforma de notas aparece "usuario bloqueado" aunque la contraseña es correcta.',
        'ACCESS', 'MEDIUM', 'OPEN', 'pedro@technova.com', NULL, INTERVAL '1 day');
    PERFORM pg_temp.demo_comment(t, 'pedro@technova.com', 'Lo intenté desde otro computador y pasa lo mismo.', INTERVAL '2 hours');

    -- ASSIGNED
    t := pg_temp.demo_ticket('Sin internet en el laboratorio 2',
        'Ningún equipo del laboratorio 2 tiene conexión a internet; la red local sí funciona.',
        'NETWORK', 'CRITICAL', 'ASSIGNED', 'ana@technova.com', 'tech1@technova.com', INTERVAL '1 day 4 hours');
    PERFORM pg_temp.demo_comment(t, NULL, 'Asignado con prioridad: hay clase en el laboratorio esta tarde.', INTERVAL '3 hours 10 minutes');

    PERFORM pg_temp.demo_ticket('Instalar lector de PDF',
        'Necesito un lector de PDF instalado en el equipo de la recepción para revisar documentos.',
        'SOFTWARE', 'LOW', 'ASSIGNED', 'sofia@technova.com', 'tech2@technova.com', INTERVAL '2 days');

    -- IN_PROGRESS
    t := pg_temp.demo_ticket('Error al abrir Office',
        'Word y Excel se cierran solos al abrirlos, con el mensaje "la aplicación dejó de funcionar".',
        'SOFTWARE', 'HIGH', 'IN_PROGRESS', 'pedro@technova.com', 'tech1@technova.com', INTERVAL '2 days 6 hours');
    PERFORM pg_temp.demo_comment(t, 'tech1@technova.com', 'Estoy reparando la instalación de Office; tarda unos 30 minutos.', INTERVAL '6 hours 15 minutes');
    PERFORM pg_temp.demo_comment(t, 'pedro@technova.com', 'Gracias, mientras tanto uso el equipo de al lado.', INTERVAL '6 hours 40 minutes');

    PERFORM pg_temp.demo_ticket('La impresora atasca el papel',
        'La impresora del segundo piso atasca casi todas las hojas desde ayer.',
        'HARDWARE', 'MEDIUM', 'IN_PROGRESS', 'sofia@technova.com', 'tech2@technova.com', INTERVAL '3 days');

    -- RESOLVED
    t := pg_temp.demo_ticket('Restablecer la contraseña del correo',
        'Olvidé la contraseña del correo institucional y no me llegan los mensajes de recuperación.',
        'ACCESS', 'MEDIUM', 'RESOLVED', 'ana@technova.com', 'tech2@technova.com', INTERVAL '4 days');
    PERFORM pg_temp.demo_comment(t, 'tech2@technova.com', 'Contraseña restablecida; te envié la temporal a tu correo personal.', INTERVAL '9 hours');

    -- CLOSED
    t := pg_temp.demo_ticket('Cable HDMI para la sala de reuniones',
        'La sala de reuniones no tiene cable HDMI para conectar el portátil al proyector.',
        'OTHER', 'LOW', 'CLOSED', 'pedro@technova.com', 'tech1@technova.com', INTERVAL '6 days');
    PERFORM pg_temp.demo_comment(t, 'tech1@technova.com', 'Dejé un cable HDMI de 3 metros en la sala.', INTERVAL '9 hours');
    PERFORM pg_temp.demo_comment(t, 'pedro@technova.com', 'Funciona perfecto, gracias.', INTERVAL '11 hours');

    t := pg_temp.demo_ticket('WiFi intermitente en la biblioteca',
        'La red WiFi de la biblioteca se desconecta cada pocos minutos.',
        'NETWORK', 'HIGH', 'CLOSED', 'sofia@technova.com', 'tech2@technova.com', INTERVAL '7 days');
    PERFORM pg_temp.demo_comment(t, 'tech2@technova.com', 'Cambié el canal del punto de acceso; había interferencia con otra red.', INTERVAL '9 hours 30 minutes');
END $$;

COMMIT;

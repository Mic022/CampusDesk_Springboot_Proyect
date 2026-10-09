package com.technova.campusdesk.repository;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import com.technova.campusdesk.entity.Ticket;
import com.technova.campusdesk.entity.User;
import com.technova.campusdesk.entity.enums.Category;
import com.technova.campusdesk.entity.enums.Priority;
import com.technova.campusdesk.entity.enums.Role;
import com.technova.campusdesk.entity.enums.TicketStatus;

/**
 * Base de las pruebas de repositorios: H2 del perfil test con database/schema.sql.
 * replace = NONE para usar esa base (en modo PostgreSQL) y no una H2 genérica.
 * Cada prueba corre en una transacción que se deshace al terminar.
 */
@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
abstract class RepositoryTestSupport {

	@Autowired
	protected TestEntityManager em;

	/**
	 * La base H2 se comparte con otras pruebas (por ejemplo, el DataInitializer crea ADMIN y técnicos
	 * al arrancar la aplicación completa). Se vacía al empezar cada prueba para que no dependa del orden;
	 * el borrado se deshace al terminar, junto con la transacción de la prueba.
	 */
	@BeforeEach
	void startWithEmptyTables() {
		em.getEntityManager().createQuery("DELETE FROM Comment").executeUpdate();
		em.getEntityManager().createQuery("DELETE FROM StatusHistory").executeUpdate();
		em.getEntityManager().createQuery("DELETE FROM Ticket").executeUpdate();
		em.getEntityManager().createQuery("DELETE FROM User").executeUpdate();
	}

	protected User persistUser(String fullName, String email, Role role) {
		return em.persist(User.builder()
				.fullName(fullName)
				.email(email)
				.password("$2a$10$hashDePruebaNoEsUnaContrasenaReal")
				.role(role)
				.build());
	}

	protected Ticket persistTicket(User requester, User technician, TicketStatus status, Priority priority) {
		return em.persist(Ticket.builder()
				.title("Ticket de prueba")
				.description("Descripción del ticket de prueba")
				.category(Category.HARDWARE)
				.priority(priority)
				.status(status)
				.requester(requester)
				.technician(technician)
				.build());
	}

}

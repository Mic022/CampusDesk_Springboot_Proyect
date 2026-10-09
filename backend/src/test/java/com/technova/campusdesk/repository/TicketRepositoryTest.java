package com.technova.campusdesk.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.hibernate.Hibernate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import com.technova.campusdesk.entity.Ticket;
import com.technova.campusdesk.entity.User;
import com.technova.campusdesk.entity.enums.Category;
import com.technova.campusdesk.entity.enums.Priority;
import com.technova.campusdesk.entity.enums.Role;
import com.technova.campusdesk.entity.enums.TicketStatus;

class TicketRepositoryTest extends RepositoryTestSupport {

	@Autowired
	private TicketRepository ticketRepository;

	private User ana;
	private User pedro;
	private User luis;

	@BeforeEach
	void setUp() {
		ana = persistUser("Ana Pérez", "ana@technova.com", Role.USER);
		pedro = persistUser("Pedro Díaz", "pedro@technova.com", Role.USER);
		luis = persistUser("Luis Gómez", "luis@technova.com", Role.TECHNICIAN);
	}

	@Test
	void newTicketStartsOpenWithDates() {
		Ticket ticket = ticketRepository.saveAndFlush(Ticket.builder()
				.title("No enciende el monitor")
				.description("El monitor del puesto 4 no enciende")
				.category(Category.HARDWARE)
				.priority(Priority.HIGH)
				.requester(ana)
				.build());

		assertThat(ticket.getStatus()).isEqualTo(TicketStatus.OPEN);
		assertThat(ticket.getTechnician()).isNull();
		assertThat(ticket.getCreatedAt()).isNotNull();
		assertThat(ticket.getUpdatedAt()).isEqualTo(ticket.getCreatedAt());
	}

	@Test
	void findByIdLoadsRequesterAndTechnician() {
		Long id = persistTicket(ana, luis, TicketStatus.ASSIGNED, Priority.HIGH).getId();
		em.flush();
		em.clear();

		Ticket ticket = ticketRepository.findById(id).orElseThrow();

		// Cargados por el EntityGraph: el mapper puede leerlos fuera de la transacción.
		assertThat(Hibernate.isInitialized(ticket.getRequester())).isTrue();
		assertThat(Hibernate.isInitialized(ticket.getTechnician())).isTrue();
		assertThat(ticket.getRequester().getFullName()).isEqualTo("Ana Pérez");
		assertThat(ticket.getTechnician().getFullName()).isEqualTo("Luis Gómez");
	}

	@Test
	void specificationCombinesRoleVisibilityAndFilters() {
		persistTicket(ana, null, TicketStatus.OPEN, Priority.LOW);
		persistTicket(ana, luis, TicketStatus.ASSIGNED, Priority.HIGH);
		persistTicket(pedro, null, TicketStatus.OPEN, Priority.LOW);
		em.flush();
		em.clear();

		// USER: solo sus tickets, filtrados por estado
		Specification<Ticket> anasOpenTickets = (root, query, cb) -> cb.and(
				cb.equal(root.get("requester").get("id"), ana.getId()),
				cb.equal(root.get("status"), TicketStatus.OPEN));

		List<Ticket> result = ticketRepository.findAll(anasOpenTickets, Sort.by(Sort.Direction.DESC, "createdAt"));

		assertThat(result).hasSize(1);
		assertThat(result.get(0).getRequester().getFullName()).isEqualTo("Ana Pérez");
		assertThat(result.get(0).getPriority()).isEqualTo(Priority.LOW);
	}

	@Test
	void countsForDashboard() {
		persistTicket(ana, null, TicketStatus.OPEN, Priority.LOW);
		persistTicket(ana, luis, TicketStatus.IN_PROGRESS, Priority.MEDIUM);
		persistTicket(pedro, luis, TicketStatus.IN_PROGRESS, Priority.CRITICAL);
		persistTicket(pedro, null, TicketStatus.OPEN, Priority.LOW);

		assertThat(ticketRepository.countByStatus(TicketStatus.OPEN)).isEqualTo(2);
		assertThat(ticketRepository.countByStatus(TicketStatus.CLOSED)).isZero();
		assertThat(ticketRepository.countByRequesterIdAndStatus(ana.getId(), TicketStatus.OPEN)).isEqualTo(1);
		assertThat(ticketRepository.countByTechnicianIdAndStatus(luis.getId(), TicketStatus.IN_PROGRESS)).isEqualTo(2);
	}

}

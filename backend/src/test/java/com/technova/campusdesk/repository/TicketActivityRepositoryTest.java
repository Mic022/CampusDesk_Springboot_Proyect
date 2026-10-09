package com.technova.campusdesk.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.hibernate.Hibernate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.technova.campusdesk.entity.Comment;
import com.technova.campusdesk.entity.StatusHistory;
import com.technova.campusdesk.entity.Ticket;
import com.technova.campusdesk.entity.User;
import com.technova.campusdesk.entity.enums.Priority;
import com.technova.campusdesk.entity.enums.Role;
import com.technova.campusdesk.entity.enums.TicketStatus;

/** Comentarios e historial de estados de un ticket. */
class TicketActivityRepositoryTest extends RepositoryTestSupport {

	@Autowired
	private CommentRepository commentRepository;

	@Autowired
	private StatusHistoryRepository statusHistoryRepository;

	private User ana;
	private User admin;
	private Ticket ticket;
	private Ticket otherTicket;

	@BeforeEach
	void setUp() {
		ana = persistUser("Ana Pérez", "ana@technova.com", Role.USER);
		admin = persistUser("Admin", "admin@technova.com", Role.ADMIN);
		ticket = persistTicket(ana, null, TicketStatus.OPEN, Priority.HIGH);
		otherTicket = persistTicket(ana, null, TicketStatus.OPEN, Priority.LOW);
	}

	@Test
	void commentsOfTicketInChronologicalOrderWithAuthor() {
		persistComment(ticket, ana, "Primero");
		persistComment(otherTicket, ana, "De otro ticket");
		persistComment(ticket, admin, "Segundo");
		em.flush();
		em.clear();

		List<Comment> comments = commentRepository.findByTicketIdOrderByCreatedAtAscIdAsc(ticket.getId());

		assertThat(comments).extracting(Comment::getContent).containsExactly("Primero", "Segundo");
		assertThat(Hibernate.isInitialized(comments.get(1).getAuthor())).isTrue();
		assertThat(comments.get(1).getAuthor().getFullName()).isEqualTo("Admin");
	}

	@Test
	void historyOfTicketInChronologicalOrder() {
		persistHistory(ticket, null, TicketStatus.OPEN, ana);
		persistHistory(ticket, TicketStatus.OPEN, TicketStatus.ASSIGNED, admin);
		em.flush();
		em.clear();

		List<StatusHistory> history = statusHistoryRepository.findByTicketIdOrderByChangedAtAscIdAsc(ticket.getId());

		assertThat(history).hasSize(2);
		// El registro de creación no tiene estado anterior.
		assertThat(history.get(0).getPreviousStatus()).isNull();
		assertThat(history.get(0).getNewStatus()).isEqualTo(TicketStatus.OPEN);
		assertThat(history.get(1).getNewStatus()).isEqualTo(TicketStatus.ASSIGNED);
		assertThat(Hibernate.isInitialized(history.get(1).getChangedBy())).isTrue();
		assertThat(history.get(1).getChangedBy().getFullName()).isEqualTo("Admin");
		assertThat(history.get(1).getChangedAt()).isNotNull();
	}

	private void persistComment(Ticket ticket, User author, String content) {
		em.persist(Comment.builder().ticket(ticket).author(author).content(content).build());
	}

	private void persistHistory(Ticket ticket, TicketStatus previous, TicketStatus next, User changedBy) {
		em.persist(StatusHistory.builder()
				.ticket(ticket)
				.previousStatus(previous)
				.newStatus(next)
				.changedBy(changedBy)
				.build());
	}

}

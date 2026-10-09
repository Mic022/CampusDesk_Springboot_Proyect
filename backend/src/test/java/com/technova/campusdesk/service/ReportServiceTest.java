package com.technova.campusdesk.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;

import com.technova.campusdesk.dto.response.SummaryResponse;
import com.technova.campusdesk.entity.User;
import com.technova.campusdesk.entity.enums.Role;
import com.technova.campusdesk.entity.enums.TicketStatus;
import com.technova.campusdesk.repository.TicketRepository;

class ReportServiceTest {

	private final TicketRepository ticketRepository = mock(TicketRepository.class);
	private final ReportService reportService = new ReportService(ticketRepository);

	@Test
	void adminSeesAllTickets() {
		when(ticketRepository.countByStatus(TicketStatus.OPEN)).thenReturn(5L);
		when(ticketRepository.countByStatus(TicketStatus.ASSIGNED)).thenReturn(4L);
		when(ticketRepository.countByStatus(TicketStatus.IN_PROGRESS)).thenReturn(6L);
		when(ticketRepository.countByStatus(TicketStatus.RESOLVED)).thenReturn(3L);
		when(ticketRepository.countByStatus(TicketStatus.CLOSED)).thenReturn(2L);

		SummaryResponse summary = reportService.getSummary(user(1L, Role.ADMIN));

		assertThat(summary).isEqualTo(new SummaryResponse(20, 5, 4, 6, 3, 2));
		verify(ticketRepository, never()).countByRequesterIdAndStatus(anyLong(), any());
		verify(ticketRepository, never()).countByTechnicianIdAndStatus(anyLong(), any());
	}

	@Test
	void technicianSeesOnlyAssignedTickets() {
		when(ticketRepository.countByTechnicianIdAndStatus(2L, TicketStatus.ASSIGNED)).thenReturn(1L);
		when(ticketRepository.countByTechnicianIdAndStatus(2L, TicketStatus.IN_PROGRESS)).thenReturn(2L);

		SummaryResponse summary = reportService.getSummary(user(2L, Role.TECHNICIAN));

		assertThat(summary).isEqualTo(new SummaryResponse(3, 0, 1, 2, 0, 0));
		verify(ticketRepository, never()).countByStatus(any());
	}

	@Test
	void userSeesOnlyOwnTickets() {
		when(ticketRepository.countByRequesterIdAndStatus(3L, TicketStatus.OPEN)).thenReturn(2L);
		when(ticketRepository.countByRequesterIdAndStatus(3L, TicketStatus.CLOSED)).thenReturn(1L);

		SummaryResponse summary = reportService.getSummary(user(3L, Role.USER));

		assertThat(summary).isEqualTo(new SummaryResponse(3, 2, 0, 0, 0, 1));
		verify(ticketRepository, never()).countByStatus(any());
	}

	private static User user(Long id, Role role) {
		return User.builder().id(id).fullName("x").email(id + "@technova.com").password("hash").role(role).build();
	}

}

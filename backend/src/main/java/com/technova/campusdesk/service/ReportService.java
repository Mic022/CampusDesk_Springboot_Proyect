package com.technova.campusdesk.service;

import java.util.function.ToLongFunction;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.technova.campusdesk.dto.response.SummaryResponse;
import com.technova.campusdesk.entity.User;
import com.technova.campusdesk.entity.enums.TicketStatus;
import com.technova.campusdesk.repository.TicketRepository;

import lombok.RequiredArgsConstructor;

/**
 * Indicadores del dashboard. Cada rol ve solo sus tickets:
 * ADMIN todos, TECHNICIAN los que tiene asignados y USER los que creó.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

	private final TicketRepository ticketRepository;

	public SummaryResponse getSummary(User user) {
		ToLongFunction<TicketStatus> counter = switch (user.getRole()) {
			case ADMIN -> ticketRepository::countByStatus;
			case TECHNICIAN -> status -> ticketRepository.countByTechnicianIdAndStatus(user.getId(), status);
			case USER -> status -> ticketRepository.countByRequesterIdAndStatus(user.getId(), status);
		};

		long open = counter.applyAsLong(TicketStatus.OPEN);
		long assigned = counter.applyAsLong(TicketStatus.ASSIGNED);
		long inProgress = counter.applyAsLong(TicketStatus.IN_PROGRESS);
		long resolved = counter.applyAsLong(TicketStatus.RESOLVED);
		long closed = counter.applyAsLong(TicketStatus.CLOSED);

		return new SummaryResponse(open + assigned + inProgress + resolved + closed,
				open, assigned, inProgress, resolved, closed);
	}

}

package com.technova.campusdesk.service;

import com.technova.campusdesk.dto.request.TicketRequest;
import com.technova.campusdesk.dto.response.TicketResponse;
import com.technova.campusdesk.entity.Ticket;
import com.technova.campusdesk.entity.User;
import com.technova.campusdesk.entity.enums.TicketStatus;
import com.technova.campusdesk.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;

    @Transactional
    public TicketResponse createTicket(TicketRequest request, User currentUser) {
        Ticket ticket = new Ticket();
        ticket.setTitle(request.title());
        ticket.setDescription(request.description());
        ticket.setCategory(request.category());
        ticket.setPriority(request.priority());
        ticket.setStatus(TicketStatus.ABIERTA); // Regla de negocio: siempre inicia ABIERTA
        ticket.setRequester(currentUser);
        // technician remains null until assigned

        Ticket savedTicket = ticketRepository.save(ticket);

        // TODO Step 7: Connect StatusHistoryService.record(savedTicket, null, TicketStatus.ABIERTA, currentUser);

        return mapToResponse(savedTicket);
    }

    private TicketResponse mapToResponse(Ticket ticket) {
        return new TicketResponse(
            ticket.getId(),
            ticket.getTitle(),
            ticket.getDescription(),
            ticket.getCategory(),
            ticket.getPriority(),
            ticket.getStatus(),
            new TicketResponse.UserSummary(ticket.getRequester().getId(), ticket.getRequester().getFullName()),
            ticket.getTechnician() != null ? new TicketResponse.UserSummary(ticket.getTechnician().getId(), ticket.getTechnician().getFullName()) : null,
            ticket.getCreatedAt(),
            ticket.getUpdatedAt()
        );
    }
}
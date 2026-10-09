package com.technova.campusdesk.service;

import com.technova.campusdesk.dto.request.TicketFilter;
import com.technova.campusdesk.dto.request.TicketRequest;
import com.technova.campusdesk.dto.response.TicketResponse;
import com.technova.campusdesk.entity.Ticket;
import com.technova.campusdesk.entity.User;
import com.technova.campusdesk.entity.enums.Role;
import com.technova.campusdesk.entity.enums.TicketStatus;
import com.technova.campusdesk.exception.BusinessRuleException;
import com.technova.campusdesk.exception.ForbiddenException;
import com.technova.campusdesk.exception.ResourceNotFoundException;
import com.technova.campusdesk.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final StatusHistoryService statusHistoryService; // <-- NUEVO

    @Transactional
    public TicketResponse createTicket(TicketRequest request, User currentUser) {
        Ticket ticket = new Ticket();
        ticket.setTitle(request.title());
        ticket.setDescription(request.description());
        ticket.setCategory(request.category());
        ticket.setPriority(request.priority());
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setRequester(currentUser);

        Ticket savedTicket = ticketRepository.save(ticket);

        // PASO 7: Conectar el historial de estados a la creación
        statusHistoryService.record(savedTicket, null, TicketStatus.OPEN, currentUser);

        return mapToResponse(savedTicket);
    }

    public List<TicketResponse> listTickets(TicketFilter filter, User currentUser) {
        Specification<Ticket> spec = TicketSpecification.filterByRoleAndCriteria(currentUser, filter);
        List<Ticket> tickets = ticketRepository.findAll(spec);
        return tickets.stream().map(this::mapToResponse).toList();
    }

    private Ticket getAccessibleTicket(Long id, User currentUser) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket no encontrado con id: " + id));

        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        boolean isRequester = ticket.getRequester().getId().equals(currentUser.getId());
        boolean isAssignedTechnician = ticket.getTechnician() != null && 
                                       ticket.getTechnician().getId().equals(currentUser.getId());

        if (!isAdmin && !isRequester && !isAssignedTechnician) {
            throw new ForbiddenException("No tienes permiso para acceder a este ticket.");
        }

        return ticket;
    }

    public TicketResponse getTicketById(Long id, User currentUser) {
        Ticket ticket = getAccessibleTicket(id, currentUser);
        return mapToResponse(ticket);
    }

    @Transactional
    public TicketResponse updateTicket(Long id, TicketRequest request, User currentUser) {
        Ticket ticket = getAccessibleTicket(id, currentUser);

        if (!ticket.getRequester().getId().equals(currentUser.getId())) {
            throw new ForbiddenException("Solo el solicitante puede editar este ticket.");
        }

        if (ticket.getStatus() != TicketStatus.OPEN) {
            throw new BusinessRuleException("Solo se pueden editar tickets con estado OPEN.");
        }
        if (ticket.getTechnician() != null) {
            throw new BusinessRuleException("No se puede editar un ticket que ya tiene un técnico asignado.");
        }

        ticket.setTitle(request.title());
        ticket.setDescription(request.description());
        ticket.setCategory(request.category());
        ticket.setPriority(request.priority());

        Ticket updatedTicket = ticketRepository.save(ticket);
        return mapToResponse(updatedTicket);
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
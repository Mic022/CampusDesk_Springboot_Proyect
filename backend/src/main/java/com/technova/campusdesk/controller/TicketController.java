package com.technova.campusdesk.controller;

import com.technova.campusdesk.dto.request.TicketFilter;
import com.technova.campusdesk.dto.request.TicketRequest;
import com.technova.campusdesk.dto.response.TicketResponse;
import com.technova.campusdesk.entity.User;
import com.technova.campusdesk.entity.enums.Category;
import com.technova.campusdesk.entity.enums.Priority;
import com.technova.campusdesk.entity.enums.TicketStatus;
import com.technova.campusdesk.security.SecurityUtils;
import com.technova.campusdesk.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    // PASO 3: Crear ticket
    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(@Valid @RequestBody TicketRequest request) {
        User currentUser = SecurityUtils.getCurrentUser(); 
        TicketResponse response = ticketService.createTicket(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // PASO 4: Listar tickets con filtros
    @GetMapping
    public ResponseEntity<List<TicketResponse>> listTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) Category category
    ) {
        User currentUser = SecurityUtils.getCurrentUser();
        TicketFilter filter = new TicketFilter(status, priority, category);
        List<TicketResponse> tickets = ticketService.listTickets(filter, currentUser);
        return ResponseEntity.ok(tickets);
    }

    // PASO 5: Detalle del ticket
    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable Long id) {
        User currentUser = SecurityUtils.getCurrentUser();
        TicketResponse ticket = ticketService.getTicketById(id, currentUser);
        return ResponseEntity.ok(ticket);
    }

    // PASO 6: Editar ticket
    @PutMapping("/{id}")
    public ResponseEntity<TicketResponse> updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody TicketRequest request
    ) {
        User currentUser = SecurityUtils.getCurrentUser();
        TicketResponse updatedTicket = ticketService.updateTicket(id, request, currentUser);
        return ResponseEntity.ok(updatedTicket);
    }
    
    // TODO Pasos 8-11: Asignar, cambiar estado, historial y comentarios
}
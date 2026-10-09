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

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(@Valid @RequestBody TicketRequest request) {
        User currentUser = SecurityUtils.getCurrentUser(); 
        TicketResponse response = ticketService.createTicket(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

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
    
    // TODO Steps 5-11: Add GET by ID, PUT, PATCH assign, PATCH status, comments, and history endpoints
}
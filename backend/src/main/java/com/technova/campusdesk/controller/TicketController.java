package com.technova.campusdesk.controller;

import com.technova.campusdesk.dto.request.TicketRequest;
import com.technova.campusdesk.dto.response.TicketResponse;
import com.technova.campusdesk.entity.User;
import com.technova.campusdesk.service.TicketService;
import com.technova.campusdesk.security.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    
    // TODO Steps 4-11: Add GET, PUT, PATCH endpoints for listing, updating, assigning, and comments
}
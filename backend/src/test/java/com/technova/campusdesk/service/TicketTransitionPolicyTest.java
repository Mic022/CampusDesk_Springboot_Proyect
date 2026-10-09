package com.technova.campusdesk.service;

import com.technova.campusdesk.entity.enums.Role;
import com.technova.campusdesk.entity.enums.TicketStatus;
import com.technova.campusdesk.exception.BusinessRuleException;
import com.technova.campusdesk.exception.ForbiddenException;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class TicketTransitionPolicyTest {

    @Test
    void adminPuedeAsignarTicketAbierto() {
        assertDoesNotThrow(() -> 
            TicketTransitionPolicy.validateTransition(TicketStatus.OPEN, TicketStatus.ASSIGNED, Role.ADMIN)
        );
    }

    @Test
    void usuarioNormalNoPuedeAsignarTicket() {
        assertThrows(ForbiddenException.class, () -> 
            TicketTransitionPolicy.validateTransition(TicketStatus.OPEN, TicketStatus.ASSIGNED, Role.USER)
        );
    }

    @Test
    void noSePuedeSaltarDeAbiertaAResuelta() {
        assertThrows(BusinessRuleException.class, () -> 
            TicketTransitionPolicy.validateTransition(TicketStatus.OPEN, TicketStatus.RESOLVED, Role.ADMIN)
        );
    }

    @Test
    void ticketCerradoNoPuedeCambiar() {
        assertThrows(BusinessRuleException.class, () -> 
            TicketTransitionPolicy.validateTransition(TicketStatus.CLOSED, TicketStatus.OPEN, Role.ADMIN)
        );
    }
}
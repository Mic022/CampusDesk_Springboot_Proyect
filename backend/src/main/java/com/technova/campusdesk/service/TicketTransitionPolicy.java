package com.technova.campusdesk.service;

import com.technova.campusdesk.entity.enums.Role;
import com.technova.campusdesk.entity.enums.TicketStatus;
import com.technova.campusdesk.exception.BusinessRuleException;
import com.technova.campusdesk.exception.ForbiddenException;

public class TicketTransitionPolicy {

    public static void validateTransition(TicketStatus current, TicketStatus next, Role userRole) {
        if (current == next) {
            return; // No change, valid
        }

        switch (current) {
            case OPEN -> {
                if (next == TicketStatus.ASSIGNED) {
                    if (userRole != Role.ADMIN) {
                        throw new ForbiddenException("Solo un ADMIN puede asignar un ticket OPEN.");
                    }
                } else {
                    throw new BusinessRuleException("Desde OPEN solo se puede pasar a ASSIGNED.");
                }
            }
            case ASSIGNED -> {
                if (next == TicketStatus.IN_PROGRESS) {
                    if (userRole != Role.TECHNICIAN) {
                        throw new ForbiddenException("Solo un TÉCNICO puede iniciar el proceso de un ticket ASSIGNED.");
                    }
                } else {
                    throw new BusinessRuleException("Desde ASSIGNED solo se puede pasar a IN_PROGRESS.");
                }
            }
            case IN_PROGRESS -> {
                if (next == TicketStatus.RESOLVED) {
                    if (userRole != Role.TECHNICIAN) {
                        throw new ForbiddenException("Solo un TÉCNICO puede marcar un ticket como RESOLVED.");
                    }
                } else {
                    throw new BusinessRuleException("Desde IN_PROGRESS solo se puede pasar a RESOLVED.");
                }
            }
            case RESOLVED -> {
                if (next == TicketStatus.CLOSED) {
                    if (userRole != Role.USER && userRole != Role.ADMIN) {
                        throw new ForbiddenException("Solo el SOLICITANTE o un ADMIN pueden cerrar un ticket RESOLVED.");
                    }
                } else {
                    throw new BusinessRuleException("Desde RESOLVED solo se puede pasar a CLOSED.");
                }
            }
            case CLOSED -> {
                throw new BusinessRuleException("Un ticket CLOSED no puede cambiar de estado.");
            }
            default -> throw new BusinessRuleException("Transición de estado no reconocida.");
        }
    }
}
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
            case ABIERTA -> {
                if (next == TicketStatus.ASIGNADA) {
                    if (userRole != Role.ADMIN) {
                        throw new ForbiddenException("Solo un ADMIN puede asignar un ticket ABIERTO.");
                    }
                } else {
                    throw new BusinessRuleException("Desde ABIERTA solo se puede pasar a ASIGNADA.");
                }
            }
            case ASIGNADA -> {
                if (next == TicketStatus.EN_PROCESO) {
                    if (userRole != Role.TECHNICIAN) {
                        throw new ForbiddenException("Solo un TÉCNICO puede iniciar el proceso de un ticket ASIGNADO.");
                    }
                } else {
                    throw new BusinessRuleException("Desde ASIGNADA solo se puede pasar a EN_PROCESO.");
                }
            }
            case EN_PROCESO -> {
                if (next == TicketStatus.RESUELTA) {
                    if (userRole != Role.TECHNICIAN) {
                        throw new ForbiddenException("Solo un TÉCNICO puede marcar un ticket como RESUELTO.");
                    }
                } else {
                    throw new BusinessRuleException("Desde EN_PROCESO solo se puede pasar a RESUELTA.");
                }
            }
            case RESUELTA -> {
                if (next == TicketStatus.CERRADA) {
                    if (userRole != Role.USER && userRole != Role.ADMIN) {
                        throw new ForbiddenException("Solo el SOLICITANTE o un ADMIN pueden cerrar un ticket RESUELTO.");
                    }
                } else {
                    throw new BusinessRuleException("Desde RESUELTA solo se puede pasar a CERRADA.");
                }
            }
            case CERRADA -> {
                throw new BusinessRuleException("Un ticket CERRADO no puede cambiar de estado.");
            }
            default -> throw new BusinessRuleException("Transición de estado no reconocida.");
        }
    }
}
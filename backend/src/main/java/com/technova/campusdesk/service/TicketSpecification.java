package com.technova.campusdesk.service;

import com.technova.campusdesk.dto.request.TicketFilter;
import com.technova.campusdesk.entity.Ticket;
import com.technova.campusdesk.entity.User;
import com.technova.campusdesk.entity.enums.Role;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class TicketSpecification {

    public static Specification<Ticket> filterByRoleAndCriteria(User currentUser, TicketFilter filter) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Regla de negocio: Filtrar por rol
            if (currentUser.getRole() == Role.USER) {
                predicates.add(criteriaBuilder.equal(root.get("requester").get("id"), currentUser.getId()));
            } else if (currentUser.getRole() == Role.TECHNICIAN) {
                predicates.add(criteriaBuilder.equal(root.get("technician").get("id"), currentUser.getId()));
            }
            // Si es ADMIN, no agregamos restricción de usuario (ve todos)

            // 2. Filtros dinámicos (si vienen en el request)
            if (filter != null) {
                if (filter.status() != null) {
                    predicates.add(criteriaBuilder.equal(root.get("status"), filter.status()));
                }
                if (filter.priority() != null) {
                    predicates.add(criteriaBuilder.equal(root.get("priority"), filter.priority()));
                }
                if (filter.category() != null) {
                    predicates.add(criteriaBuilder.equal(root.get("category"), filter.category()));
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
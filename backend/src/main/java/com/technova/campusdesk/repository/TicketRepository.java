package com.technova.campusdesk.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.technova.campusdesk.entity.Ticket;
import com.technova.campusdesk.entity.enums.TicketStatus;

/**
 * Los listados usan Specification para combinar los filtros opcionales (status, priority, category)
 * con la visibilidad según el rol (ADMIN todos, TECHNICIAN asignados, USER propios).
 * El EntityGraph carga requester y technician en la misma consulta: con open-in-view en false,
 * sin él el mapper fallaría con LazyInitializationException.
 */
public interface TicketRepository extends JpaRepository<Ticket, Long>, JpaSpecificationExecutor<Ticket> {

	@Override
	@EntityGraph(attributePaths = { "requester", "technician" })
	Optional<Ticket> findById(Long id);

	@Override
	@EntityGraph(attributePaths = { "requester", "technician" })
	List<Ticket> findAll(Specification<Ticket> spec, Sort sort);

	// Indicadores del dashboard (GET /api/reports/summary)
	long countByStatus(TicketStatus status);

	long countByRequesterIdAndStatus(Long requesterId, TicketStatus status);

	long countByTechnicianIdAndStatus(Long technicianId, TicketStatus status);

}

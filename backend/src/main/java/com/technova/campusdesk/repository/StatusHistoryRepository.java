package com.technova.campusdesk.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.technova.campusdesk.entity.StatusHistory;

public interface StatusHistoryRepository extends JpaRepository<StatusHistory, Long> {

	// Orden cronológico; el id desempata cambios hechos en el mismo instante.
	@EntityGraph(attributePaths = "changedBy")
	List<StatusHistory> findByTicketIdOrderByChangedAtAscIdAsc(Long ticketId);

}

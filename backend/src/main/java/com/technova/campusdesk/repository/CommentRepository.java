package com.technova.campusdesk.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.technova.campusdesk.entity.Comment;

public interface CommentRepository extends JpaRepository<Comment, Long> {

	// Orden cronológico; el id desempata comentarios creados en el mismo instante.
	@EntityGraph(attributePaths = "author")
	List<Comment> findByTicketIdOrderByCreatedAtAscIdAsc(Long ticketId);

}

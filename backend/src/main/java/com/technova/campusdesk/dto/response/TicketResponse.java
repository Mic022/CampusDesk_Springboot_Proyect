package com.technova.campusdesk.dto.response;

import com.technova.campusdesk.entity.enums.Category;
import com.technova.campusdesk.entity.enums.Priority;
import com.technova.campusdesk.entity.enums.TicketStatus;
import java.time.LocalDateTime;

// Nota: UserSummary es un record simple { Long id, String fullName } que puedes crear aquí si P4 tarda.
public record TicketResponse(
    Long id,
    String title,
    String description,
    Category category,
    Priority priority,
    TicketStatus status,
    UserSummary requester,
    UserSummary technician, // Puede ser null
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public record UserSummary(Long id, String fullName) {}
}
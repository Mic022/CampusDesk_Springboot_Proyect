package com.technova.campusdesk.dto.request;

import com.technova.campusdesk.entity.enums.Category;
import com.technova.campusdesk.entity.enums.Priority;
import jakarta.validation.constraints.Size;

public record TicketUpdateRequest(
    @Size(max = 150, message = "El título no puede exceder 150 caracteres")
    String title,

    @Size(max = 1000, message = "La descripción no puede exceder 1000 caracteres")
    String description,

    Category category,
    Priority priority
) {}
package com.technova.campusdesk.dto.request;

import com.technova.campusdesk.entity.enums.Category;
import com.technova.campusdesk.entity.enums.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TicketRequest(
    @NotBlank(message = "El título es obligatorio")
    @Size(max = 150, message = "El título no puede exceder 150 caracteres")
    String title,

    @NotBlank(message = "La descripción es obligatoria")
    @Size(max = 1000, message = "La descripción no puede exceder 1000 caracteres")
    String description,

    @NotNull(message = "La categoría es obligatoria")
    Category category,

    @NotNull(message = "La prioridad es obligatoria")
    Priority priority
) {}
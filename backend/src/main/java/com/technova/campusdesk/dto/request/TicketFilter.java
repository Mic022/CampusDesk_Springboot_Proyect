package com.technova.campusdesk.dto.request;

import com.technova.campusdesk.entity.enums.Category;
import com.technova.campusdesk.entity.enums.Priority;
import com.technova.campusdesk.entity.enums.TicketStatus;

public record TicketFilter(
    TicketStatus status,
    Priority priority,
    Category category
) {}
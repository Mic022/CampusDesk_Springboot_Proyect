package com.technova.campusdesk.dto.response;

// GET /api/reports/summary. ADMIN ve todos los tickets, TECHNICIAN los asignados y USER los propios.
public record SummaryResponse(long total, long open, long assigned, long inProgress, long resolved, long closed) {
}

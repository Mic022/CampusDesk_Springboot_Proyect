package com.technova.campusdesk.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.technova.campusdesk.dto.response.SummaryResponse;
import com.technova.campusdesk.security.SecurityUtils;
import com.technova.campusdesk.service.ReportService;

import lombok.RequiredArgsConstructor;

// Cualquier usuario autenticado; lo que ve depende de su rol (ver ReportService).
@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

	private final ReportService reportService;

	@GetMapping("/summary")
	public SummaryResponse summary() {
		return reportService.getSummary(SecurityUtils.getCurrentUser());
	}

}

package com.technova.campusdesk.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.technova.campusdesk.dto.response.SummaryResponse;
import com.technova.campusdesk.entity.User;
import com.technova.campusdesk.entity.enums.Role;
import com.technova.campusdesk.repository.UserRepository;
import com.technova.campusdesk.security.JwtService;
import com.technova.campusdesk.security.UserPrincipal;
import com.technova.campusdesk.security.WithJwtSecurity;
import com.technova.campusdesk.service.ReportService;

@WebMvcTest(ReportController.class)
@WithJwtSecurity
class ReportControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private JwtService jwtService;

	@MockitoBean
	private ReportService reportService;

	@MockitoBean
	private UserRepository userRepository;

	@Test
	void returnsSummaryForTheLoggedInUser() throws Exception {
		User ana = User.builder().id(3L).fullName("Ana").email("ana@technova.com").password("hash").role(Role.USER).build();
		when(userRepository.findByEmail("ana@technova.com")).thenReturn(Optional.of(ana));
		when(reportService.getSummary(ana)).thenReturn(new SummaryResponse(3, 2, 0, 0, 0, 1));

		mockMvc.perform(get("/api/reports/summary")
				.header("Authorization", "Bearer " + jwtService.generateToken(new UserPrincipal(ana))))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.total").value(3))
				.andExpect(jsonPath("$.open").value(2))
				.andExpect(jsonPath("$.assigned").value(0))
				.andExpect(jsonPath("$.inProgress").value(0))
				.andExpect(jsonPath("$.resolved").value(0))
				.andExpect(jsonPath("$.closed").value(1));
	}

	@Test
	void withoutTokenReturns401() throws Exception {
		mockMvc.perform(get("/api/reports/summary")).andExpect(status().isUnauthorized());
	}

}

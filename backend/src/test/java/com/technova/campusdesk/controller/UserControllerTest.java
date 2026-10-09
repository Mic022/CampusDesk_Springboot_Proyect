package com.technova.campusdesk.controller;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.technova.campusdesk.dto.response.UserResponse;
import com.technova.campusdesk.entity.User;
import com.technova.campusdesk.entity.enums.Role;
import com.technova.campusdesk.repository.UserRepository;
import com.technova.campusdesk.security.JwtService;
import com.technova.campusdesk.security.UserPrincipal;
import com.technova.campusdesk.security.WithJwtSecurity;
import com.technova.campusdesk.service.UserService;

@WebMvcTest(UserController.class)
@WithJwtSecurity
class UserControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private JwtService jwtService;

	@MockitoBean
	private UserService userService;

	@MockitoBean
	private UserRepository userRepository;

	private final User admin = user(1L, "admin@technova.com", Role.ADMIN);
	private final User technician = user(2L, "luis@technova.com", Role.TECHNICIAN);
	private final User ana = user(3L, "ana@technova.com", Role.USER);

	@BeforeEach
	void setUp() {
		for (User u : List.of(admin, technician, ana)) {
			when(userRepository.findByEmail(u.getEmail())).thenReturn(Optional.of(u));
		}
	}

	@Test
	void adminListsAllUsers() throws Exception {
		when(userService.findAll()).thenReturn(List.of(
				new UserResponse(1L, "Admin", "admin@technova.com", Role.ADMIN),
				new UserResponse(3L, "Ana", "ana@technova.com", Role.USER)));

		mockMvc.perform(get("/api/users").header("Authorization", bearer(admin)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(2))
				.andExpect(jsonPath("$[0].password").doesNotExist());
	}

	@Test
	void adminListsTechnicians() throws Exception {
		when(userService.findTechnicians())
				.thenReturn(List.of(new UserResponse(2L, "Luis", "luis@technova.com", Role.TECHNICIAN)));

		mockMvc.perform(get("/api/users/technicians").header("Authorization", bearer(admin)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].role").value("TECHNICIAN"));
	}

	@Test
	void userAndTechnicianGet403() throws Exception {
		mockMvc.perform(get("/api/users").header("Authorization", bearer(ana))).andExpect(status().isForbidden());
		mockMvc.perform(get("/api/users/technicians").header("Authorization", bearer(technician)))
				.andExpect(status().isForbidden());
		verifyNoInteractions(userService);
	}

	@Test
	void withoutTokenGets401() throws Exception {
		mockMvc.perform(get("/api/users")).andExpect(status().isUnauthorized());
	}

	private String bearer(User user) {
		return "Bearer " + jwtService.generateToken(new UserPrincipal(user));
	}

	private static User user(Long id, String email, Role role) {
		return User.builder().id(id).fullName(email).email(email).password("hash").role(role).build();
	}

}

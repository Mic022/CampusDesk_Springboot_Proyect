package com.technova.campusdesk.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.technova.campusdesk.entity.User;
import com.technova.campusdesk.entity.enums.Role;
import com.technova.campusdesk.repository.UserRepository;

@WebMvcTest(controllers = SecurityConfigTest.TestController.class)
@WithJwtSecurity
@Import(SecurityConfigTest.TestController.class)
class SecurityConfigTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private JwtService jwtService;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@MockitoBean
	private UserRepository userRepository;

	private final User admin = user(1L, "admin@technova.com", Role.ADMIN);
	private final User ana = user(3L, "ana@technova.com", Role.USER);

	@BeforeEach
	void setUp() {
		when(userRepository.findByEmail(admin.getEmail())).thenReturn(Optional.of(admin));
		when(userRepository.findByEmail(ana.getEmail())).thenReturn(Optional.of(ana));
	}

	@Test
	void authRoutesArePublic() throws Exception {
		mockMvc.perform(post("/api/auth/ping")).andExpect(status().isOk());
	}

	@Test
	void privateRouteWithoutTokenReturns401Json() throws Exception {
		mockMvc.perform(get("/api/tickets/me"))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.status").value(401))
				.andExpect(jsonPath("$.error").value("Unauthorized"))
				.andExpect(jsonPath("$.path").value("/api/tickets/me"));
	}

	@Test
	void invalidTokenReturns401() throws Exception {
		mockMvc.perform(get("/api/tickets/me").header("Authorization", "Bearer token-falso"))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void authenticatedUserIsAvailableThroughSecurityUtils() throws Exception {
		mockMvc.perform(get("/api/tickets/me").header("Authorization", bearer(ana)))
				.andExpect(status().isOk())
				.andExpect(content().string("ana@technova.com"));
	}

	@Test
	void userCannotAccessUsersEndpoints() throws Exception {
		mockMvc.perform(get("/api/users/ping").header("Authorization", bearer(ana)))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.status").value(403))
				.andExpect(jsonPath("$.message").value("No tienes permiso para realizar esta acción"));
	}

	@Test
	void adminCanAccessUsersEndpoints() throws Exception {
		mockMvc.perform(get("/api/users/ping").header("Authorization", bearer(admin)))
				.andExpect(status().isOk());
	}

	@Test
	void preAuthorizeOnControllerReturns403() throws Exception {
		mockMvc.perform(get("/api/tickets/admin-only").header("Authorization", bearer(ana)))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.status").value(403));

		mockMvc.perform(get("/api/tickets/admin-only").header("Authorization", bearer(admin)))
				.andExpect(status().isOk());
	}

	@Test
	void passwordsAreHashedWithBcrypt() {
		String hash = passwordEncoder.encode("Segura123");

		assertThat(hash).startsWith("$2");
		assertThat(passwordEncoder.matches("Segura123", hash)).isTrue();
	}

	private String bearer(User user) {
		return "Bearer " + jwtService.generateToken(new UserPrincipal(user));
	}

	private static User user(Long id, String email, Role role) {
		return User.builder().id(id).fullName(email).email(email).password("hash").role(role).build();
	}

	@RestController
	static class TestController {

		@PostMapping("/api/auth/ping")
		String publicPing() {
			return "ok";
		}

		@GetMapping("/api/users/ping")
		String adminPing() {
			return "ok";
		}

		@GetMapping("/api/tickets/me")
		String me() {
			return SecurityUtils.getCurrentUser().getEmail();
		}

		@PreAuthorize("hasRole('ADMIN')")
		@GetMapping("/api/tickets/admin-only")
		String adminOnly() {
			return "ok";
		}

	}

}

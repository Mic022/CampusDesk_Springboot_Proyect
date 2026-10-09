package com.technova.campusdesk.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.technova.campusdesk.entity.User;
import com.technova.campusdesk.entity.enums.Role;
import com.technova.campusdesk.repository.UserRepository;

class JwtAuthenticationFilterTest {

	private final JwtService jwtService = new JwtService("secreto-de-prueba-con-mas-de-32-caracteres", 3_600_000);
	private final UserRepository userRepository = mock(UserRepository.class);
	private final JwtAuthenticationFilter filter = new JwtAuthenticationFilter(jwtService,
			new UserDetailsServiceImpl(userRepository));

	private final User admin = User.builder().id(1L).fullName("Admin").email("admin@technova.com")
			.password("hash").role(Role.ADMIN).build();

	@BeforeEach
	void setUp() {
		when(userRepository.findByEmail("admin@technova.com")).thenReturn(Optional.of(admin));
	}

	@AfterEach
	void clearContext() {
		SecurityContextHolder.clearContext();
	}

	@Test
	void validTokenAuthenticatesTheUserWithItsRole() throws Exception {
		Authentication auth = runFilter("Bearer " + jwtService.generateToken(new UserPrincipal(admin)));

		assertThat(auth).isNotNull();
		assertThat(((UserPrincipal) auth.getPrincipal()).getUser()).isSameAs(admin);
		assertThat(auth.getAuthorities()).extracting("authority").containsExactly("ROLE_ADMIN");
	}

	@Test
	void missingHeaderLeavesRequestAnonymous() throws Exception {
		assertThat(runFilter(null)).isNull();
	}

	@Test
	void invalidTokenLeavesRequestAnonymous() throws Exception {
		assertThat(runFilter("Bearer no-es-un-token")).isNull();
	}

	@Test
	void tokenOfDeletedUserLeavesRequestAnonymous() throws Exception {
		String token = jwtService.generateToken(new UserPrincipal(admin));
		when(userRepository.findByEmail("admin@technova.com")).thenReturn(Optional.empty());

		assertThat(runFilter("Bearer " + token)).isNull();
	}

	// Devuelve la autenticación que ve el siguiente filtro de la cadena.
	private Authentication runFilter(String authorizationHeader) throws Exception {
		MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/tickets");
		if (authorizationHeader != null) {
			request.addHeader("Authorization", authorizationHeader);
		}
		Authentication[] seen = new Authentication[1];
		MockFilterChain chain = new MockFilterChain() {
			@Override
			public void doFilter(jakarta.servlet.ServletRequest req, jakarta.servlet.ServletResponse res) {
				seen[0] = SecurityContextHolder.getContext().getAuthentication();
			}
		};
		filter.doFilter(request, new MockHttpServletResponse(), chain);
		return seen[0];
	}

}

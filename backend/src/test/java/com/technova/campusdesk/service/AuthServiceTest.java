package com.technova.campusdesk.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.technova.campusdesk.dto.request.LoginRequest;
import com.technova.campusdesk.dto.request.RegisterRequest;
import com.technova.campusdesk.dto.response.AuthResponse;
import com.technova.campusdesk.dto.response.UserResponse;
import com.technova.campusdesk.entity.User;
import com.technova.campusdesk.entity.enums.Role;
import com.technova.campusdesk.exception.BusinessRuleException;
import com.technova.campusdesk.repository.UserRepository;
import com.technova.campusdesk.security.JwtService;
import com.technova.campusdesk.security.UserPrincipal;

class AuthServiceTest {

	private final UserRepository userRepository = mock(UserRepository.class);
	private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
	private final AuthenticationManager authenticationManager = mock(AuthenticationManager.class);
	private final JwtService jwtService = new JwtService("secreto-de-prueba-con-mas-de-32-caracteres", 3_600_000);
	private final AuthService authService = new AuthService(userRepository, passwordEncoder, authenticationManager,
			jwtService);

	@Test
	void registerCreatesUserWithHashedPasswordAndNormalizedEmail() {
		when(userRepository.existsByEmail("ana@technova.com")).thenReturn(false);
		when(userRepository.save(any(User.class))).thenAnswer(inv -> {
			User saved = inv.getArgument(0);
			saved.setId(3L);
			return saved;
		});

		UserResponse response = authService.register(new RegisterRequest("  Ana Pérez ", " Ana@TechNova.com ", "Segura123"));

		ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
		verify(userRepository).save(captor.capture());
		User saved = captor.getValue();
		assertThat(saved.getEmail()).isEqualTo("ana@technova.com");
		assertThat(saved.getFullName()).isEqualTo("Ana Pérez");
		assertThat(saved.getRole()).isEqualTo(Role.USER);
		assertThat(saved.getPassword()).isNotEqualTo("Segura123");
		assertThat(passwordEncoder.matches("Segura123", saved.getPassword())).isTrue();
		assertThat(response).isEqualTo(new UserResponse(3L, "Ana Pérez", "ana@technova.com", Role.USER));
	}

	@Test
	void registerWithExistingEmailThrowsBusinessRule() {
		when(userRepository.existsByEmail("ana@technova.com")).thenReturn(true);

		assertThatThrownBy(() -> authService.register(new RegisterRequest("Ana", "ANA@technova.com", "Segura123")))
				.isInstanceOf(BusinessRuleException.class);
		verify(userRepository, never()).save(any());
	}

	@Test
	void loginReturnsTokenAndUser() {
		User ana = User.builder().id(3L).fullName("Ana").email("ana@technova.com").password("hash").role(Role.USER).build();
		UserPrincipal principal = new UserPrincipal(ana);
		when(authenticationManager.authenticate(any()))
				.thenReturn(new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));

		AuthResponse response = authService.login(new LoginRequest(" ANA@technova.com", "Segura123"));

		ArgumentCaptor<UsernamePasswordAuthenticationToken> captor = ArgumentCaptor
				.forClass(UsernamePasswordAuthenticationToken.class);
		verify(authenticationManager).authenticate(captor.capture());
		assertThat(captor.getValue().getName()).isEqualTo("ana@technova.com");

		assertThat(response.tokenType()).isEqualTo("Bearer");
		assertThat(response.expiresIn()).isEqualTo(3600);
		assertThat(jwtService.extractEmail(response.token())).isEqualTo("ana@technova.com");
		assertThat(response.user()).isEqualTo(new UserResponse(3L, "Ana", "ana@technova.com", Role.USER));
	}

	@Test
	void loginWithBadCredentialsPropagatesException() {
		when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("Bad credentials"));

		assertThatThrownBy(() -> authService.login(new LoginRequest("ana@technova.com", "mala")))
				.isInstanceOf(BadCredentialsException.class);
	}

}

package com.technova.campusdesk.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.technova.campusdesk.dto.request.RegisterRequest;
import com.technova.campusdesk.dto.response.AuthResponse;
import com.technova.campusdesk.dto.response.UserResponse;
import com.technova.campusdesk.entity.enums.Role;
import com.technova.campusdesk.exception.BusinessRuleException;
import com.technova.campusdesk.repository.UserRepository;
import com.technova.campusdesk.security.WithJwtSecurity;
import com.technova.campusdesk.service.AuthService;

@WebMvcTest(AuthController.class)
@WithJwtSecurity
class AuthControllerTest {

	private static final UserResponse ANA = new UserResponse(3L, "Ana Pérez", "ana@technova.com", Role.USER);

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private AuthService authService;

	@MockitoBean
	private UserRepository userRepository;

	@Test
	void registerReturns201WithUserWithoutPassword() throws Exception {
		when(authService.register(new RegisterRequest("Ana Pérez", "ana@technova.com", "Segura123"))).thenReturn(ANA);

		mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
				.content("""
						{ "fullName": "Ana Pérez", "email": "ana@technova.com", "password": "Segura123" }
						"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id").value(3))
				.andExpect(jsonPath("$.role").value("USER"))
				.andExpect(jsonPath("$.password").doesNotExist());
	}

	@Test
	void registerWithInvalidDataReturns400AndDoesNotCallService() throws Exception {
		mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
				.content("""
						{ "fullName": "", "email": "no-es-correo", "password": "corta" }
						"""))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.errors.fullName").exists())
				.andExpect(jsonPath("$.errors.email").exists())
				.andExpect(jsonPath("$.errors.password").exists());

		verifyNoInteractions(authService);
	}

	@Test
	void registerWithDuplicateEmailReturns409() throws Exception {
		when(authService.register(any())).thenThrow(new BusinessRuleException("Ya existe una cuenta con el correo ana@technova.com"));

		mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
				.content("""
						{ "fullName": "Ana Pérez", "email": "ana@technova.com", "password": "Segura123" }
						"""))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.message").value("Ya existe una cuenta con el correo ana@technova.com"));
	}

	@Test
	void loginReturnsTokenWithoutNeedingAToken() throws Exception {
		when(authService.login(any())).thenReturn(AuthResponse.bearer("jwt-de-prueba", 3600, ANA));

		mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
				.content("""
						{ "email": "ana@technova.com", "password": "Segura123" }
						"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.token").value("jwt-de-prueba"))
				.andExpect(jsonPath("$.tokenType").value("Bearer"))
				.andExpect(jsonPath("$.expiresIn").value(3600))
				.andExpect(jsonPath("$.user.email").value("ana@technova.com"));
	}

	@Test
	void loginWithBadCredentialsReturns401() throws Exception {
		when(authService.login(any())).thenThrow(new BadCredentialsException("Bad credentials"));

		mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
				.content("""
						{ "email": "ana@technova.com", "password": "Incorrecta1" }
						"""))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.message").value("Correo o contraseña incorrectos"));
	}

	@Test
	void loginWithMissingFieldsReturns400() throws Exception {
		mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content("{}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.errors.email").exists())
				.andExpect(jsonPath("$.errors.password").exists());
	}

}

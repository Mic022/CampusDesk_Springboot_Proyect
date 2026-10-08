package com.technova.campusdesk.security;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import tools.jackson.databind.ObjectMapper;

// 403 cuando el usuario está autenticado pero su rol no tiene acceso a la ruta (por ejemplo USER en /api/users).
@Component
@RequiredArgsConstructor
public class RestAccessDeniedHandler implements AccessDeniedHandler {

	private final ObjectMapper objectMapper;

	@Override
	public void handle(HttpServletRequest request, HttpServletResponse response,
			AccessDeniedException accessDeniedException) throws IOException {
		RestAuthenticationEntryPoint.writeError(objectMapper, response, HttpStatus.FORBIDDEN,
				"No tienes permiso para realizar esta acción", request.getRequestURI());
	}

}

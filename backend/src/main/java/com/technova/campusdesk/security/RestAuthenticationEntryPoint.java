package com.technova.campusdesk.security;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.technova.campusdesk.exception.ErrorResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import tools.jackson.databind.ObjectMapper;

/**
 * 401 cuando una ruta privada llega sin token o con un token que no sirve.
 * Responde con el mismo ErrorResponse que GlobalExceptionHandler, porque estos errores
 * ocurren en los filtros, antes de llegar a los controllers.
 */
@Component
@RequiredArgsConstructor
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

	private final ObjectMapper objectMapper;

	@Override
	public void commence(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException authException) throws IOException {
		writeError(objectMapper, response, HttpStatus.UNAUTHORIZED,
				"Debes iniciar sesión para acceder a este recurso", request.getRequestURI());
	}

	static void writeError(ObjectMapper objectMapper, HttpServletResponse response, HttpStatus status,
			String message, String path) throws IOException {
		response.setStatus(status.value());
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		response.setCharacterEncoding("UTF-8");
		objectMapper.writeValue(response.getOutputStream(), ErrorResponse.of(status, message, path));
	}

}

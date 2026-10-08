package com.technova.campusdesk.exception;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.http.HttpStatus;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Cuerpo de todas las respuestas 4xx y 5xx (ver docs/api-contract.md).
 * "errors" solo aparece en errores de validación (400).
 * También lo usan el AuthenticationEntryPoint (401) y el AccessDeniedHandler (403) de security/.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
		@JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime timestamp,
		int status,
		String error,
		String message,
		String path,
		Map<String, String> errors) {

	public static ErrorResponse of(HttpStatus status, String message, String path) {
		return of(status, message, path, null);
	}

	public static ErrorResponse of(HttpStatus status, String message, String path, Map<String, String> errors) {
		return new ErrorResponse(LocalDateTime.now(), status.value(), status.getReasonPhrase(), message, path, errors);
	}

}

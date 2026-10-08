package com.technova.campusdesk.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

// POST /api/auth/login. Aquí no se valida la política de contraseña: si no coincide, es 401.
public record LoginRequest(
		@NotBlank(message = "El correo es obligatorio")
		@Email(message = "El correo no tiene un formato válido")
		String email,

		@NotBlank(message = "La contraseña es obligatoria")
		String password) {
}

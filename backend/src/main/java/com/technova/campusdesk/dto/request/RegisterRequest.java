package com.technova.campusdesk.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

// POST /api/auth/register. El rol no viene en el body: el registro siempre crea un USER.
public record RegisterRequest(
		@NotBlank(message = "El nombre es obligatorio")
		@Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
		String fullName,

		@NotBlank(message = "El correo es obligatorio")
		@Email(message = "El correo no tiene un formato válido")
		@Size(max = 150, message = "El correo no puede superar 150 caracteres")
		String email,

		// Máximo 72 porque BCrypt ignora lo que pase de 72 bytes.
		@NotBlank(message = "La contraseña es obligatoria")
		@Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres")
		@Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
				message = "La contraseña debe tener al menos una mayúscula, una minúscula y un número")
		String password) {
}

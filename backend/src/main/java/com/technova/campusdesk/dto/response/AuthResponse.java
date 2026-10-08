package com.technova.campusdesk.dto.response;

// Respuesta de POST /api/auth/login. expiresIn va en segundos (JWT_EXPIRATION_MS / 1000).
public record AuthResponse(String token, String tokenType, long expiresIn, UserResponse user) {

	public static AuthResponse bearer(String token, long expiresInSeconds, UserResponse user) {
		return new AuthResponse(token, "Bearer", expiresInSeconds, user);
	}

}

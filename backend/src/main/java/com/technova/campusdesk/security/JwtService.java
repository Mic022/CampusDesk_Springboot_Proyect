package com.technova.campusdesk.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/**
 * Crea y valida los tokens JWT (HMAC-SHA256).
 * El subject es el correo del usuario; el claim "role" es informativo, porque el filtro
 * vuelve a leer el usuario de la base en cada petición y usa el rol que haya allí.
 */
@Service
public class JwtService {

	private static final int MIN_SECRET_BYTES = 32;

	private final SecretKey key;
	private final long expirationMs;

	public JwtService(@Value("${app.jwt.secret}") String secret,
			@Value("${app.jwt.expiration-ms}") long expirationMs) {
		byte[] secretBytes = secret.getBytes(StandardCharsets.UTF_8);
		if (secretBytes.length < MIN_SECRET_BYTES) {
			throw new IllegalStateException(
					"JWT_SECRET debe tener al menos " + MIN_SECRET_BYTES + " caracteres (revisa backend/.env)");
		}
		this.key = Keys.hmacShaKeyFor(secretBytes);
		this.expirationMs = expirationMs;
	}

	public String generateToken(UserPrincipal principal) {
		Date now = new Date();
		return Jwts.builder()
				.subject(principal.getUsername())
				.claim("role", principal.getUser().getRole().name())
				.issuedAt(now)
				.expiration(new Date(now.getTime() + expirationMs))
				.signWith(key)
				.compact();
	}

	/**
	 * Devuelve el correo guardado en el token.
	 * Lanza JwtException si el token está vencido, mal formado o firmado con otra clave.
	 */
	public String extractEmail(String token) {
		return parseClaims(token).getSubject();
	}

	// Para AuthResponse.expiresIn, que va en segundos.
	public long getExpirationSeconds() {
		return expirationMs / 1000;
	}

	private Claims parseClaims(String token) throws JwtException {
		return Jwts.parser()
				.verifyWith(key)
				.build()
				.parseSignedClaims(token)
				.getPayload();
	}

}

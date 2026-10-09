package com.technova.campusdesk.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

import com.technova.campusdesk.entity.User;
import com.technova.campusdesk.entity.enums.Role;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;

class JwtServiceTest {

	private static final String SECRET = "secreto-de-prueba-con-mas-de-32-caracteres";

	private final JwtService jwtService = new JwtService(SECRET, 3_600_000);

	@Test
	void generatedTokenContainsTheEmail() {
		String token = jwtService.generateToken(principal("ana@technova.com"));

		assertThat(jwtService.extractEmail(token)).isEqualTo("ana@technova.com");
	}

	@Test
	void expirationIsReportedInSeconds() {
		assertThat(jwtService.getExpirationSeconds()).isEqualTo(3600);
	}

	@Test
	void expiredTokenIsRejected() {
		JwtService expired = new JwtService(SECRET, -1000);
		String token = expired.generateToken(principal("ana@technova.com"));

		assertThatThrownBy(() -> jwtService.extractEmail(token)).isInstanceOf(ExpiredJwtException.class);
	}

	@Test
	void tokenSignedWithAnotherKeyIsRejected() {
		JwtService other = new JwtService("otro-secreto-distinto-de-mas-de-32-caracteres", 3_600_000);
		String token = other.generateToken(principal("ana@technova.com"));

		assertThatThrownBy(() -> jwtService.extractEmail(token)).isInstanceOf(JwtException.class);
	}

	@Test
	void tamperedTokenIsRejected() {
		String token = jwtService.generateToken(principal("ana@technova.com"));
		String tampered = token.substring(0, token.length() - 2) + (token.endsWith("A") ? "BB" : "AA");

		assertThatThrownBy(() -> jwtService.extractEmail(tampered)).isInstanceOf(JwtException.class);
	}

	@Test
	void shortSecretFailsAtStartup() {
		assertThatThrownBy(() -> new JwtService("corto", 3_600_000))
				.isInstanceOf(IllegalStateException.class)
				.hasMessageContaining("JWT_SECRET");
	}

	private static UserPrincipal principal(String email) {
		return new UserPrincipal(User.builder().id(1L).fullName("Ana").email(email).password("hash").role(Role.USER).build());
	}

}

package com.technova.campusdesk.dto.request;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Set;
import java.util.stream.Collectors;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

class RegisterRequestTest {

	private static ValidatorFactory factory;
	private static Validator validator;

	@BeforeAll
	static void setUp() {
		factory = Validation.buildDefaultValidatorFactory();
		validator = factory.getValidator();
	}

	@AfterAll
	static void tearDown() {
		factory.close();
	}

	@Test
	void validRequestHasNoErrors() {
		assertThat(validator.validate(new RegisterRequest("Ana Pérez", "ana@technova.com", "Segura123"))).isEmpty();
	}

	@ParameterizedTest
	@ValueSource(strings = { "Corta1A", "sinmayuscula1", "SINMINUSCULA1", "SinNumeroAqui" })
	void weakPasswordIsRejected(String password) {
		assertThat(invalidFields(new RegisterRequest("Ana Pérez", "ana@technova.com", password)))
				.containsExactly("password");
	}

	@Test
	void invalidEmailAndBlankNameAreRejected() {
		assertThat(invalidFields(new RegisterRequest(" ", "no-es-correo", "Segura123")))
				.containsExactlyInAnyOrder("fullName", "email");
	}

	private Set<String> invalidFields(RegisterRequest request) {
		Set<ConstraintViolation<RegisterRequest>> violations = validator.validate(request);
		return violations.stream().map(v -> v.getPropertyPath().toString()).collect(Collectors.toSet());
	}

}

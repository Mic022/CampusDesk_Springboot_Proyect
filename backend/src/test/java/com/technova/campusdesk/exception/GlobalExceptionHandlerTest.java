package com.technova.campusdesk.exception;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

class GlobalExceptionHandlerTest {

	private MockMvc mockMvc;

	@BeforeEach
	void setUp() {
		mockMvc = MockMvcBuilders.standaloneSetup(new TestController())
				.setControllerAdvice(new GlobalExceptionHandler())
				.build();
	}

	@Test
	void notFoundReturns404WithContractFormat() throws Exception {
		mockMvc.perform(get("/test/not-found"))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.status").value(404))
				.andExpect(jsonPath("$.error").value("Not Found"))
				.andExpect(jsonPath("$.message").value("Ticket 5 no existe"))
				.andExpect(jsonPath("$.path").value("/test/not-found"))
				.andExpect(jsonPath("$.timestamp").isString())
				.andExpect(jsonPath("$.errors").doesNotExist());
	}

	@Test
	void forbiddenReturns403() throws Exception {
		mockMvc.perform(get("/test/forbidden"))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.message").value("No puedes ver este ticket"));
	}

	@Test
	void businessRuleReturns409() throws Exception {
		mockMvc.perform(get("/test/conflict"))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.message").value("Transición no permitida: ASSIGNED → RESOLVED"));
	}

	@Test
	void validationReturns400WithFieldErrors() throws Exception {
		mockMvc.perform(post("/test/validate").contentType(MediaType.APPLICATION_JSON).content("{\"title\":\"\"}"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.errors.title").value("El título es obligatorio"));
	}

	@Test
	void malformedBodyReturns400() throws Exception {
		mockMvc.perform(post("/test/validate").contentType(MediaType.APPLICATION_JSON).content("{no es json"))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.status").value(400));
	}

	@Test
	void unexpectedErrorReturns500WithoutDetails() throws Exception {
		mockMvc.perform(get("/test/boom"))
				.andExpect(status().isInternalServerError())
				.andExpect(jsonPath("$.message").value("Ocurrió un error inesperado"));
	}

	@RestController
	static class TestController {

		@GetMapping("/test/not-found")
		void notFound() {
			throw new ResourceNotFoundException("Ticket 5 no existe");
		}

		@GetMapping("/test/forbidden")
		void forbidden() {
			throw new ForbiddenException("No puedes ver este ticket");
		}

		@GetMapping("/test/conflict")
		void conflict() {
			throw new BusinessRuleException("Transición no permitida: ASSIGNED → RESOLVED");
		}

		@PostMapping("/test/validate")
		void validate(@Valid @RequestBody TestRequest request) {
		}

		@GetMapping("/test/boom")
		void boom() {
			throw new IllegalStateException("detalle interno");
		}

	}

	record TestRequest(@NotBlank(message = "El título es obligatorio") String title) {
	}

}

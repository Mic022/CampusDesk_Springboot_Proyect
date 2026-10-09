package com.technova.campusdesk.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

/**
 * Swagger en http://localhost:8080/swagger-ui.html.
 * Para probar rutas privadas: hacer login en POST /api/auth/login, copiar el "token",
 * pulsar Authorize y pegarlo (sin escribir "Bearer").
 */
@Configuration
public class OpenApiConfig {

	static final String BEARER_SCHEME = "bearerAuth";

	@Bean
	public OpenAPI campusDeskOpenApi() {
		return new OpenAPI()
				.info(new Info()
						.title("CampusDesk API")
						.version("1.0")
						.description("Gestión de incidencias tecnológicas de TechNova Solutions"))
				.components(new Components().addSecuritySchemes(BEARER_SCHEME, new SecurityScheme()
						.type(SecurityScheme.Type.HTTP)
						.scheme("bearer")
						.bearerFormat("JWT")))
				// Aplica el token a todas las rutas; las públicas (/api/auth/**) simplemente lo ignoran.
				.addSecurityItem(new SecurityRequirement().addList(BEARER_SCHEME));
	}

}

package com.technova.campusdesk.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityScheme;

class OpenApiConfigTest {

	@Test
	void declaresBearerJwtSchemeForTheAuthorizeButton() {
		OpenAPI openApi = new OpenApiConfig().campusDeskOpenApi();

		SecurityScheme scheme = openApi.getComponents().getSecuritySchemes().get(OpenApiConfig.BEARER_SCHEME);
		assertThat(scheme.getType()).isEqualTo(SecurityScheme.Type.HTTP);
		assertThat(scheme.getScheme()).isEqualTo("bearer");
		assertThat(scheme.getBearerFormat()).isEqualTo("JWT");
		assertThat(openApi.getSecurity()).anySatisfy(req -> assertThat(req).containsKey(OpenApiConfig.BEARER_SCHEME));
	}

}

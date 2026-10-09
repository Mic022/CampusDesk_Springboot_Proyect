package com.technova.campusdesk.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;

import com.technova.campusdesk.config.CorsConfig;
import com.technova.campusdesk.exception.GlobalExceptionHandler;

/**
 * Para pruebas @WebMvcTest de controllers: carga la seguridad real (SecurityConfig, JWT, 401/403)
 * y el GlobalExceptionHandler. La prueba debe declarar @MockitoBean UserRepository.
 * Para un token: jwtService.generateToken(new UserPrincipal(user)).
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Import({ SecurityConfig.class, JwtService.class, UserDetailsServiceImpl.class, JwtAuthenticationFilter.class,
		RestAuthenticationEntryPoint.class, RestAccessDeniedHandler.class, GlobalExceptionHandler.class,
		CorsConfig.class })
@TestPropertySource(properties = {
		"app.jwt.secret=secreto-de-prueba-con-mas-de-32-caracteres",
		"app.jwt.expiration-ms=3600000",
		"app.cors.allowed-origins=http://127.0.0.1:5500,http://localhost:5500" })
public @interface WithJwtSecurity {
}

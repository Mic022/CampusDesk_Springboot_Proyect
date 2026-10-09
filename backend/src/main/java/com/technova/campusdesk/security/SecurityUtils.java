package com.technova.campusdesk.security;

import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.technova.campusdesk.entity.User;

/**
 * Acceso al usuario autenticado desde los services, por ejemplo:
 * {@code User current = SecurityUtils.getCurrentUser();}
 * La entidad viene del JwtAuthenticationFilter, que la carga de la base en cada petición.
 */
public final class SecurityUtils {

	private SecurityUtils() {
	}

	/**
	 * Devuelve el usuario de la petición actual.
	 * Si no hay sesión lanza AuthenticationCredentialsNotFoundException, que GlobalExceptionHandler convierte en 401.
	 */
	public static User getCurrentUser() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
			throw new AuthenticationCredentialsNotFoundException("No hay un usuario autenticado");
		}
		return principal.getUser();
	}

}

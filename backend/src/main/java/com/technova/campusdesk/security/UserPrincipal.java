package com.technova.campusdesk.security;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.technova.campusdesk.entity.User;

/**
 * El usuario autenticado dentro de Spring Security. Guarda la entidad User para que
 * SecurityUtils.getCurrentUser() la devuelva sin otra consulta.
 * La autoridad es "ROLE_" + rol, así funcionan hasRole("ADMIN") y @PreAuthorize("hasRole('ADMIN')").
 */
public class UserPrincipal implements UserDetails {

	private final User user;

	public UserPrincipal(User user) {
		this.user = user;
	}

	public User getUser() {
		return user;
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
	}

	@Override
	public String getPassword() {
		return user.getPassword();
	}

	@Override
	public String getUsername() {
		return user.getEmail();
	}

}

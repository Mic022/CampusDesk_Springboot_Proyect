package com.technova.campusdesk.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import com.technova.campusdesk.entity.User;
import com.technova.campusdesk.entity.enums.Role;

class SecurityUtilsTest {

	@AfterEach
	void clearContext() {
		SecurityContextHolder.clearContext();
	}

	@Test
	void returnsTheAuthenticatedUser() {
		User user = User.builder().id(7L).fullName("Ana").email("ana@technova.com").password("hash").role(Role.USER).build();
		UserPrincipal principal = new UserPrincipal(user);
		SecurityContextHolder.getContext().setAuthentication(
				new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities()));

		assertThat(SecurityUtils.getCurrentUser()).isSameAs(user);
	}

	@Test
	void throwsWhenNobodyIsAuthenticated() {
		assertThatThrownBy(SecurityUtils::getCurrentUser).isInstanceOf(AuthenticationCredentialsNotFoundException.class);
	}

	@Test
	void throwsForAnonymousRequests() {
		SecurityContextHolder.getContext().setAuthentication(new AnonymousAuthenticationToken("key", "anonymousUser",
				List.of(new SimpleGrantedAuthority("ROLE_ANONYMOUS"))));

		assertThatThrownBy(SecurityUtils::getCurrentUser).isInstanceOf(AuthenticationCredentialsNotFoundException.class);
	}

}

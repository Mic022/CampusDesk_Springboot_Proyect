package com.technova.campusdesk.security;

import java.util.Locale;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.technova.campusdesk.repository.UserRepository;

import lombok.RequiredArgsConstructor;

// Carga el usuario por correo. Lo usan el login (AuthenticationManager) y el JwtAuthenticationFilter.
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

	private final UserRepository userRepository;

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		return userRepository.findByEmail(normalizeEmail(email))
				.map(UserPrincipal::new)
				.orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
	}

	// Los correos se guardan en minúsculas y sin espacios; AuthService usa la misma regla al registrar.
	public static String normalizeEmail(String email) {
		return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
	}

}

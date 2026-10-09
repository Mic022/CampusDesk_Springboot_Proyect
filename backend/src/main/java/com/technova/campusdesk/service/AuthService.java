package com.technova.campusdesk.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.technova.campusdesk.dto.request.LoginRequest;
import com.technova.campusdesk.dto.request.RegisterRequest;
import com.technova.campusdesk.dto.response.AuthResponse;
import com.technova.campusdesk.dto.response.UserResponse;
import com.technova.campusdesk.entity.User;
import com.technova.campusdesk.entity.enums.Role;
import com.technova.campusdesk.exception.BusinessRuleException;
import com.technova.campusdesk.mapper.UserMapper;
import com.technova.campusdesk.repository.UserRepository;
import com.technova.campusdesk.security.JwtService;
import com.technova.campusdesk.security.UserDetailsServiceImpl;
import com.technova.campusdesk.security.UserPrincipal;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final AuthenticationManager authenticationManager;
	private final JwtService jwtService;

	// El registro público siempre crea un USER. El ADMIN y los técnicos los crea el DataInitializer.
	@Transactional
	public UserResponse register(RegisterRequest request) {
		String email = UserDetailsServiceImpl.normalizeEmail(request.email());
		if (userRepository.existsByEmail(email)) {
			throw new BusinessRuleException("Ya existe una cuenta con el correo " + email);
		}

		User user = User.builder()
				.fullName(request.fullName().trim())
				.email(email)
				.password(passwordEncoder.encode(request.password()))
				.role(Role.USER)
				.build();

		return UserMapper.toResponse(userRepository.save(user));
	}

	/**
	 * Si el correo no existe o la contraseña no coincide, AuthenticationManager lanza
	 * BadCredentialsException y GlobalExceptionHandler responde 401 (sin decir cuál de los dos falló).
	 */
	public AuthResponse login(LoginRequest request) {
		Authentication authentication = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(UserDetailsServiceImpl.normalizeEmail(request.email()),
						request.password()));

		UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
		return AuthResponse.bearer(jwtService.generateToken(principal), jwtService.getExpirationSeconds(),
				UserMapper.toResponse(principal.getUser()));
	}

}

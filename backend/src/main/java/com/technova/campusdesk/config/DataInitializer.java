package com.technova.campusdesk.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.technova.campusdesk.entity.User;
import com.technova.campusdesk.entity.enums.Role;
import com.technova.campusdesk.repository.UserRepository;
import com.technova.campusdesk.security.UserDetailsServiceImpl;

import lombok.extern.slf4j.Slf4j;

/**
 * Al arrancar crea al ADMIN y a los técnicos si todavía no existen (se puede arrancar las veces que sea).
 * Las contraseñas salen del .env (ADMIN_PASSWORD, TECH_PASSWORD), nunca del repositorio.
 *
 * Acordado con Persona 4: database/data.sql busca a los técnicos por estos correos para asignarles
 * tickets, así que no se cambian sin avisarle. Orden: arrancar el backend una vez y luego ejecutar data.sql.
 */
@Slf4j
@Component
public class DataInitializer implements ApplicationRunner {

	static final String ADMIN_NAME = "Admin";

	static final List<Technician> TECHNICIANS = List.of(
			new Technician("tech1@technova.com", "Luis Gómez"),
			new Technician("tech2@technova.com", "Carla Ruiz"));

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final String adminEmail;
	private final String adminPassword;
	private final String technicianPassword;

	public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder,
			@Value("${app.init.admin-email}") String adminEmail,
			@Value("${app.init.admin-password}") String adminPassword,
			@Value("${app.init.technician-password}") String technicianPassword) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.adminEmail = UserDetailsServiceImpl.normalizeEmail(adminEmail);
		this.adminPassword = adminPassword;
		this.technicianPassword = technicianPassword;
	}

	@Override
	@Transactional
	public void run(ApplicationArguments args) {
		createIfMissing(adminEmail, ADMIN_NAME, adminPassword, Role.ADMIN, "ADMIN_PASSWORD");
		for (Technician technician : TECHNICIANS) {
			createIfMissing(technician.email(), technician.fullName(), technicianPassword, Role.TECHNICIAN,
					"TECH_PASSWORD");
		}
	}

	private void createIfMissing(String email, String fullName, String rawPassword, Role role, String envName) {
		if (userRepository.existsByEmail(email)) {
			return;
		}
		if (rawPassword == null || rawPassword.isBlank()) {
			throw new IllegalStateException(envName + " está vacío: ponlo en backend/.env para crear a " + email);
		}

		userRepository.save(User.builder()
				.fullName(fullName)
				.email(email)
				.password(passwordEncoder.encode(rawPassword))
				.role(role)
				.build());
		log.info("Usuario inicial creado: {} ({})", email, role);
	}

	record Technician(String email, String fullName) {
	}

}

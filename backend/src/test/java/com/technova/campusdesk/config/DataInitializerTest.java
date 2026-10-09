package com.technova.campusdesk.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.technova.campusdesk.entity.User;
import com.technova.campusdesk.entity.enums.Role;
import com.technova.campusdesk.repository.UserRepository;

class DataInitializerTest {

	private final UserRepository userRepository = mock(UserRepository.class);
	private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

	@Test
	void createsAdminAndTechniciansOnEmptyDatabase() {
		when(userRepository.existsByEmail(anyString())).thenReturn(false);

		initializer(" Admin@TechNova.com ", "Admin12345", "Tech12345").run(null);

		ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
		verify(userRepository, times(3)).save(captor.capture());
		List<User> saved = captor.getAllValues();

		assertThat(saved).extracting(User::getEmail)
				.containsExactly("admin@technova.com", "tech1@technova.com", "tech2@technova.com");
		assertThat(saved).extracting(User::getFullName).containsExactly("Admin", "Luis Gómez", "Carla Ruiz");
		assertThat(saved).extracting(User::getRole).containsExactly(Role.ADMIN, Role.TECHNICIAN, Role.TECHNICIAN);
		assertThat(passwordEncoder.matches("Admin12345", saved.get(0).getPassword())).isTrue();
		assertThat(passwordEncoder.matches("Tech12345", saved.get(1).getPassword())).isTrue();
	}

	@Test
	void doesNotCreateAnyoneTwice() {
		when(userRepository.existsByEmail(anyString())).thenReturn(true);

		initializer("admin@technova.com", "Admin12345", "Tech12345").run(null);

		verify(userRepository, never()).save(any());
	}

	@Test
	void onlyCreatesTheMissingOnes() {
		when(userRepository.existsByEmail(anyString())).thenReturn(true);
		when(userRepository.existsByEmail("tech2@technova.com")).thenReturn(false);

		initializer("admin@technova.com", "Admin12345", "Tech12345").run(null);

		ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
		verify(userRepository).save(captor.capture());
		assertThat(captor.getValue().getEmail()).isEqualTo("tech2@technova.com");
	}

	@Test
	void blankPasswordFailsWithClearMessage() {
		when(userRepository.existsByEmail(anyString())).thenReturn(false);

		assertThatThrownBy(() -> initializer("admin@technova.com", " ", "Tech12345").run(null))
				.isInstanceOf(IllegalStateException.class)
				.hasMessageContaining("ADMIN_PASSWORD");
	}

	private DataInitializer initializer(String adminEmail, String adminPassword, String techPassword) {
		return new DataInitializer(userRepository, passwordEncoder, adminEmail, adminPassword, techPassword);
	}

}

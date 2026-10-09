package com.technova.campusdesk.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;

import com.technova.campusdesk.entity.User;
import com.technova.campusdesk.entity.enums.Role;

class UserRepositoryTest extends RepositoryTestSupport {

	@Autowired
	private UserRepository userRepository;

	@Test
	void findByEmailReturnsUserWithCreationDate() {
		persistUser("Ana Pérez", "ana@technova.com", Role.USER);
		em.flush();
		em.clear();

		assertThat(userRepository.findByEmail("ana@technova.com"))
				.hasValueSatisfying(user -> {
					assertThat(user.getFullName()).isEqualTo("Ana Pérez");
					assertThat(user.getRole()).isEqualTo(Role.USER);
					assertThat(user.getCreatedAt()).isNotNull();
				});
		assertThat(userRepository.findByEmail("nadie@technova.com")).isEmpty();
	}

	@Test
	void existsByEmail() {
		persistUser("Ana Pérez", "ana@technova.com", Role.USER);

		assertThat(userRepository.existsByEmail("ana@technova.com")).isTrue();
		assertThat(userRepository.existsByEmail("nadie@technova.com")).isFalse();
	}

	@Test
	void duplicateEmailIsRejectedByDatabase() {
		persistUser("Ana Pérez", "ana@technova.com", Role.USER);
		em.flush();

		User duplicate = User.builder()
				.fullName("Otra Ana")
				.email("ana@technova.com")
				.password("$2a$10$otroHash")
				.role(Role.USER)
				.build();

		assertThatThrownBy(() -> userRepository.saveAndFlush(duplicate))
				.isInstanceOf(DataIntegrityViolationException.class);
	}

	@Test
	void findByRoleReturnsOnlyThatRoleSortedByName() {
		persistUser("Luis Gómez", "luis@technova.com", Role.TECHNICIAN);
		persistUser("Carla Ruiz", "carla@technova.com", Role.TECHNICIAN);
		persistUser("Ana Pérez", "ana@technova.com", Role.USER);

		assertThat(userRepository.findByRoleOrderByFullNameAsc(Role.TECHNICIAN))
				.extracting(User::getFullName)
				.containsExactly("Carla Ruiz", "Luis Gómez");
	}

}

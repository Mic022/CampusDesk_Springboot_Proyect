package com.technova.campusdesk.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Sort;

import com.technova.campusdesk.dto.response.UserResponse;
import com.technova.campusdesk.entity.User;
import com.technova.campusdesk.entity.enums.Role;
import com.technova.campusdesk.repository.UserRepository;

class UserServiceTest {

	private final UserRepository userRepository = mock(UserRepository.class);
	private final UserService userService = new UserService(userRepository);

	private final User admin = user(1L, "Admin", Role.ADMIN);
	private final User luis = user(2L, "Luis Gómez", Role.TECHNICIAN);

	@Test
	void findAllReturnsUsersSortedByName() {
		when(userRepository.findAll(Sort.by("fullName"))).thenReturn(List.of(admin, luis));

		assertThat(userService.findAll()).extracting(UserResponse::fullName).containsExactly("Admin", "Luis Gómez");
	}

	@Test
	void findTechniciansReturnsOnlyTechnicians() {
		when(userRepository.findByRoleOrderByFullNameAsc(Role.TECHNICIAN)).thenReturn(List.of(luis));

		assertThat(userService.findTechnicians())
				.containsExactly(new UserResponse(2L, "Luis Gómez", "luis gómez@technova.com", Role.TECHNICIAN));
	}

	private static User user(Long id, String name, Role role) {
		return User.builder().id(id).fullName(name).email(name.toLowerCase() + "@technova.com").password("hash")
				.role(role).build();
	}

}

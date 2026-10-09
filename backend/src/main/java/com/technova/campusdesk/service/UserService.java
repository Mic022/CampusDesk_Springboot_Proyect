package com.technova.campusdesk.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.technova.campusdesk.dto.response.UserResponse;
import com.technova.campusdesk.entity.enums.Role;
import com.technova.campusdesk.mapper.UserMapper;
import com.technova.campusdesk.repository.UserRepository;

import lombok.RequiredArgsConstructor;

// Listados para el ADMIN. El acceso solo-ADMIN lo controla SecurityConfig (/api/users/**).
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

	private final UserRepository userRepository;

	public List<UserResponse> findAll() {
		return userRepository.findAll(Sort.by("fullName")).stream()
				.map(UserMapper::toResponse)
				.toList();
	}

	// Para el selector de "asignar técnico" del ADMIN.
	public List<UserResponse> findTechnicians() {
		return userRepository.findByRoleOrderByFullNameAsc(Role.TECHNICIAN).stream()
				.map(UserMapper::toResponse)
				.toList();
	}

}

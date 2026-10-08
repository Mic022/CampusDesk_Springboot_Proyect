package com.technova.campusdesk.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.technova.campusdesk.entity.User;
import com.technova.campusdesk.entity.enums.Role;

public interface UserRepository extends JpaRepository<User, Long> {

	Optional<User> findByEmail(String email);

	boolean existsByEmail(String email);

	List<User> findByRoleOrderByFullNameAsc(Role role);

}

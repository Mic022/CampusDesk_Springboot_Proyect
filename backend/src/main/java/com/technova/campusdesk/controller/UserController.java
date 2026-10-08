package com.technova.campusdesk.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.technova.campusdesk.dto.response.UserResponse;
import com.technova.campusdesk.service.UserService;

import lombok.RequiredArgsConstructor;

// Solo ADMIN: lo exige SecurityConfig para /api/users/**.
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

	private final UserService userService;

	@GetMapping
	public List<UserResponse> findAll() {
		return userService.findAll();
	}

	@GetMapping("/technicians")
	public List<UserResponse> findTechnicians() {
		return userService.findTechnicians();
	}

}

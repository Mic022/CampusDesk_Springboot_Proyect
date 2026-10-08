package com.technova.campusdesk.dto.response;

import com.technova.campusdesk.entity.enums.Role;

// Nunca lleva la contraseña.
public record UserResponse(Long id, String fullName, String email, Role role) {
}

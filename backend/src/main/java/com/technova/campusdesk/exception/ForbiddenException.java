package com.technova.campusdesk.exception;

// El usuario está autenticado pero no puede acceder a ese recurso (403).
public class ForbiddenException extends RuntimeException {

	public ForbiddenException(String message) {
		super(message);
	}

}

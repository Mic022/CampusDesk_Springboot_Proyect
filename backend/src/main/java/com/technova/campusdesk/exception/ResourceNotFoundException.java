package com.technova.campusdesk.exception;

// No existe el recurso pedido (404).
public class ResourceNotFoundException extends RuntimeException {

	public ResourceNotFoundException(String message) {
		super(message);
	}

}

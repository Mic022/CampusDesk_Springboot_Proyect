package com.technova.campusdesk.exception;

// Se viola una regla del negocio, por ejemplo una transición de estado no permitida o un correo duplicado (409).
public class BusinessRuleException extends RuntimeException {

	public BusinessRuleException(String message) {
		super(message);
	}

}

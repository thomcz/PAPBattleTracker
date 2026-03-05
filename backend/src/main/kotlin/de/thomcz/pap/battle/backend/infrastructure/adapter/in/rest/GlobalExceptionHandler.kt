package de.thomcz.pap.battle.backend.infrastructure.adapter.`in`.rest

import de.thomcz.pap.battle.backend.application.service.AccessDeniedException
import de.thomcz.pap.battle.backend.application.service.EntityNotFoundException
import de.thomcz.pap.battle.backend.application.service.StateConflictException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import java.time.Instant

/**
 * Centralised exception handling for all REST controllers.
 * Converts domain/application exceptions to appropriate HTTP status codes.
 */
@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException::class)
    fun handleNotFound(e: EntityNotFoundException): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ErrorResponse(Instant.now(), 404, "Not Found", e.message ?: "Resource not found"))

    @ExceptionHandler(AccessDeniedException::class)
    fun handleForbidden(e: AccessDeniedException): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(ErrorResponse(Instant.now(), 403, "Forbidden", e.message ?: "Access denied"))

    @ExceptionHandler(StateConflictException::class)
    fun handleStateConflict(e: StateConflictException): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(HttpStatus.CONFLICT)
            .body(ErrorResponse(Instant.now(), 409, "Conflict", e.message ?: "Invalid state transition"))

    @ExceptionHandler(IllegalStateException::class)
    fun handleIllegalState(e: IllegalStateException): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(HttpStatus.CONFLICT)
            .body(ErrorResponse(Instant.now(), 409, "Conflict", e.message ?: "State conflict"))

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleBadRequest(e: IllegalArgumentException): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse(Instant.now(), 400, "Bad Request", e.message ?: "Invalid request"))
}

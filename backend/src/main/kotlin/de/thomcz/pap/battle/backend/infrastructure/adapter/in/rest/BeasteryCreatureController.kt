package de.thomcz.pap.battle.backend.infrastructure.adapter.`in`.rest

import de.thomcz.pap.battle.backend.application.dto.BeasteryCreatureListResponse
import de.thomcz.pap.battle.backend.application.dto.BeasteryCreatureResponse
import de.thomcz.pap.battle.backend.domain.port.`in`.command.CreateBeasteryCreatureCommand
import de.thomcz.pap.battle.backend.domain.port.`in`.command.DeleteBeasteryCreatureCommand
import de.thomcz.pap.battle.backend.domain.port.`in`.command.UpdateBeasteryCreatureCommand
import de.thomcz.pap.battle.backend.application.service.AccessDeniedException
import de.thomcz.pap.battle.backend.application.service.EntityNotFoundException
import de.thomcz.pap.battle.backend.domain.port.`in`.*
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.time.Instant
import java.util.UUID

@RestController
@RequestMapping("/api/beastery/creatures")
class BeasteryCreatureController(
    private val createBeasteryCreatureUseCase: CreateBeasteryCreatureUseCase,
    private val getBeasteryCreatureUseCase: GetBeasteryCreatureUseCase,
    private val listBeasteryCreaturesUseCase: ListBeasteryCreaturesUseCase,
    private val updateBeasteryCreatureUseCase: UpdateBeasteryCreatureUseCase,
    private val deleteBeasteryCreatureUseCase: DeleteBeasteryCreatureUseCase,
    private val duplicateBeasteryCreatureUseCase: DuplicateBeasteryCreatureUseCase
) {

    @PostMapping
    fun createCreature(
        @RequestBody request: CreateBeasteryCreatureRequest,
        authentication: Authentication
    ): ResponseEntity<BeasteryCreatureResponse> {
        val command = CreateBeasteryCreatureCommand(
            name = request.name,
            hitPoints = request.hitPoints,
            armorClass = request.armorClass
        )

        val creature = createBeasteryCreatureUseCase.execute(command, authentication.name)
        return ResponseEntity.status(HttpStatus.CREATED).body(BeasteryCreatureResponse.fromCreature(creature))
    }

    @GetMapping
    fun listCreatures(
        @RequestParam(defaultValue = "false") includeDeleted: Boolean,
        authentication: Authentication
    ): ResponseEntity<BeasteryCreatureListResponse> {
        val creatures = listBeasteryCreaturesUseCase.execute(authentication.name, includeDeleted)
        val response = BeasteryCreatureListResponse(
            creatures = creatures.map { BeasteryCreatureResponse.fromCreature(it) },
            total = creatures.size
        )
        return ResponseEntity.ok(response)
    }

    @GetMapping("/{creatureId}")
    fun getCreature(
        @PathVariable creatureId: UUID,
        authentication: Authentication
    ): ResponseEntity<BeasteryCreatureResponse> {
        val creature = getBeasteryCreatureUseCase.execute(creatureId, authentication.name)
        return ResponseEntity.ok(BeasteryCreatureResponse.fromCreature(creature))
    }

    @PutMapping("/{creatureId}")
    fun updateCreature(
        @PathVariable creatureId: UUID,
        @RequestBody request: UpdateBeasteryCreatureRequest,
        authentication: Authentication
    ): ResponseEntity<BeasteryCreatureResponse> {
        val command = UpdateBeasteryCreatureCommand(
            name = request.name,
            hitPoints = request.hitPoints,
            armorClass = request.armorClass
        )

        val creature = updateBeasteryCreatureUseCase.execute(creatureId, command, authentication.name)
        return ResponseEntity.ok(BeasteryCreatureResponse.fromCreature(creature))
    }

    @DeleteMapping("/{creatureId}")
    fun deleteCreature(
        @PathVariable creatureId: UUID,
        authentication: Authentication
    ): ResponseEntity<Void> {
        deleteBeasteryCreatureUseCase.execute(DeleteBeasteryCreatureCommand(creatureId), authentication.name)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/{creatureId}/duplicate")
    fun duplicateCreature(
        @PathVariable creatureId: UUID,
        @RequestBody(required = false) request: DuplicateBeasteryCreatureRequest?,
        authentication: Authentication
    ): ResponseEntity<BeasteryCreatureResponse> {
        val creature = duplicateBeasteryCreatureUseCase.execute(creatureId, request?.name, authentication.name)
        return ResponseEntity.status(HttpStatus.CREATED).body(BeasteryCreatureResponse.fromCreature(creature))
    }

    // === Exception Handlers ===

    @ExceptionHandler(EntityNotFoundException::class)
    fun handleNotFound(e: EntityNotFoundException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ErrorResponse(timestamp = Instant.now(), status = 404, error = "Not Found", message = e.message ?: "Resource not found"))
    }

    @ExceptionHandler(AccessDeniedException::class)
    fun handleForbidden(e: AccessDeniedException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(ErrorResponse(timestamp = Instant.now(), status = 403, error = "Forbidden", message = e.message ?: "Access denied"))
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleBadRequest(e: IllegalArgumentException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse(timestamp = Instant.now(), status = 400, error = "Bad Request", message = e.message ?: "Invalid request"))
    }

    @ExceptionHandler(IllegalStateException::class)
    fun handleConflict(e: IllegalStateException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(ErrorResponse(timestamp = Instant.now(), status = 409, error = "Conflict", message = e.message ?: "State conflict"))
    }
}

data class CreateBeasteryCreatureRequest(
    val name: String,
    val hitPoints: Int,
    val armorClass: Int
)

data class UpdateBeasteryCreatureRequest(
    val name: String,
    val hitPoints: Int,
    val armorClass: Int
)

data class DuplicateBeasteryCreatureRequest(
    val name: String?
)

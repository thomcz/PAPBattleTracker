package de.thomcz.pap.battle.backend.infrastructure.adapter.`in`.rest

import de.thomcz.pap.battle.backend.application.dto.*
import de.thomcz.pap.battle.backend.application.dto.UpdateCreatureRequest
import de.thomcz.pap.battle.backend.application.service.AccessDeniedException
import de.thomcz.pap.battle.backend.application.service.BattleService
import de.thomcz.pap.battle.backend.application.service.EntityNotFoundException
import de.thomcz.pap.battle.backend.application.service.StateConflictException
import de.thomcz.pap.battle.backend.domain.model.CombatStatus
import de.thomcz.pap.battle.backend.domain.port.`in`.*
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.time.Instant
import java.util.UUID

/**
 * REST controller for battle management endpoints.
 *
 * Implements OpenAPI contract from contracts/battles-api.yaml.
 * All endpoints require JWT authentication.
 *
 * Error handling:
 * - 400 Bad Request: Invalid input (validation errors)
 * - 401 Unauthorized: Missing/invalid JWT token
 * - 403 Forbidden: User doesn't own the battle
 * - 404 Not Found: Battle doesn't exist
 * - 409 Conflict: Invalid state transition (e.g., pause non-active combat)
 * - 500 Internal Server Error: Unexpected errors
 */
@RestController
@RequestMapping("/api/battles")
class BattleController(
    private val createBattle: CreateBattleUseCase,
    private val getBattle: GetBattleUseCase,
    private val listBattles: ListBattlesUseCase,
    private val startCombat: StartCombatUseCase,
    private val pauseCombat: PauseCombatUseCase,
    private val resumeCombat: ResumeCombatUseCase,
    private val endCombat: EndCombatUseCase,
    private val battleService: BattleService
) {

    /**
     * POST /api/battles - Create a new battle
     */
    @PostMapping
    fun createBattle(
        @Valid @RequestBody command: CreateBattleCommand,
        authentication: Authentication
    ): ResponseEntity<BattleResponse> {
        val userId = getUserId(authentication)
        val battle = createBattle.execute(command, userId)

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(BattleResponse.from(battle))
    }

    /**
     * GET /api/battles - List all battles for authenticated user
     */
    @GetMapping
    fun listBattles(
        @RequestParam(required = false) status: CombatStatus?,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        authentication: Authentication
    ): ResponseEntity<BattleListResponse> {
        val userId = getUserId(authentication)
        val battles = listBattles.execute(userId, status)

        val battleResponses = battles.map { BattleResponse.from(it) }
        val response = BattleListResponse.from(battleResponses, page, size)

        return ResponseEntity.ok(response)
    }

    /**
     * GET /api/battles/{id} - Get detailed battle information
     */
    @GetMapping("/{id}")
    fun getBattle(
        @PathVariable id: UUID,
        authentication: Authentication
    ): ResponseEntity<BattleDetailResponse> {
        val userId = getUserId(authentication)
        val battle = getBattle.execute(GetBattleCommand(id), userId)

        return ResponseEntity.ok(BattleDetailResponse.from(battle))
    }

    /**
     * POST /api/battles/{id}/start - Start combat
     */
    @PostMapping("/{id}/start")
    fun startCombat(
        @PathVariable id: UUID,
        authentication: Authentication
    ): ResponseEntity<BattleDetailResponse> {
        val userId = getUserId(authentication)
        val battle = startCombat.execute(StartCombatCommand(id), userId)

        return ResponseEntity.ok(BattleDetailResponse.from(battle))
    }

    /**
     * POST /api/battles/{id}/pause - Pause combat
     */
    @PostMapping("/{id}/pause")
    fun pauseCombat(
        @PathVariable id: UUID,
        authentication: Authentication
    ): ResponseEntity<BattleDetailResponse> {
        val userId = getUserId(authentication)
        val battle = pauseCombat.execute(PauseCombatCommand(id), userId)

        return ResponseEntity.ok(BattleDetailResponse.from(battle))
    }

    /**
     * POST /api/battles/{id}/resume - Resume combat
     */
    @PostMapping("/{id}/resume")
    fun resumeCombat(
        @PathVariable id: UUID,
        authentication: Authentication
    ): ResponseEntity<BattleDetailResponse> {
        val userId = getUserId(authentication)
        val battle = resumeCombat.execute(ResumeCombatCommand(id), userId)

        return ResponseEntity.ok(BattleDetailResponse.from(battle))
    }

    /**
     * POST /api/battles/{id}/end - End combat
     */
    @PostMapping("/{id}/end")
    fun endCombat(
        @PathVariable id: UUID,
        @Valid @RequestBody command: EndCombatCommand,
        authentication: Authentication
    ): ResponseEntity<BattleDetailResponse> {
        val userId = getUserId(authentication)
        val battle = endCombat.execute(id, command, userId)

        return ResponseEntity.ok(BattleDetailResponse.from(battle))
    }

    /**
     * POST /api/battles/{id}/creatures - Add a creature to a battle
     * User Story 1: Add Creatures to Battle
     */
    @PostMapping("/{id}/creatures")
    fun addCreature(
        @PathVariable id: UUID,
        @Valid @RequestBody request: CreateCreatureRequest,
        authentication: Authentication
    ): ResponseEntity<CreatureResponse> {
        val userId = getUserId(authentication)
        val creature = battleService.addCreature(id, userId, request)

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(creature)
    }

    /**
     * PUT /api/battles/{id}/creatures/{creatureId} - Update a creature's attributes
     * User Story 2: Edit Creature Attributes
     */
    @PutMapping("/{id}/creatures/{creatureId}")
    fun updateCreature(
        @PathVariable id: UUID,
        @PathVariable creatureId: UUID,
        @Valid @RequestBody request: UpdateCreatureRequest,
        authentication: Authentication
    ): ResponseEntity<CreatureResponse> {
        val userId = getUserId(authentication)
        val creature = battleService.updateCreature(id, creatureId, userId, request)

        return ResponseEntity.ok(creature)
    }

    /**
     * DELETE /api/battles/{id}/creatures/{creatureId} - Remove a creature from battle
     * User Story 3: Remove Creatures
     */
    @DeleteMapping("/{id}/creatures/{creatureId}")
    fun removeCreature(
        @PathVariable id: UUID,
        @PathVariable creatureId: UUID,
        authentication: Authentication
    ): ResponseEntity<Void> {
        val userId = getUserId(authentication)
        battleService.removeCreature(id, creatureId, userId)

        return ResponseEntity.noContent().build()
    }

    /**
     * Extract user ID from Spring Security authentication.
     */
    private fun getUserId(authentication: Authentication): String {
        return authentication.name // JWT subject is userName
    }

    /**
     * Exception handler for REST controller.
     * Converts domain/application exceptions to appropriate HTTP status codes.
     */
    @ExceptionHandler(EntityNotFoundException::class)
    fun handleNotFound(e: EntityNotFoundException): ResponseEntity<ErrorResponse> {
        return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body(ErrorResponse(
                timestamp = Instant.now(),
                status = 404,
                error = "Not Found",
                message = e.message ?: "Resource not found"
            ))
    }

    @ExceptionHandler(AccessDeniedException::class)
    fun handleForbidden(e: AccessDeniedException): ResponseEntity<ErrorResponse> {
        return ResponseEntity
            .status(HttpStatus.FORBIDDEN)
            .body(ErrorResponse(
                timestamp = Instant.now(),
                status = 403,
                error = "Forbidden",
                message = e.message ?: "Access denied"
            ))
    }

    @ExceptionHandler(StateConflictException::class)
    fun handleConflict(e: StateConflictException): ResponseEntity<ErrorResponse> {
        return ResponseEntity
            .status(HttpStatus.CONFLICT)
            .body(ErrorResponse(
                timestamp = Instant.now(),
                status = 409,
                error = "Conflict",
                message = e.message ?: "Invalid state transition"
            ))
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleBadRequest(e: IllegalArgumentException): ResponseEntity<ErrorResponse> {
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ErrorResponse(
                timestamp = Instant.now(),
                status = 400,
                error = "Bad Request",
                message = e.message ?: "Invalid request"
            ))
    }
}

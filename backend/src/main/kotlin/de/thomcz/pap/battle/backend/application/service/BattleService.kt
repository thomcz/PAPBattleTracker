package de.thomcz.pap.battle.backend.application.service

import de.thomcz.pap.battle.backend.application.dto.CreateBattleCommand
import de.thomcz.pap.battle.backend.application.dto.CreateCreatureRequest
import de.thomcz.pap.battle.backend.application.dto.CreatureResponse
import de.thomcz.pap.battle.backend.application.dto.EndCombatCommand
import de.thomcz.pap.battle.backend.application.dto.UpdateCreatureRequest
import de.thomcz.pap.battle.backend.domain.model.Battle
import de.thomcz.pap.battle.backend.domain.model.CombatStatus
import de.thomcz.pap.battle.backend.domain.port.`in`.*
import de.thomcz.pap.battle.backend.domain.port.out.BattleRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.nio.charset.StandardCharsets
import java.util.UUID

/**
 * Application service implementing all battle-related use cases.
 *
 * Coordinates between domain layer (Battle aggregate) and infrastructure (repositories).
 * Each method represents one use case and provides a transaction boundary.
 *
 * Error handling:
 * - IllegalArgumentException from aggregate → convert to 400 Bad Request in controller
 * - EntityNotFoundException → convert to 404 Not Found in controller
 * - StateConflictException → convert to 409 Conflict in controller
 * - AccessDeniedException → convert to 403 Forbidden in controller
 */
@Service
@Transactional
class BattleService(
    private val battleRepository: BattleRepository
) : CreateBattleUseCase,
    GetBattleUseCase,
    ListBattlesUseCase,
    StartCombatUseCase,
    PauseCombatUseCase,
    ResumeCombatUseCase,
    EndCombatUseCase {

    override fun execute(command: CreateBattleCommand, userId: String): Battle {
        // Create new battle aggregate (emits BattleCreated event)
        // Note: userId is username from JWT, convert to deterministic UUID
        val battle = Battle.create(
            userId = userNameToUUID(userId),
            name = command.name
        )

        // Save battle (persists events and metadata)
        battleRepository.save(battle)

        return battle
    }

    @Transactional(readOnly = true)
    override fun execute(command: de.thomcz.pap.battle.backend.application.dto.GetBattleCommand, userId: String): Battle {
        // Load battle from repository (reconstructs from events)
        val battle = battleRepository.findById(command.battleId)
            ?: throw EntityNotFoundException("Battle not found: ${command.battleId}")

        // Verify ownership (convert username to UUID for comparison)
        if (battle.userId != userNameToUUID(userId)) {
            throw AccessDeniedException("User $userId does not own battle ${command.battleId}")
        }

        return battle
    }

    @Transactional(readOnly = true)
    override fun execute(userId: String, status: CombatStatus?): List<Battle> {
        // Load all battles for user, optionally filtered by status
        // Convert username to UUID for querying
        return battleRepository.findByUserId(userNameToUUID(userId), status)
    }

    override fun execute(command: de.thomcz.pap.battle.backend.application.dto.StartCombatCommand, userId: String): Battle {
        // Load battle
        val battle = battleRepository.findById(command.battleId)
            ?: throw EntityNotFoundException("Battle not found: ${command.battleId}")

        // Verify ownership
        val userUUID = userNameToUUID(userId)
        if (battle.userId != userUUID) {
            throw AccessDeniedException("User $userId does not own battle ${command.battleId}")
        }

        // Start combat (emits CombatStarted event)
        try {
            battle.startCombat(userUUID)
        } catch (e: IllegalArgumentException) {
            throw StateConflictException("Cannot start combat: ${e.message}", e)
        }

        // Save (persists new event)
        battleRepository.save(battle)

        return battle
    }

    override fun execute(command: de.thomcz.pap.battle.backend.application.dto.PauseCombatCommand, userId: String): Battle {
        // Load battle
        val battle = battleRepository.findById(command.battleId)
            ?: throw EntityNotFoundException("Battle not found: ${command.battleId}")

        // Verify ownership
        val userUUID = userNameToUUID(userId)
        if (battle.userId != userUUID) {
            throw AccessDeniedException("User $userId does not own battle ${command.battleId}")
        }

        // Pause combat (emits CombatPaused event)
        try {
            battle.pauseCombat(userUUID)
        } catch (e: IllegalArgumentException) {
            throw StateConflictException("Cannot pause combat: ${e.message}", e)
        }

        // Save (persists new event)
        battleRepository.save(battle)

        return battle
    }

    override fun execute(command: de.thomcz.pap.battle.backend.application.dto.ResumeCombatCommand, userId: String): Battle {
        // Load battle
        val battle = battleRepository.findById(command.battleId)
            ?: throw EntityNotFoundException("Battle not found: ${command.battleId}")

        // Verify ownership
        val userUUID = userNameToUUID(userId)
        if (battle.userId != userUUID) {
            throw AccessDeniedException("User $userId does not own battle ${command.battleId}")
        }

        // Resume combat (emits CombatResumed event)
        try {
            battle.resumeCombat(userUUID)
        } catch (e: IllegalArgumentException) {
            throw StateConflictException("Cannot resume combat: ${e.message}", e)
        }

        // Save (persists new event)
        battleRepository.save(battle)

        return battle
    }

    override fun execute(battleId: UUID, command: EndCombatCommand, userId: String): Battle {
        // Load battle
        val battle = battleRepository.findById(battleId)
            ?: throw EntityNotFoundException("Battle not found: $battleId")

        // Verify ownership
        val userUUID = userNameToUUID(userId)
        if (battle.userId != userUUID) {
            throw AccessDeniedException("User $userId does not own battle $battleId")
        }

        // End combat (emits CombatEnded event)
        try {
            battle.endCombat(userUUID, command.outcome)
        } catch (e: IllegalArgumentException) {
            throw StateConflictException("Cannot end combat: ${e.message}", e)
        }

        // Save (persists new event)
        battleRepository.save(battle)

        return battle
    }

    /**
     * Add a creature to a battle.
     *
     * User Story 1: Add Creatures to Battle
     *
     * @param battleId The battle to add the creature to
     * @param userId The username of the user performing the action (from JWT)
     * @param request The creature details
     * @return CreatureResponse containing the newly added creature
     * @throws EntityNotFoundException if battle not found
     * @throws AccessDeniedException if user does not own the battle
     * @throws IllegalArgumentException if creature attributes are invalid
     */
    fun addCreature(battleId: UUID, userId: String, request: CreateCreatureRequest): CreatureResponse {
        // Load battle from repository
        val battle = battleRepository.findById(battleId)
            ?: throw EntityNotFoundException("Battle not found: $battleId")

        // Verify ownership
        val userUUID = userNameToUUID(userId)
        if (battle.userId != userUUID) {
            throw AccessDeniedException("User $userId does not own battle $battleId")
        }

        // Add creature to battle (emits CreatureAdded event)
        // Domain layer validates creature attributes
        battle.addCreature(
            userId = userUUID,
            name = request.name,
            type = request.type,
            currentHp = request.currentHp,
            maxHp = request.maxHp,
            initiative = request.initiative,
            armorClass = request.armorClass
        )

        // Save battle (persists new event)
        battleRepository.save(battle)

        // Get the newly added creature (last one in the list)
        val addedCreature = battle.getCreatures().last()

        // Map to response DTO
        return CreatureResponse.fromCreature(addedCreature)
    }

    /**
     * Update a creature in a battle.
     *
     * User Story 2: Edit Creature Attributes
     *
     * @param battleId The battle containing the creature
     * @param creatureId The creature to update
     * @param userId The username of the user performing the action (from JWT)
     * @param request The updated creature details
     * @return CreatureResponse containing the updated creature
     * @throws EntityNotFoundException if battle not found
     * @throws AccessDeniedException if user does not own the battle
     * @throws IllegalArgumentException if creature not found or attributes are invalid
     */
    fun updateCreature(
        battleId: UUID,
        creatureId: UUID,
        userId: String,
        request: UpdateCreatureRequest
    ): CreatureResponse {
        // Load battle from repository
        val battle = battleRepository.findById(battleId)
            ?: throw EntityNotFoundException("Battle not found: $battleId")

        // Verify ownership
        val userUUID = userNameToUUID(userId)
        if (battle.userId != userUUID) {
            throw AccessDeniedException("User $userId does not own battle $battleId")
        }

        // Update creature (emits CreatureUpdated event)
        // Domain layer validates creature attributes
        battle.updateCreature(
            userId = userUUID,
            creatureId = creatureId,
            name = request.name,
            currentHp = request.currentHp,
            maxHp = request.maxHp,
            initiative = request.initiative,
            armorClass = request.armorClass
        )

        // Save battle (persists new event)
        battleRepository.save(battle)

        // Get the updated creature
        val updatedCreature = battle.getCreature(creatureId)
            ?: throw IllegalArgumentException("Creature not found after update: $creatureId")

        // Map to response DTO
        return CreatureResponse.fromCreature(updatedCreature)
    }

    /**
     * Remove a creature from a battle.
     *
     * User Story 3: Remove Creatures
     *
     * @param battleId The battle containing the creature
     * @param creatureId The creature to remove
     * @param userId The username of the user performing the action (from JWT)
     * @throws EntityNotFoundException if battle not found
     * @throws AccessDeniedException if user does not own the battle
     * @throws IllegalArgumentException if creature not found
     */
    fun removeCreature(battleId: UUID, creatureId: UUID, userId: String) {
        // Load battle from repository
        val battle = battleRepository.findById(battleId)
            ?: throw EntityNotFoundException("Battle not found: $battleId")

        // Verify ownership
        val userUUID = userNameToUUID(userId)
        if (battle.userId != userUUID) {
            throw AccessDeniedException("User $userId does not own battle $battleId")
        }

        // Remove creature (emits CreatureRemoved event)
        battle.removeCreature(userUUID, creatureId)

        // Save battle (persists new event)
        battleRepository.save(battle)
    }

    /**
     * Convert username to a deterministic UUID using UUID v3 (MD5-based).
     *
     * This ensures consistent UUID generation from usernames for the Battle domain,
     * which uses UUIDs while authentication uses usernames.
     *
     * Uses a fixed namespace prefix to ensure deterministic results.
     */
    private fun userNameToUUID(userName: String): UUID {
        // Use a fixed namespace prefix for PAP Battle Tracker users
        val namespacePrefix = "pap-battle-tracker"
        val combined = "$namespacePrefix:$userName"
        return UUID.nameUUIDFromBytes(combined.toByteArray(StandardCharsets.UTF_8))
    }
}

// Custom exceptions for application layer
class EntityNotFoundException(message: String) : RuntimeException(message)
class StateConflictException(message: String, cause: Throwable? = null) : RuntimeException(message, cause)
class AccessDeniedException(message: String) : RuntimeException(message)

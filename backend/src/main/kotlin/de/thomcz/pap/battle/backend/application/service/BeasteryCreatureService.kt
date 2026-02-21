package de.thomcz.pap.battle.backend.application.service

import de.thomcz.pap.battle.backend.application.dto.CreateBeasteryCreatureCommand
import de.thomcz.pap.battle.backend.application.dto.DeleteBeasteryCreatureCommand
import de.thomcz.pap.battle.backend.application.dto.UpdateBeasteryCreatureCommand
import de.thomcz.pap.battle.backend.domain.model.BeasteryCreature
import de.thomcz.pap.battle.backend.domain.port.`in`.*
import de.thomcz.pap.battle.backend.domain.port.out.BeasteryCreatureRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.nio.charset.StandardCharsets
import java.util.UUID

@Service
@Transactional
class BeasteryCreatureService(
    private val beasteryCreatureRepository: BeasteryCreatureRepository
) : CreateBeasteryCreatureUseCase,
    GetBeasteryCreatureUseCase,
    ListBeasteryCreaturesUseCase,
    UpdateBeasteryCreatureUseCase,
    DeleteBeasteryCreatureUseCase,
    DuplicateBeasteryCreatureUseCase {

    override fun execute(command: CreateBeasteryCreatureCommand, userId: String): BeasteryCreature {
        val creature = BeasteryCreature.create(
            userId = userNameToUUID(userId),
            name = command.name,
            hitPoints = command.hitPoints,
            armorClass = command.armorClass
        )

        beasteryCreatureRepository.save(creature)
        return creature
    }

    @Transactional(readOnly = true)
    override fun execute(creatureId: UUID, userId: String): BeasteryCreature {
        val creature = beasteryCreatureRepository.findById(creatureId)
            ?: throw EntityNotFoundException("Beastery creature not found: $creatureId")

        if (creature.userId != userNameToUUID(userId)) {
            throw AccessDeniedException("User $userId does not own creature $creatureId")
        }

        return creature
    }

    @Transactional(readOnly = true)
    override fun execute(userId: String, includeDeleted: Boolean): List<BeasteryCreature> {
        val creatures = beasteryCreatureRepository.findByUserId(userNameToUUID(userId))
        return if (includeDeleted) creatures else creatures.filter { !it.isDeleted }
    }

    override fun execute(creatureId: UUID, command: UpdateBeasteryCreatureCommand, userId: String): BeasteryCreature {
        val creature = beasteryCreatureRepository.findById(creatureId)
            ?: throw EntityNotFoundException("Beastery creature not found: $creatureId")

        val userUUID = userNameToUUID(userId)
        if (creature.userId != userUUID) {
            throw AccessDeniedException("User $userId does not own creature $creatureId")
        }

        creature.update(
            userId = userUUID,
            name = command.name,
            hitPoints = command.hitPoints,
            armorClass = command.armorClass
        )

        beasteryCreatureRepository.save(creature)
        return creature
    }

    override fun execute(command: DeleteBeasteryCreatureCommand, userId: String) {
        val creature = beasteryCreatureRepository.findById(command.creatureId)
            ?: throw EntityNotFoundException("Beastery creature not found: ${command.creatureId}")

        val userUUID = userNameToUUID(userId)
        if (creature.userId != userUUID) {
            throw AccessDeniedException("User $userId does not own creature ${command.creatureId}")
        }

        creature.delete(userUUID)
        beasteryCreatureRepository.save(creature)
    }

    override fun execute(creatureId: UUID, customName: String?, userId: String): BeasteryCreature {
        val creature = beasteryCreatureRepository.findById(creatureId)
            ?: throw EntityNotFoundException("Beastery creature not found: $creatureId")

        val userUUID = userNameToUUID(userId)
        if (creature.userId != userUUID) {
            throw AccessDeniedException("User $userId does not own creature $creatureId")
        }

        val duplicate = creature.duplicate(userUUID, customName)
        beasteryCreatureRepository.save(duplicate)
        return duplicate
    }

    private fun userNameToUUID(userName: String): UUID {
        val namespacePrefix = "pap-battle-tracker"
        val combined = "$namespacePrefix:$userName"
        return UUID.nameUUIDFromBytes(combined.toByteArray(StandardCharsets.UTF_8))
    }
}

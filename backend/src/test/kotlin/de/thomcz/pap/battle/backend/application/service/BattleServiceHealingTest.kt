package de.thomcz.pap.battle.backend.application.service

import de.thomcz.pap.battle.backend.application.dto.ApplyHealingCommand
import de.thomcz.pap.battle.backend.application.dto.ApplyStatusEffectCommand
import de.thomcz.pap.battle.backend.application.dto.CreateCreatureRequest
import de.thomcz.pap.battle.backend.application.dto.EffectAction
import de.thomcz.pap.battle.backend.domain.model.Battle
import de.thomcz.pap.battle.backend.domain.model.CreatureType
import de.thomcz.pap.battle.backend.domain.port.out.BattleRepository
import de.thomcz.pap.battle.backend.domain.port.out.EventStore
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.whenever
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertTrue

@ExtendWith(MockitoExtension::class)
class BattleServiceHealingTest {

    @Mock
    private lateinit var battleRepository: BattleRepository

    @Mock
    private lateinit var eventStore: EventStore

    @InjectMocks
    private lateinit var battleService: BattleService

    private val userName = "healer"
    private val userUUID = UUID.nameUUIDFromBytes("pap-battle-tracker:$userName".toByteArray())

    private fun activeBattleWithDamagedCreature(): Pair<Battle, UUID> {
        val battle = Battle.create(userUUID, "Healing Test Battle")
        battle.addCreature(
            userId = userUUID,
            name = "Wounded Warrior",
            type = CreatureType.PLAYER,
            currentHp = 10,
            maxHp = 50,
            initiative = 10,
            armorClass = 16
        )
        battle.startCombat(userUUID)
        val creatureId = battle.getCreatures().first().id
        return Pair(battle, creatureId)
    }

    // === applyHealing tests ===

    @Test
    fun `should heal creature when battle is active`() {
        val (battle, creatureId) = activeBattleWithDamagedCreature()
        val battleId = battle.battleId

        whenever(battleRepository.findById(battleId)).thenReturn(battle)
        whenever(battleRepository.save(any())).thenAnswer { it.arguments[0] as Battle }

        val command = ApplyHealingCommand(creatureId = creatureId, healing = 20)
        battleService.execute(battleId, command, userName)

        val healedCreature = battle.getCreature(creatureId)!!
        assertEquals(30, healedCreature.currentHp)
    }

    @Test
    fun `should cap healing at maxHp`() {
        val (battle, creatureId) = activeBattleWithDamagedCreature()
        val battleId = battle.battleId

        whenever(battleRepository.findById(battleId)).thenReturn(battle)
        whenever(battleRepository.save(any())).thenAnswer { it.arguments[0] as Battle }

        val command = ApplyHealingCommand(creatureId = creatureId, healing = 999)
        battleService.execute(battleId, command, userName)

        val healedCreature = battle.getCreature(creatureId)!!
        assertEquals(50, healedCreature.currentHp)
    }

    @Test
    fun `should throw when healing battle that is not active`() {
        val battle = Battle.create(userUUID, "Not Active Battle")
        battle.addCreature(userUUID, "Fighter", CreatureType.PLAYER, 30, 30, 10, 14)
        val creatureId = battle.getCreatures().first().id
        val battleId = battle.battleId

        whenever(battleRepository.findById(battleId)).thenReturn(battle)

        val command = ApplyHealingCommand(creatureId = creatureId, healing = 5)
        assertThrows<StateConflictException> {
            battleService.execute(battleId, command, userName)
        }
    }

    @Test
    fun `should throw when healing creature not found`() {
        val (battle, _) = activeBattleWithDamagedCreature()
        val battleId = battle.battleId

        whenever(battleRepository.findById(battleId)).thenReturn(battle)

        val command = ApplyHealingCommand(creatureId = UUID.randomUUID(), healing = 5)
        assertThrows<StateConflictException> {
            battleService.execute(battleId, command, userName)
        }
    }

    // === applyStatusEffect tests ===

    @Test
    fun `should add status effect to creature`() {
        val (battle, creatureId) = activeBattleWithDamagedCreature()
        val battleId = battle.battleId

        whenever(battleRepository.findById(battleId)).thenReturn(battle)
        whenever(battleRepository.save(any())).thenAnswer { it.arguments[0] as Battle }

        val command = ApplyStatusEffectCommand(effect = "Poisoned", action = EffectAction.ADD)
        battleService.execute(battleId, creatureId, command, userName)

        val creature = battle.getCreature(creatureId)!!
        assertTrue(creature.statusEffects.contains("Poisoned"))
    }

    @Test
    fun `should remove status effect from creature`() {
        val (battle, creatureId) = activeBattleWithDamagedCreature()
        val battleId = battle.battleId
        // Pre-add the effect
        battle.applyStatusEffect(userUUID, creatureId, "Stunned", true)

        whenever(battleRepository.findById(battleId)).thenReturn(battle)
        whenever(battleRepository.save(any())).thenAnswer { it.arguments[0] as Battle }

        val command = ApplyStatusEffectCommand(effect = "Stunned", action = EffectAction.REMOVE)
        battleService.execute(battleId, creatureId, command, userName)

        val creature = battle.getCreature(creatureId)!!
        assertTrue(!creature.statusEffects.contains("Stunned"))
    }

    @Test
    fun `should throw when applying status effect to non-active battle`() {
        val battle = Battle.create(userUUID, "Inactive Battle")
        battle.addCreature(userUUID, "Fighter", CreatureType.PLAYER, 30, 30, 10, 14)
        val creatureId = battle.getCreatures().first().id
        val battleId = battle.battleId

        whenever(battleRepository.findById(battleId)).thenReturn(battle)

        val command = ApplyStatusEffectCommand(effect = "Blessed", action = EffectAction.ADD)
        assertThrows<StateConflictException> {
            battleService.execute(battleId, creatureId, command, userName)
        }
    }
}

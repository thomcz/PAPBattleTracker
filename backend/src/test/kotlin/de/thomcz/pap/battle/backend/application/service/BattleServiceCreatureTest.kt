package de.thomcz.pap.battle.backend.application.service

import de.thomcz.pap.battle.backend.application.dto.CreateCreatureRequest
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
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

/**
 * Service layer tests for creature management operations.
 * Tests BattleService.addCreature() method (User Story 1).
 */
@ExtendWith(MockitoExtension::class)
class BattleServiceCreatureTest {

    @Mock
    private lateinit var battleRepository: BattleRepository

    @Mock
    private lateinit var eventStore: EventStore

    @InjectMocks
    private lateinit var battleService: BattleService

    @Test
    fun `should add creature to battle via service`() {
        // given
        val userName = "testuser"
        // Convert username to UUID using same logic as BattleService
        val userUUID = UUID.nameUUIDFromBytes("pap-battle-tracker:$userName".toByteArray())
        val battleId = UUID.randomUUID()
        val battle = Battle.create(userUUID, "Test Battle")

        val request = CreateCreatureRequest(
            name = "Goblin",
            type = CreatureType.MONSTER,
            currentHp = 7,
            maxHp = 7,
            initiative = 14,
            armorClass = 15
        )

        whenever(battleRepository.findById(battleId)).thenReturn(battle)
        whenever(battleRepository.save(any())).thenAnswer { it.arguments[0] as Battle }

        // when
        val result = battleService.addCreature(battleId, userName, request)

        // then
        assertNotNull(result)
        assertEquals("Goblin", result.name)
        assertEquals(CreatureType.MONSTER, result.type)
        assertEquals(7, result.currentHp)

        verify(battleRepository).findById(battleId)
        verify(battleRepository).save(any())
    }

    @Test
    fun `should fail to add creature to non-existent battle`() {
        // given
        val userName = "testuser"
        val battleId = UUID.randomUUID()
        val request = CreateCreatureRequest(
            name = "Goblin",
            type = CreatureType.MONSTER,
            currentHp = 7,
            maxHp = 7,
            initiative = 14,
            armorClass = 15
        )

        whenever(battleRepository.findById(battleId)).thenReturn(null)

        // when/then
        assertThrows<EntityNotFoundException> {
            battleService.addCreature(battleId, userName, request)
        }
    }

    @Test
    fun `should fail to add creature when user does not own battle`() {
        // given
        val ownerName = "owner"
        val differentUserName = "otheruser"
        val ownerUUID = UUID.randomUUID()
        val battleId = UUID.randomUUID()
        val battle = Battle.create(ownerUUID, "Test Battle")

        val request = CreateCreatureRequest(
            name = "Goblin",
            type = CreatureType.MONSTER,
            currentHp = 7,
            maxHp = 7,
            initiative = 14,
            armorClass = 15
        )

        whenever(battleRepository.findById(battleId)).thenReturn(battle)

        // when/then
        assertThrows<AccessDeniedException> {
            battleService.addCreature(battleId, differentUserName, request)
        }
    }

    @Test
    fun `should validate creature attributes before adding`() {
        // given
        val userName = "testuser"
        // Convert username to UUID using same logic as BattleService
        val userUUID = UUID.nameUUIDFromBytes("pap-battle-tracker:$userName".toByteArray())
        val battleId = UUID.randomUUID()
        val battle = Battle.create(userUUID, "Test Battle")

        val invalidRequest = CreateCreatureRequest(
            name = "",
            type = CreatureType.MONSTER,
            currentHp = 7,
            maxHp = 7,
            initiative = 14,
            armorClass = 15
        )

        whenever(battleRepository.findById(battleId)).thenReturn(battle)

        // when/then
        assertThrows<IllegalArgumentException> {
            battleService.addCreature(battleId, userName, invalidRequest)
        }
    }
}

package de.thomcz.pap.battle.backend.application.service

import de.thomcz.pap.battle.backend.application.dto.CreateBeasteryCreatureCommand
import de.thomcz.pap.battle.backend.application.dto.DeleteBeasteryCreatureCommand
import de.thomcz.pap.battle.backend.application.dto.UpdateBeasteryCreatureCommand
import de.thomcz.pap.battle.backend.domain.model.BeasteryCreature
import de.thomcz.pap.battle.backend.domain.port.out.BeasteryCreatureRepository
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

@ExtendWith(MockitoExtension::class)
class BeasteryCreatureServiceTest {

    @Mock
    private lateinit var beasteryCreatureRepository: BeasteryCreatureRepository

    @InjectMocks
    private lateinit var beasteryCreatureService: BeasteryCreatureService

    private val userName = "testuser"
    private val userUUID = UUID.nameUUIDFromBytes("pap-battle-tracker:$userName".toByteArray())

    // === Create Creature ===

    @Test
    fun `should create creature and save to repository`() {
        val command = CreateBeasteryCreatureCommand(
            name = "Goblin",
            hitPoints = 7,
            armorClass = 15
        )

        val result = beasteryCreatureService.execute(command, userName)

        assertNotNull(result)
        assertEquals("Goblin", result.name)
        assertEquals(7, result.hitPoints)
        assertEquals(15, result.armorClass)
        assertEquals(userUUID, result.userId)
        verify(beasteryCreatureRepository).save(any())
    }

    // === Get Creature ===

    @Test
    fun `should get creature by id for owner`() {
        val creatureId = UUID.randomUUID()
        val creature = BeasteryCreature.create(userId = userUUID, name = "Goblin", hitPoints = 7, armorClass = 15)

        whenever(beasteryCreatureRepository.findById(creatureId)).thenReturn(creature)

        val result = beasteryCreatureService.execute(creatureId, userName)

        assertEquals("Goblin", result.name)
    }

    @Test
    fun `should throw EntityNotFoundException when creature not found`() {
        val creatureId = UUID.randomUUID()
        whenever(beasteryCreatureRepository.findById(creatureId)).thenReturn(null)

        assertThrows<EntityNotFoundException> {
            beasteryCreatureService.execute(creatureId, userName)
        }
    }

    @Test
    fun `should throw AccessDeniedException when user does not own creature`() {
        val creatureId = UUID.randomUUID()
        val otherUserId = UUID.randomUUID()
        val creature = BeasteryCreature.create(userId = otherUserId, name = "Goblin", hitPoints = 7, armorClass = 15)

        whenever(beasteryCreatureRepository.findById(creatureId)).thenReturn(creature)

        assertThrows<AccessDeniedException> {
            beasteryCreatureService.execute(creatureId, userName)
        }
    }

    // === List Creatures ===

    @Test
    fun `should list non-deleted creatures for user`() {
        val creature1 = BeasteryCreature.create(userId = userUUID, name = "Goblin", hitPoints = 7, armorClass = 15)
        val creature2 = BeasteryCreature.create(userId = userUUID, name = "Orc", hitPoints = 15, armorClass = 13)
        val deletedCreature = BeasteryCreature.create(userId = userUUID, name = "Deleted", hitPoints = 1, armorClass = 10)
        deletedCreature.delete(userUUID)

        whenever(beasteryCreatureRepository.findByUserId(userUUID)).thenReturn(listOf(creature1, creature2, deletedCreature))

        val result = beasteryCreatureService.execute(userName, includeDeleted = false)

        assertEquals(2, result.size)
    }

    @Test
    fun `should list all creatures including deleted when requested`() {
        val creature1 = BeasteryCreature.create(userId = userUUID, name = "Goblin", hitPoints = 7, armorClass = 15)
        val deletedCreature = BeasteryCreature.create(userId = userUUID, name = "Deleted", hitPoints = 1, armorClass = 10)
        deletedCreature.delete(userUUID)

        whenever(beasteryCreatureRepository.findByUserId(userUUID)).thenReturn(listOf(creature1, deletedCreature))

        val result = beasteryCreatureService.execute(userName, includeDeleted = true)

        assertEquals(2, result.size)
    }

    // === Update Creature ===

    @Test
    fun `should update creature attributes`() {
        val creatureId = UUID.randomUUID()
        val creature = BeasteryCreature.create(userId = userUUID, name = "Goblin", hitPoints = 7, armorClass = 15)
        val command = UpdateBeasteryCreatureCommand(name = "Hobgoblin", hitPoints = 11, armorClass = 18)

        whenever(beasteryCreatureRepository.findById(creatureId)).thenReturn(creature)

        val result = beasteryCreatureService.execute(creatureId, command, userName)

        assertEquals("Hobgoblin", result.name)
        assertEquals(11, result.hitPoints)
        assertEquals(18, result.armorClass)
        verify(beasteryCreatureRepository).save(any())
    }

    @Test
    fun `should throw EntityNotFoundException on update when creature not found`() {
        val creatureId = UUID.randomUUID()
        val command = UpdateBeasteryCreatureCommand(name = "Updated", hitPoints = 7, armorClass = 15)

        whenever(beasteryCreatureRepository.findById(creatureId)).thenReturn(null)

        assertThrows<EntityNotFoundException> {
            beasteryCreatureService.execute(creatureId, command, userName)
        }
    }

    @Test
    fun `should throw AccessDeniedException on update when user does not own creature`() {
        val creatureId = UUID.randomUUID()
        val otherUserId = UUID.randomUUID()
        val creature = BeasteryCreature.create(userId = otherUserId, name = "Goblin", hitPoints = 7, armorClass = 15)
        val command = UpdateBeasteryCreatureCommand(name = "Updated", hitPoints = 7, armorClass = 15)

        whenever(beasteryCreatureRepository.findById(creatureId)).thenReturn(creature)

        assertThrows<AccessDeniedException> {
            beasteryCreatureService.execute(creatureId, command, userName)
        }
    }

    // === Delete Creature ===

    @Test
    fun `should delete creature`() {
        val creatureId = UUID.randomUUID()
        val creature = BeasteryCreature.create(userId = userUUID, name = "Goblin", hitPoints = 7, armorClass = 15)
        val command = DeleteBeasteryCreatureCommand(creatureId)

        whenever(beasteryCreatureRepository.findById(creatureId)).thenReturn(creature)

        beasteryCreatureService.execute(command, userName)

        verify(beasteryCreatureRepository).save(any())
    }

    @Test
    fun `should throw EntityNotFoundException on delete when creature not found`() {
        val creatureId = UUID.randomUUID()
        val command = DeleteBeasteryCreatureCommand(creatureId)

        whenever(beasteryCreatureRepository.findById(creatureId)).thenReturn(null)

        assertThrows<EntityNotFoundException> {
            beasteryCreatureService.execute(command, userName)
        }
    }

    @Test
    fun `should throw AccessDeniedException on delete when user does not own creature`() {
        val creatureId = UUID.randomUUID()
        val otherUserId = UUID.randomUUID()
        val creature = BeasteryCreature.create(userId = otherUserId, name = "Goblin", hitPoints = 7, armorClass = 15)
        val command = DeleteBeasteryCreatureCommand(creatureId)

        whenever(beasteryCreatureRepository.findById(creatureId)).thenReturn(creature)

        assertThrows<AccessDeniedException> {
            beasteryCreatureService.execute(command, userName)
        }
    }

    // === Duplicate Creature ===

    @Test
    fun `should duplicate creature with default name`() {
        val creatureId = UUID.randomUUID()
        val creature = BeasteryCreature.create(userId = userUUID, name = "Goblin", hitPoints = 7, armorClass = 15)

        whenever(beasteryCreatureRepository.findById(creatureId)).thenReturn(creature)

        val result = beasteryCreatureService.execute(creatureId, null, userName)

        assertEquals("Goblin Copy", result.name)
        assertEquals(7, result.hitPoints)
        assertEquals(15, result.armorClass)
        verify(beasteryCreatureRepository).save(any())
    }

    @Test
    fun `should duplicate creature with custom name`() {
        val creatureId = UUID.randomUUID()
        val creature = BeasteryCreature.create(userId = userUUID, name = "Goblin", hitPoints = 7, armorClass = 15)

        whenever(beasteryCreatureRepository.findById(creatureId)).thenReturn(creature)

        val result = beasteryCreatureService.execute(creatureId, "Elite Goblin", userName)

        assertEquals("Elite Goblin", result.name)
    }

    @Test
    fun `should throw EntityNotFoundException on duplicate when creature not found`() {
        val creatureId = UUID.randomUUID()
        whenever(beasteryCreatureRepository.findById(creatureId)).thenReturn(null)

        assertThrows<EntityNotFoundException> {
            beasteryCreatureService.execute(creatureId, null, userName)
        }
    }
}

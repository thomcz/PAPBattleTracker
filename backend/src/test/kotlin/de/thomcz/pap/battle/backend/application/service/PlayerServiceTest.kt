package de.thomcz.pap.battle.backend.application.service

import de.thomcz.pap.battle.backend.application.dto.CreatePlayerCommand
import de.thomcz.pap.battle.backend.application.dto.DeletePlayerCommand
import de.thomcz.pap.battle.backend.application.dto.UpdatePlayerCommand
import de.thomcz.pap.battle.backend.domain.model.Player
import de.thomcz.pap.battle.backend.domain.port.out.PlayerRepository
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
import kotlin.test.assertFalse
import kotlin.test.assertNotNull

@ExtendWith(MockitoExtension::class)
class PlayerServiceTest {

    @Mock
    private lateinit var playerRepository: PlayerRepository

    @InjectMocks
    private lateinit var playerService: PlayerService

    private val userName = "testuser"
    private val userUUID = UUID.nameUUIDFromBytes("pap-battle-tracker:$userName".toByteArray())

    // === Create Player ===

    @Test
    fun `should create player and save to repository`() {
        val command = CreatePlayerCommand(
            name = "Thorin",
            characterClass = "Fighter",
            level = 5,
            maxHp = 45
        )

        val result = playerService.execute(command, userName)

        assertNotNull(result)
        assertEquals("Thorin", result.name)
        assertEquals("Fighter", result.characterClass)
        assertEquals(5, result.level)
        assertEquals(45, result.maxHp)
        assertEquals(userUUID, result.userId)
        verify(playerRepository).save(any())
    }

    // === Get Player ===

    @Test
    fun `should get player by id for owner`() {
        val playerId = UUID.randomUUID()
        val player = Player.create(userId = userUUID, name = "Thorin", characterClass = "Fighter", level = 5, maxHp = 45)

        whenever(playerRepository.findById(playerId)).thenReturn(player)

        val result = playerService.execute(playerId, userName)

        assertEquals("Thorin", result.name)
    }

    @Test
    fun `should throw EntityNotFoundException when player not found`() {
        val playerId = UUID.randomUUID()
        whenever(playerRepository.findById(playerId)).thenReturn(null)

        assertThrows<EntityNotFoundException> {
            playerService.execute(playerId, userName)
        }
    }

    @Test
    fun `should throw AccessDeniedException when user does not own player`() {
        val playerId = UUID.randomUUID()
        val otherUserId = UUID.randomUUID()
        val player = Player.create(userId = otherUserId, name = "Thorin", characterClass = "Fighter", level = 5, maxHp = 45)

        whenever(playerRepository.findById(playerId)).thenReturn(player)

        assertThrows<AccessDeniedException> {
            playerService.execute(playerId, userName)
        }
    }

    // === List Players ===

    @Test
    fun `should list non-deleted players for user`() {
        val player1 = Player.create(userId = userUUID, name = "Thorin", characterClass = "Fighter", level = 5, maxHp = 45)
        val player2 = Player.create(userId = userUUID, name = "Gandalf", characterClass = "Wizard", level = 10, maxHp = 30)
        val deletedPlayer = Player.create(userId = userUUID, name = "Deleted", characterClass = "Rogue", level = 1, maxHp = 10)
        deletedPlayer.delete(userUUID)

        whenever(playerRepository.findByUserId(userUUID)).thenReturn(listOf(player1, player2, deletedPlayer))

        val result = playerService.execute(userName, includeDeleted = false)

        assertEquals(2, result.size)
    }

    @Test
    fun `should list all players including deleted when requested`() {
        val player1 = Player.create(userId = userUUID, name = "Thorin", characterClass = "Fighter", level = 5, maxHp = 45)
        val deletedPlayer = Player.create(userId = userUUID, name = "Deleted", characterClass = "Rogue", level = 1, maxHp = 10)
        deletedPlayer.delete(userUUID)

        whenever(playerRepository.findByUserId(userUUID)).thenReturn(listOf(player1, deletedPlayer))

        val result = playerService.execute(userName, includeDeleted = true)

        assertEquals(2, result.size)
    }

    // === Update Player ===

    @Test
    fun `should update player attributes`() {
        val playerId = UUID.randomUUID()
        val player = Player.create(userId = userUUID, name = "Thorin", characterClass = "Fighter", level = 5, maxHp = 45)
        val command = UpdatePlayerCommand(name = "Thorin II", characterClass = "Paladin", level = 6, maxHp = 50)

        whenever(playerRepository.findById(playerId)).thenReturn(player)

        val result = playerService.execute(playerId, command, userName)

        assertEquals("Thorin II", result.name)
        assertEquals("Paladin", result.characterClass)
        verify(playerRepository).save(any())
    }

    @Test
    fun `should throw EntityNotFoundException on update when player not found`() {
        val playerId = UUID.randomUUID()
        val command = UpdatePlayerCommand(name = "Updated", characterClass = "Fighter", level = 5, maxHp = 45)

        whenever(playerRepository.findById(playerId)).thenReturn(null)

        assertThrows<EntityNotFoundException> {
            playerService.execute(playerId, command, userName)
        }
    }

    @Test
    fun `should throw AccessDeniedException on update when user does not own player`() {
        val playerId = UUID.randomUUID()
        val otherUserId = UUID.randomUUID()
        val player = Player.create(userId = otherUserId, name = "Thorin", characterClass = "Fighter", level = 5, maxHp = 45)
        val command = UpdatePlayerCommand(name = "Updated", characterClass = "Fighter", level = 5, maxHp = 45)

        whenever(playerRepository.findById(playerId)).thenReturn(player)

        assertThrows<AccessDeniedException> {
            playerService.execute(playerId, command, userName)
        }
    }

    // === Delete Player ===

    @Test
    fun `should soft-delete player`() {
        val playerId = UUID.randomUUID()
        val player = Player.create(userId = userUUID, name = "Thorin", characterClass = "Fighter", level = 5, maxHp = 45)
        val command = DeletePlayerCommand(playerId)

        whenever(playerRepository.findById(playerId)).thenReturn(player)

        playerService.execute(command, userName)

        verify(playerRepository).save(any())
    }

    @Test
    fun `should throw EntityNotFoundException on delete when player not found`() {
        val playerId = UUID.randomUUID()
        val command = DeletePlayerCommand(playerId)

        whenever(playerRepository.findById(playerId)).thenReturn(null)

        assertThrows<EntityNotFoundException> {
            playerService.execute(command, userName)
        }
    }

    @Test
    fun `should throw AccessDeniedException on delete when user does not own player`() {
        val playerId = UUID.randomUUID()
        val otherUserId = UUID.randomUUID()
        val player = Player.create(userId = otherUserId, name = "Thorin", characterClass = "Fighter", level = 5, maxHp = 45)
        val command = DeletePlayerCommand(playerId)

        whenever(playerRepository.findById(playerId)).thenReturn(player)

        assertThrows<AccessDeniedException> {
            playerService.execute(command, userName)
        }
    }
}

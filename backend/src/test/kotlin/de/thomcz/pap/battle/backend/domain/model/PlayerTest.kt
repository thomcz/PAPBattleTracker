package de.thomcz.pap.battle.backend.domain.model

import de.thomcz.pap.battle.backend.domain.model.events.PlayerCreated
import de.thomcz.pap.battle.backend.domain.model.events.PlayerDeleted
import de.thomcz.pap.battle.backend.domain.model.events.PlayerUpdated
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class PlayerTest {

    private val userId = UUID.randomUUID()

    // === Creation Tests ===

    @Test
    fun `should create player with valid attributes`() {
        val player = Player.create(
            userId = userId,
            name = "Thorin",
            characterClass = "Fighter",
            level = 5,
            maxHp = 45
        )

        assertEquals("Thorin", player.name)
        assertEquals("Fighter", player.characterClass)
        assertEquals(5, player.level)
        assertEquals(45, player.maxHp)
        assertEquals(userId, player.userId)
        assertFalse(player.isDeleted)
        assertNotNull(player.playerId)
        assertNotNull(player.createdAt)
        assertNotNull(player.lastModified)
    }

    @Test
    fun `should emit PlayerCreated event on creation`() {
        val player = Player.create(
            userId = userId,
            name = "Thorin",
            characterClass = "Fighter",
            level = 5,
            maxHp = 45
        )

        val events = player.getUncommittedEvents()
        assertEquals(1, events.size)
        assertTrue(events[0] is PlayerCreated)

        val event = events[0] as PlayerCreated
        assertEquals("Thorin", event.name)
        assertEquals("Fighter", event.characterClass)
        assertEquals(5, event.level)
        assertEquals(45, event.maxHp)
    }

    @Test
    fun `should trim name and characterClass on creation`() {
        val player = Player.create(
            userId = userId,
            name = "  Thorin  ",
            characterClass = "  Fighter  ",
            level = 1,
            maxHp = 10
        )

        assertEquals("Thorin", player.name)
        assertEquals("Fighter", player.characterClass)
    }

    @Test
    fun `should fail when name is blank`() {
        val exception = assertThrows<IllegalArgumentException> {
            Player.create(userId = userId, name = "", characterClass = "Fighter", level = 1, maxHp = 10)
        }
        assertTrue(exception.message!!.contains("name cannot be blank"))
    }

    @Test
    fun `should fail when name exceeds 100 characters`() {
        val longName = "A".repeat(101)
        val exception = assertThrows<IllegalArgumentException> {
            Player.create(userId = userId, name = longName, characterClass = "Fighter", level = 1, maxHp = 10)
        }
        assertTrue(exception.message!!.contains("100 characters"))
    }

    @Test
    fun `should fail when characterClass is blank`() {
        val exception = assertThrows<IllegalArgumentException> {
            Player.create(userId = userId, name = "Thorin", characterClass = "", level = 1, maxHp = 10)
        }
        assertTrue(exception.message!!.contains("class cannot be blank"))
    }

    @Test
    fun `should fail when characterClass exceeds 50 characters`() {
        val longClass = "A".repeat(51)
        val exception = assertThrows<IllegalArgumentException> {
            Player.create(userId = userId, name = "Thorin", characterClass = longClass, level = 1, maxHp = 10)
        }
        assertTrue(exception.message!!.contains("50 characters"))
    }

    @Test
    fun `should fail when level is less than 1`() {
        val exception = assertThrows<IllegalArgumentException> {
            Player.create(userId = userId, name = "Thorin", characterClass = "Fighter", level = 0, maxHp = 10)
        }
        assertTrue(exception.message!!.contains("Level must be between 1 and 20"))
    }

    @Test
    fun `should fail when level exceeds 20`() {
        val exception = assertThrows<IllegalArgumentException> {
            Player.create(userId = userId, name = "Thorin", characterClass = "Fighter", level = 21, maxHp = 10)
        }
        assertTrue(exception.message!!.contains("Level must be between 1 and 20"))
    }

    @Test
    fun `should fail when maxHp is less than 1`() {
        val exception = assertThrows<IllegalArgumentException> {
            Player.create(userId = userId, name = "Thorin", characterClass = "Fighter", level = 1, maxHp = 0)
        }
        assertTrue(exception.message!!.contains("Max HP must be between 1 and 999"))
    }

    @Test
    fun `should fail when maxHp exceeds 999`() {
        val exception = assertThrows<IllegalArgumentException> {
            Player.create(userId = userId, name = "Thorin", characterClass = "Fighter", level = 1, maxHp = 1000)
        }
        assertTrue(exception.message!!.contains("Max HP must be between 1 and 999"))
    }

    // === Update Tests ===

    @Test
    fun `should update player attributes`() {
        val player = Player.create(userId = userId, name = "Thorin", characterClass = "Fighter", level = 5, maxHp = 45)
        player.markEventsAsCommitted()

        player.update(userId = userId, name = "Thorin II", characterClass = "Paladin", level = 6, maxHp = 50)

        assertEquals("Thorin II", player.name)
        assertEquals("Paladin", player.characterClass)
        assertEquals(6, player.level)
        assertEquals(50, player.maxHp)
    }

    @Test
    fun `should emit PlayerUpdated event on update`() {
        val player = Player.create(userId = userId, name = "Thorin", characterClass = "Fighter", level = 5, maxHp = 45)
        player.markEventsAsCommitted()

        player.update(userId = userId, name = "Thorin II", characterClass = "Paladin", level = 6, maxHp = 50)

        val events = player.getUncommittedEvents()
        assertEquals(1, events.size)
        assertTrue(events[0] is PlayerUpdated)
    }

    @Test
    fun `should fail to update deleted player`() {
        val player = Player.create(userId = userId, name = "Thorin", characterClass = "Fighter", level = 5, maxHp = 45)
        player.delete(userId)

        val exception = assertThrows<IllegalStateException> {
            player.update(userId = userId, name = "Updated", characterClass = "Fighter", level = 5, maxHp = 45)
        }
        assertTrue(exception.message!!.contains("deleted"))
    }

    @Test
    fun `should apply same validation rules on update`() {
        val player = Player.create(userId = userId, name = "Thorin", characterClass = "Fighter", level = 5, maxHp = 45)

        assertThrows<IllegalArgumentException> {
            player.update(userId = userId, name = "", characterClass = "Fighter", level = 5, maxHp = 45)
        }
    }

    // === Delete Tests ===

    @Test
    fun `should soft-delete player`() {
        val player = Player.create(userId = userId, name = "Thorin", characterClass = "Fighter", level = 5, maxHp = 45)
        player.markEventsAsCommitted()

        player.delete(userId)

        assertTrue(player.isDeleted)
    }

    @Test
    fun `should emit PlayerDeleted event on delete`() {
        val player = Player.create(userId = userId, name = "Thorin", characterClass = "Fighter", level = 5, maxHp = 45)
        player.markEventsAsCommitted()

        player.delete(userId)

        val events = player.getUncommittedEvents()
        assertEquals(1, events.size)
        assertTrue(events[0] is PlayerDeleted)
    }

    @Test
    fun `should fail to delete already deleted player`() {
        val player = Player.create(userId = userId, name = "Thorin", characterClass = "Fighter", level = 5, maxHp = 45)
        player.delete(userId)

        val exception = assertThrows<IllegalStateException> {
            player.delete(userId)
        }
        assertTrue(exception.message!!.contains("already deleted"))
    }

    // === Event Sourcing Tests ===

    @Test
    fun `should rebuild state from event history`() {
        val playerId = UUID.randomUUID()
        val eventUserId = UUID.randomUUID()
        val now = java.time.Instant.now()

        val events = listOf(
            PlayerCreated(
                playerId = playerId, eventId = UUID.randomUUID(), timestamp = now,
                userId = eventUserId, name = "Thorin", characterClass = "Fighter", level = 5, maxHp = 45
            ),
            PlayerUpdated(
                playerId = playerId, eventId = UUID.randomUUID(), timestamp = now.plusSeconds(10),
                userId = eventUserId, name = "Thorin II", characterClass = "Paladin", level = 6, maxHp = 50
            )
        )

        val player = Player.newInstance().loadFromHistory(events)

        assertEquals(playerId, player.playerId)
        assertEquals("Thorin II", player.name)
        assertEquals("Paladin", player.characterClass)
        assertEquals(6, player.level)
        assertEquals(50, player.maxHp)
        assertFalse(player.isDeleted)
        assertTrue(player.getUncommittedEvents().isEmpty())
    }

    @Test
    fun `should rebuild deleted state from event history`() {
        val playerId = UUID.randomUUID()
        val eventUserId = UUID.randomUUID()
        val now = java.time.Instant.now()

        val events = listOf(
            PlayerCreated(
                playerId = playerId, eventId = UUID.randomUUID(), timestamp = now,
                userId = eventUserId, name = "Thorin", characterClass = "Fighter", level = 5, maxHp = 45
            ),
            PlayerDeleted(
                playerId = playerId, eventId = UUID.randomUUID(), timestamp = now.plusSeconds(10),
                userId = eventUserId
            )
        )

        val player = Player.newInstance().loadFromHistory(events)

        assertTrue(player.isDeleted)
        assertTrue(player.getUncommittedEvents().isEmpty())
    }

    @Test
    fun `should clear uncommitted events after commit`() {
        val player = Player.create(userId = userId, name = "Thorin", characterClass = "Fighter", level = 5, maxHp = 45)
        assertEquals(1, player.getUncommittedEvents().size)

        player.markEventsAsCommitted()

        assertTrue(player.getUncommittedEvents().isEmpty())
    }
}

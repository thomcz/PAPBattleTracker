package de.thomcz.pap.battle.backend.domain.model

import de.thomcz.pap.battle.backend.domain.model.events.BeasteryCreatureCreated
import de.thomcz.pap.battle.backend.domain.model.events.BeasteryCreatureDeleted
import de.thomcz.pap.battle.backend.domain.model.events.BeasteryCreatureUpdated
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class BeasteryCreatureTest {

    private val userId = UUID.randomUUID()

    // === Creation Tests ===

    @Test
    fun `should create creature with valid attributes`() {
        val creature = BeasteryCreature.create(
            userId = userId,
            name = "Goblin",
            hitPoints = 7,
            armorClass = 15
        )

        assertEquals("Goblin", creature.name)
        assertEquals(7, creature.hitPoints)
        assertEquals(15, creature.armorClass)
        assertEquals(userId, creature.userId)
        assertFalse(creature.isDeleted)
        assertNotNull(creature.creatureId)
        assertNotNull(creature.createdAt)
        assertNotNull(creature.lastModified)
    }

    @Test
    fun `should emit BeasteryCreatureCreated event on creation`() {
        val creature = BeasteryCreature.create(
            userId = userId,
            name = "Goblin",
            hitPoints = 7,
            armorClass = 15
        )

        val events = creature.getUncommittedEvents()
        assertEquals(1, events.size)
        assertTrue(events[0] is BeasteryCreatureCreated)

        val event = events[0] as BeasteryCreatureCreated
        assertEquals("Goblin", event.name)
        assertEquals(7, event.hitPoints)
        assertEquals(15, event.armorClass)
    }

    @Test
    fun `should trim name on creation`() {
        val creature = BeasteryCreature.create(
            userId = userId,
            name = "  Goblin  ",
            hitPoints = 7,
            armorClass = 15
        )

        assertEquals("Goblin", creature.name)
    }

    @Test
    fun `should fail when name is blank`() {
        val exception = assertThrows<IllegalArgumentException> {
            BeasteryCreature.create(userId = userId, name = "", hitPoints = 7, armorClass = 15)
        }
        assertTrue(exception.message!!.contains("name cannot be blank"))
    }

    @Test
    fun `should fail when name exceeds 100 characters`() {
        val longName = "A".repeat(101)
        val exception = assertThrows<IllegalArgumentException> {
            BeasteryCreature.create(userId = userId, name = longName, hitPoints = 7, armorClass = 15)
        }
        assertTrue(exception.message!!.contains("100 characters"))
    }

    @Test
    fun `should fail when hitPoints is less than 1`() {
        val exception = assertThrows<IllegalArgumentException> {
            BeasteryCreature.create(userId = userId, name = "Goblin", hitPoints = 0, armorClass = 15)
        }
        assertTrue(exception.message!!.contains("Hit points must be between 1 and 999"))
    }

    @Test
    fun `should fail when hitPoints exceeds 999`() {
        val exception = assertThrows<IllegalArgumentException> {
            BeasteryCreature.create(userId = userId, name = "Goblin", hitPoints = 1000, armorClass = 15)
        }
        assertTrue(exception.message!!.contains("Hit points must be between 1 and 999"))
    }

    @Test
    fun `should fail when armorClass is negative`() {
        val exception = assertThrows<IllegalArgumentException> {
            BeasteryCreature.create(userId = userId, name = "Goblin", hitPoints = 7, armorClass = -1)
        }
        assertTrue(exception.message!!.contains("Armor class must be between 0 and 30"))
    }

    @Test
    fun `should fail when armorClass exceeds 30`() {
        val exception = assertThrows<IllegalArgumentException> {
            BeasteryCreature.create(userId = userId, name = "Goblin", hitPoints = 7, armorClass = 31)
        }
        assertTrue(exception.message!!.contains("Armor class must be between 0 and 30"))
    }

    // === Update Tests ===

    @Test
    fun `should update creature attributes`() {
        val creature = BeasteryCreature.create(userId = userId, name = "Goblin", hitPoints = 7, armorClass = 15)
        creature.markEventsAsCommitted()

        creature.update(userId = userId, name = "Hobgoblin", hitPoints = 11, armorClass = 18)

        assertEquals("Hobgoblin", creature.name)
        assertEquals(11, creature.hitPoints)
        assertEquals(18, creature.armorClass)
    }

    @Test
    fun `should emit BeasteryCreatureUpdated event on update`() {
        val creature = BeasteryCreature.create(userId = userId, name = "Goblin", hitPoints = 7, armorClass = 15)
        creature.markEventsAsCommitted()

        creature.update(userId = userId, name = "Hobgoblin", hitPoints = 11, armorClass = 18)

        val events = creature.getUncommittedEvents()
        assertEquals(1, events.size)
        assertTrue(events[0] is BeasteryCreatureUpdated)
    }

    @Test
    fun `should fail to update deleted creature`() {
        val creature = BeasteryCreature.create(userId = userId, name = "Goblin", hitPoints = 7, armorClass = 15)
        creature.delete(userId)

        val exception = assertThrows<IllegalStateException> {
            creature.update(userId = userId, name = "Updated", hitPoints = 7, armorClass = 15)
        }
        assertTrue(exception.message!!.contains("deleted"))
    }

    @Test
    fun `should apply same validation rules on update`() {
        val creature = BeasteryCreature.create(userId = userId, name = "Goblin", hitPoints = 7, armorClass = 15)

        assertThrows<IllegalArgumentException> {
            creature.update(userId = userId, name = "", hitPoints = 7, armorClass = 15)
        }
    }

    // === Delete Tests ===

    @Test
    fun `should delete creature`() {
        val creature = BeasteryCreature.create(userId = userId, name = "Goblin", hitPoints = 7, armorClass = 15)
        creature.markEventsAsCommitted()

        creature.delete(userId)

        assertTrue(creature.isDeleted)
    }

    @Test
    fun `should emit BeasteryCreatureDeleted event on delete`() {
        val creature = BeasteryCreature.create(userId = userId, name = "Goblin", hitPoints = 7, armorClass = 15)
        creature.markEventsAsCommitted()

        creature.delete(userId)

        val events = creature.getUncommittedEvents()
        assertEquals(1, events.size)
        assertTrue(events[0] is BeasteryCreatureDeleted)
    }

    @Test
    fun `should fail to delete already deleted creature`() {
        val creature = BeasteryCreature.create(userId = userId, name = "Goblin", hitPoints = 7, armorClass = 15)
        creature.delete(userId)

        val exception = assertThrows<IllegalStateException> {
            creature.delete(userId)
        }
        assertTrue(exception.message!!.contains("already deleted"))
    }

    // === Duplicate Tests ===

    @Test
    fun `should duplicate creature with default name`() {
        val creature = BeasteryCreature.create(userId = userId, name = "Goblin", hitPoints = 7, armorClass = 15)

        val duplicate = creature.duplicate(userId)

        assertEquals("Goblin Copy", duplicate.name)
        assertEquals(7, duplicate.hitPoints)
        assertEquals(15, duplicate.armorClass)
        assertEquals(userId, duplicate.userId)
        assertFalse(duplicate.isDeleted)
        assertTrue(duplicate.creatureId != creature.creatureId)
    }

    @Test
    fun `should duplicate creature with custom name`() {
        val creature = BeasteryCreature.create(userId = userId, name = "Goblin", hitPoints = 7, armorClass = 15)

        val duplicate = creature.duplicate(userId, "Elite Goblin")

        assertEquals("Elite Goblin", duplicate.name)
    }

    @Test
    fun `should fail to duplicate deleted creature`() {
        val creature = BeasteryCreature.create(userId = userId, name = "Goblin", hitPoints = 7, armorClass = 15)
        creature.delete(userId)

        assertThrows<IllegalStateException> {
            creature.duplicate(userId)
        }
    }

    // === Event Sourcing Tests ===

    @Test
    fun `should rebuild state from event history`() {
        val creatureId = UUID.randomUUID()
        val eventUserId = UUID.randomUUID()
        val now = java.time.Instant.now()

        val events = listOf(
            BeasteryCreatureCreated(
                creatureId = creatureId, eventId = UUID.randomUUID(), timestamp = now,
                userId = eventUserId, name = "Goblin", hitPoints = 7, armorClass = 15
            ),
            BeasteryCreatureUpdated(
                creatureId = creatureId, eventId = UUID.randomUUID(), timestamp = now.plusSeconds(10),
                userId = eventUserId, name = "Hobgoblin", hitPoints = 11, armorClass = 18
            )
        )

        val creature = BeasteryCreature.newInstance().loadFromHistory(events)

        assertEquals(creatureId, creature.creatureId)
        assertEquals("Hobgoblin", creature.name)
        assertEquals(11, creature.hitPoints)
        assertEquals(18, creature.armorClass)
        assertFalse(creature.isDeleted)
        assertTrue(creature.getUncommittedEvents().isEmpty())
    }

    @Test
    fun `should rebuild deleted state from event history`() {
        val creatureId = UUID.randomUUID()
        val eventUserId = UUID.randomUUID()
        val now = java.time.Instant.now()

        val events = listOf(
            BeasteryCreatureCreated(
                creatureId = creatureId, eventId = UUID.randomUUID(), timestamp = now,
                userId = eventUserId, name = "Goblin", hitPoints = 7, armorClass = 15
            ),
            BeasteryCreatureDeleted(
                creatureId = creatureId, eventId = UUID.randomUUID(), timestamp = now.plusSeconds(10),
                userId = eventUserId
            )
        )

        val creature = BeasteryCreature.newInstance().loadFromHistory(events)

        assertTrue(creature.isDeleted)
        assertTrue(creature.getUncommittedEvents().isEmpty())
    }

    @Test
    fun `should clear uncommitted events after commit`() {
        val creature = BeasteryCreature.create(userId = userId, name = "Goblin", hitPoints = 7, armorClass = 15)
        assertEquals(1, creature.getUncommittedEvents().size)

        creature.markEventsAsCommitted()

        assertTrue(creature.getUncommittedEvents().isEmpty())
    }
}

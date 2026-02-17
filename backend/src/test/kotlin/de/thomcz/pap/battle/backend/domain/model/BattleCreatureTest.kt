package de.thomcz.pap.battle.backend.domain.model

import de.thomcz.pap.battle.backend.domain.model.events.CombatOutcome
import de.thomcz.pap.battle.backend.domain.model.events.CreatureAdded
import de.thomcz.pap.battle.backend.domain.model.events.CreatureRemoved
import de.thomcz.pap.battle.backend.domain.model.events.CreatureUpdated
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

/**
 * Unit tests for Battle aggregate's creature management methods.
 * Tests User Stories 1-5 creature operations.
 */
class BattleCreatureTest {

    // === T015: Tests for Battle.addCreature() ===

    @Test
    fun `should add creature to battle and emit CreatureAdded event`() {
        // given
        val userId = UUID.randomUUID()
        val battle = Battle.create(userId, "Test Battle")
        battle.markEventsAsCommitted() // Clear creation event

        // when
        val creatureName = "Goblin"
        val result = battle.addCreature(
            userId = userId,
            name = creatureName,
            type = CreatureType.MONSTER,
            currentHp = 7,
            maxHp = 7,
            initiative = 14,
            armorClass = 15
        )

        // then
        val events = result.getUncommittedEvents()
        assertEquals(1, events.size)

        val event = events[0] as CreatureAdded
        assertEquals(battle.battleId, event.battleId)
        assertEquals(userId, event.userId)
        assertEquals(creatureName, event.name)
        assertEquals(CreatureType.MONSTER, event.type)
        assertEquals(7, event.currentHp)
        assertEquals(7, event.maxHp)
        assertEquals(14, event.initiative)
        assertEquals(15, event.armorClass)
    }

    @Test
    fun `should add creature to internal creatures list`() {
        // given
        val userId = UUID.randomUUID()
        val battle = Battle.create(userId, "Test Battle")

        // when
        val result = battle.addCreature(
            userId = userId,
            name = "Fighter",
            type = CreatureType.PLAYER,
            currentHp = 30,
            maxHp = 30,
            initiative = 18,
            armorClass = 18
        )

        // then
        assertEquals(1, result.getCreatures().size)
        val creature = result.getCreatures()[0]
        assertEquals("Fighter", creature.name)
        assertEquals(CreatureType.PLAYER, creature.type)
        assertEquals(30, creature.currentHp)
    }

    @Test
    fun `should add multiple creatures to battle`() {
        // given
        val userId = UUID.randomUUID()
        val battle = Battle.create(userId, "Test Battle")

        // when
        val withGoblin = battle.addCreature(
            userId = userId,
            name = "Goblin",
            type = CreatureType.MONSTER,
            currentHp = 7,
            maxHp = 7,
            initiative = 14,
            armorClass = 15
        )

        val withBoth = withGoblin.addCreature(
            userId = userId,
            name = "Fighter",
            type = CreatureType.PLAYER,
            currentHp = 30,
            maxHp = 30,
            initiative = 18,
            armorClass = 18
        )

        // then
        assertEquals(2, withBoth.getCreatures().size)
    }

    @Test
    fun `should fail to add creature with blank name`() {
        // given
        val userId = UUID.randomUUID()
        val battle = Battle.create(userId, "Test Battle")

        // when/then
        val exception = assertThrows<IllegalArgumentException> {
            battle.addCreature(
                userId = userId,
                name = "",
                type = CreatureType.MONSTER,
                currentHp = 7,
                maxHp = 7,
                initiative = 14,
                armorClass = 15
            )
        }
        assertTrue(exception.message!!.contains("name cannot be blank"))
    }

    @Test
    fun `should fail to add creature with invalid HP`() {
        // given
        val userId = UUID.randomUUID()
        val battle = Battle.create(userId, "Test Battle")

        // when/then
        val exception = assertThrows<IllegalArgumentException> {
            battle.addCreature(
                userId = userId,
                name = "Goblin",
                type = CreatureType.MONSTER,
                currentHp = -5,
                maxHp = 7,
                initiative = 14,
                armorClass = 15
            )
        }
        assertTrue(exception.message!!.contains("Current HP cannot be negative"))
    }

    @Test
    fun `should allow adding creatures before combat starts`() {
        // given
        val userId = UUID.randomUUID()
        val battle = Battle.create(userId, "Test Battle")
        assertEquals(CombatStatus.NOT_STARTED, battle.status)

        // when
        val result = battle.addCreature(
            userId = userId,
            name = "Goblin",
            type = CreatureType.MONSTER,
            currentHp = 7,
            maxHp = 7,
            initiative = 14,
            armorClass = 15
        )

        // then
        assertEquals(1, result.getCreatures().size)
    }

    @Test
    fun `should allow adding creatures during active combat`() {
        // given
        val userId = UUID.randomUUID()
        val battle = Battle.create(userId, "Test Battle")
            .addCreature(userId, "Fighter", CreatureType.PLAYER, 30, 30, 18, 18)
        val active = battle.startCombat(userId)
        assertEquals(CombatStatus.ACTIVE, active.status)

        // when
        val result = active.addCreature(
            userId = userId,
            name = "Reinforcement",
            type = CreatureType.PLAYER,
            currentHp = 25,
            maxHp = 25,
            initiative = 15,
            armorClass = 16
        )

        // then
        assertEquals(2, result.getCreatures().size)
    }

    @Test
    fun `should fail to add creature when combat has ended`() {
        // given
        val userId = UUID.randomUUID()
        val battle = Battle.create(userId, "Test Battle")
            .addCreature(userId, "Fighter", CreatureType.PLAYER, 30, 30, 18, 18)
            .startCombat(userId)
        val ended = battle.endCombat(userId, CombatOutcome.PLAYERS_VICTORIOUS)
        assertEquals(CombatStatus.ENDED, ended.status)

        // when/then
        val exception = assertThrows<IllegalStateException> {
            ended.addCreature(
                userId = userId,
                name = "Too Late",
                type = CreatureType.MONSTER,
                currentHp = 10,
                maxHp = 10,
                initiative = 10,
                armorClass = 10
            )
        }
        assertTrue(exception.message!!.contains("Cannot add creatures") || exception.message!!.contains("ended"))
    }

    // === Helper method tests ===

    @Test
    fun `getCreatures should return empty list for new battle`() {
        // given
        val userId = UUID.randomUUID()
        val battle = Battle.create(userId, "Test Battle")

        // when/then
        assertTrue(battle.getCreatures().isEmpty())
    }

    @Test
    fun `getCreature should find creature by ID`() {
        // given
        val userId = UUID.randomUUID()
        val battle = Battle.create(userId, "Test Battle")
            .addCreature(userId, "Goblin", CreatureType.MONSTER, 7, 7, 14, 15)

        val creatureId = battle.getCreatures()[0].id

        // when
        val found = battle.getCreature(creatureId)

        // then
        assertEquals("Goblin", found?.name)
    }

    @Test
    fun `getCreature should return null for non-existent ID`() {
        // given
        val userId = UUID.randomUUID()
        val battle = Battle.create(userId, "Test Battle")
        val nonExistentId = UUID.randomUUID()

        // when
        val found = battle.getCreature(nonExistentId)

        // then
        assertEquals(null, found)
    }

    // === T039: Tests for Battle.updateCreature() - User Story 2 ===

    @Test
    fun `should update creature attributes and emit CreatureUpdated event`() {
        // given
        val userId = UUID.randomUUID()
        val battle = Battle.create(userId, "Test Battle")
            .addCreature(userId, "Goblin", CreatureType.MONSTER, 7, 7, 14, 15)
        battle.markEventsAsCommitted() // Clear previous events

        val creatureId = battle.getCreatures()[0].id

        // when
        val result = battle.updateCreature(
            userId = userId,
            creatureId = creatureId,
            name = "Hobgoblin",
            currentHp = 10,
            maxHp = 12,
            initiative = 16,
            armorClass = 17
        )

        // then
        val events = result.getUncommittedEvents()
        assertEquals(1, events.size)

        val event = events[0] as CreatureUpdated
        assertEquals(creatureId, event.creatureId)
        assertEquals("Hobgoblin", event.name)
        assertEquals(10, event.currentHp)
        assertEquals(12, event.maxHp)
        assertEquals(16, event.initiative)
        assertEquals(17, event.armorClass)
    }

    @Test
    fun `should update creature in internal creatures list`() {
        // given
        val userId = UUID.randomUUID()
        val battle = Battle.create(userId, "Test Battle")
            .addCreature(userId, "Goblin", CreatureType.MONSTER, 7, 7, 14, 15)

        val creatureId = battle.getCreatures()[0].id

        // when
        val result = battle.updateCreature(
            userId = userId,
            creatureId = creatureId,
            name = "Hobgoblin",
            currentHp = 10,
            maxHp = 12,
            initiative = 16,
            armorClass = 17
        )

        // then
        val updated = result.getCreature(creatureId)
        assertNotNull(updated)
        assertEquals("Hobgoblin", updated?.name)
        assertEquals(10, updated?.currentHp)
        assertEquals(12, updated?.maxHp)
        assertEquals(16, updated?.initiative)
        assertEquals(17, updated?.armorClass)
    }

    @Test
    fun `should fail to update non-existent creature`() {
        // given
        val userId = UUID.randomUUID()
        val battle = Battle.create(userId, "Test Battle")
        val nonExistentId = UUID.randomUUID()

        // when/then
        val exception = assertThrows<IllegalArgumentException> {
            battle.updateCreature(
                userId = userId,
                creatureId = nonExistentId,
                name = "Ghost",
                currentHp = 10,
                maxHp = 10,
                initiative = 10,
                armorClass = 10
            )
        }
        assertTrue(exception.message!!.contains("Creature not found") || exception.message!!.contains("not found"))
    }

    @Test
    fun `should validate updated creature attributes`() {
        // given
        val userId = UUID.randomUUID()
        val battle = Battle.create(userId, "Test Battle")
            .addCreature(userId, "Goblin", CreatureType.MONSTER, 7, 7, 14, 15)

        val creatureId = battle.getCreatures()[0].id

        // when/then - invalid currentHp > maxHp
        val exception = assertThrows<IllegalArgumentException> {
            battle.updateCreature(
                userId = userId,
                creatureId = creatureId,
                name = "Goblin",
                currentHp = 15,
                maxHp = 10,
                initiative = 14,
                armorClass = 15
            )
        }
        assertTrue(exception.message!!.contains("Current HP") || exception.message!!.contains("exceed"))
    }

    @Test
    fun `should allow updating creatures during combat`() {
        // given
        val userId = UUID.randomUUID()
        val battle = Battle.create(userId, "Test Battle")
            .addCreature(userId, "Goblin", CreatureType.MONSTER, 7, 7, 14, 15)
            .startCombat(userId)

        val creatureId = battle.getCreatures()[0].id

        // when
        val result = battle.updateCreature(
            userId = userId,
            creatureId = creatureId,
            name = "Wounded Goblin",
            currentHp = 3,
            maxHp = 7,
            initiative = 14,
            armorClass = 15
        )

        // then
        assertEquals(CombatStatus.ACTIVE, result.status)
        assertEquals("Wounded Goblin", result.getCreature(creatureId)?.name)
        assertEquals(3, result.getCreature(creatureId)?.currentHp)
    }

    @Test
    fun `should allow updating multiple creatures`() {
        // given
        val userId = UUID.randomUUID()
        val battle = Battle.create(userId, "Test Battle")
            .addCreature(userId, "Goblin 1", CreatureType.MONSTER, 7, 7, 14, 15)
            .addCreature(userId, "Goblin 2", CreatureType.MONSTER, 7, 7, 14, 15)

        val creature1Id = battle.getCreatures()[0].id
        val creature2Id = battle.getCreatures()[1].id

        // when
        val updated1 = battle.updateCreature(userId, creature1Id, "Goblin A", 5, 7, 14, 15)
        val updated2 = updated1.updateCreature(userId, creature2Id, "Goblin B", 6, 7, 14, 15)

        // then
        assertEquals("Goblin A", updated2.getCreature(creature1Id)?.name)
        assertEquals("Goblin B", updated2.getCreature(creature2Id)?.name)
        assertEquals(5, updated2.getCreature(creature1Id)?.currentHp)
        assertEquals(6, updated2.getCreature(creature2Id)?.currentHp)
    }

    // === T055: Tests for Battle.removeCreature() - User Story 3 ===

    @Test
    fun `should remove creature and emit CreatureRemoved event`() {
        // given
        val userId = UUID.randomUUID()
        val battle = Battle.create(userId, "Test Battle")
            .addCreature(userId, "Goblin", CreatureType.MONSTER, 7, 7, 14, 15)
        battle.markEventsAsCommitted()

        val creatureId = battle.getCreatures()[0].id

        // when
        val result = battle.removeCreature(userId, creatureId)

        // then
        val events = result.getUncommittedEvents()
        assertEquals(1, events.size)

        val event = events[0] as CreatureRemoved
        assertEquals(creatureId, event.creatureId)
        assertEquals(battle.battleId, event.battleId)
    }

    @Test
    fun `should remove creature from internal creatures list`() {
        // given
        val userId = UUID.randomUUID()
        val battle = Battle.create(userId, "Test Battle")
            .addCreature(userId, "Goblin", CreatureType.MONSTER, 7, 7, 14, 15)
            .addCreature(userId, "Fighter", CreatureType.PLAYER, 30, 30, 18, 18)

        val goblinId = battle.getCreatures()[0].id
        assertEquals(2, battle.getCreatures().size)

        // when
        val result = battle.removeCreature(userId, goblinId)

        // then
        assertEquals(1, result.getCreatures().size)
        assertEquals(null, result.getCreature(goblinId))
        assertNotNull(result.getCreatures()[0]) // Fighter still exists
    }

    @Test
    fun `should fail to remove non-existent creature`() {
        // given
        val userId = UUID.randomUUID()
        val battle = Battle.create(userId, "Test Battle")
        val nonExistentId = UUID.randomUUID()

        // when/then
        val exception = assertThrows<IllegalArgumentException> {
            battle.removeCreature(userId, nonExistentId)
        }
        assertTrue(exception.message!!.contains("Creature not found") || exception.message!!.contains("not found"))
    }

    @Test
    fun `should allow removing creatures during combat`() {
        // given
        val userId = UUID.randomUUID()
        val battle = Battle.create(userId, "Test Battle")
            .addCreature(userId, "Goblin", CreatureType.MONSTER, 7, 7, 14, 15)
            .startCombat(userId)

        val creatureId = battle.getCreatures()[0].id

        // when
        val result = battle.removeCreature(userId, creatureId)

        // then
        assertEquals(CombatStatus.ACTIVE, result.status)
        assertEquals(0, result.getCreatures().size)
    }
}

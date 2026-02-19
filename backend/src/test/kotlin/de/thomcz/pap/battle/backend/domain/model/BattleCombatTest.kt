package de.thomcz.pap.battle.backend.domain.model

import de.thomcz.pap.battle.backend.domain.model.events.CreatureDefeated
import de.thomcz.pap.battle.backend.domain.model.events.DamageApplied
import de.thomcz.pap.battle.backend.domain.model.events.TurnAdvanced
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

/**
 * Unit tests for Battle aggregate's combat mechanics.
 * Tests advanceTurn() and applyDamage() methods (User Stories 2-3).
 */
class BattleCombatTest {

    private fun createActiveBattle(): Triple<Battle, UUID, UUID> {
        val userId = UUID.randomUUID()
        val battle = Battle.create(userId, "Combat Test")
            .addCreature(userId, "Fighter", CreatureType.PLAYER, 30, 30, 18, 18)
            .addCreature(userId, "Goblin", CreatureType.MONSTER, 7, 7, 14, 15)
            .addCreature(userId, "Wizard", CreatureType.PLAYER, 20, 20, 12, 12)
            .startCombat(userId)
        battle.markEventsAsCommitted()
        return Triple(battle, userId, battle.getCreatures()[0].id)
    }

    // === advanceTurn() Tests ===

    @Test
    fun `advanceTurn should move to next creature and emit TurnAdvanced`() {
        val (battle, userId, _) = createActiveBattle()
        assertEquals(0, battle.currentTurn)

        val result = battle.advanceTurn(userId)

        val events = result.getUncommittedEvents()
        assertEquals(1, events.size)
        assertTrue(events[0] is TurnAdvanced)

        val event = events[0] as TurnAdvanced
        assertEquals(1, event.newTurn)
        assertEquals(1, event.newRound)
        assertEquals(1, result.currentTurn)
    }

    @Test
    fun `advanceTurn should increment round when wrapping past last creature`() {
        val (battle, userId, _) = createActiveBattle()
        // 3 creatures: advance 3 times to wrap to round 2
        battle.advanceTurn(userId)
        battle.markEventsAsCommitted()
        battle.advanceTurn(userId)
        battle.markEventsAsCommitted()
        val result = battle.advanceTurn(userId)

        val event = result.getUncommittedEvents()[0] as TurnAdvanced
        assertEquals(0, event.newTurn)
        assertEquals(2, event.newRound)
        assertEquals(2, result.round)
    }

    @Test
    fun `advanceTurn should skip defeated creatures`() {
        val (battle, userId, _) = createActiveBattle()
        // Defeat the second creature (Goblin at index 1 after initiative sort)
        val creatures = battle.getCreatures()
        val goblin = creatures.find { it.name == "Goblin" }!!
        battle.applyDamage(userId, goblin.id, 7) // Kill goblin
        battle.markEventsAsCommitted()

        // Advance from index 0 - should skip defeated goblin
        val result = battle.advanceTurn(userId)
        val event = result.getUncommittedEvents()[0] as TurnAdvanced

        // Should skip the defeated creature
        val activeCreature = battle.getCreatures()[event.newTurn]
        assertFalse(activeCreature.isDefeated())
    }

    @Test
    fun `advanceTurn should fail when battle is not ACTIVE`() {
        val userId = UUID.randomUUID()
        val battle = Battle.create(userId, "Test")
            .addCreature(userId, "Fighter", CreatureType.PLAYER, 30, 30, 18, 18)

        assertThrows<IllegalArgumentException> {
            battle.advanceTurn(userId)
        }
    }

    @Test
    fun `advanceTurn should fail when no active creatures remain`() {
        val userId = UUID.randomUUID()
        val battle = Battle.create(userId, "Test")
            .addCreature(userId, "Goblin", CreatureType.MONSTER, 1, 1, 14, 15)
            .startCombat(userId)
        // Defeat the only creature
        battle.applyDamage(userId, battle.getCreatures()[0].id, 1)

        assertThrows<IllegalArgumentException> {
            battle.advanceTurn(userId)
        }
    }

    // === applyDamage() Tests ===

    @Test
    fun `applyDamage should reduce HP and emit DamageApplied event`() {
        val (battle, userId, _) = createActiveBattle()
        val goblin = battle.getCreatures().find { it.name == "Goblin" }!!

        val result = battle.applyDamage(userId, goblin.id, 3)

        val events = result.getUncommittedEvents()
        assertEquals(1, events.size)
        val event = events[0] as DamageApplied
        assertEquals(goblin.id, event.targetCreatureId)
        assertEquals(3, event.damage)
        assertEquals(4, event.remainingHp)

        assertEquals(4, battle.getCreature(goblin.id)!!.currentHp)
    }

    @Test
    fun `applyDamage should cap HP at zero`() {
        val (battle, userId, _) = createActiveBattle()
        val goblin = battle.getCreatures().find { it.name == "Goblin" }!!

        val result = battle.applyDamage(userId, goblin.id, 100) // Overkill

        val event = result.getUncommittedEvents()[0] as DamageApplied
        assertEquals(0, event.remainingHp)
        assertEquals(0, battle.getCreature(goblin.id)!!.currentHp)
    }

    @Test
    fun `applyDamage should emit CreatureDefeated when HP reaches zero`() {
        val (battle, userId, _) = createActiveBattle()
        val goblin = battle.getCreatures().find { it.name == "Goblin" }!!

        val result = battle.applyDamage(userId, goblin.id, 7)

        val events = result.getUncommittedEvents()
        assertEquals(2, events.size)
        assertTrue(events[0] is DamageApplied)
        assertTrue(events[1] is CreatureDefeated)

        val defeated = events[1] as CreatureDefeated
        assertEquals(goblin.id, defeated.creatureId)
        assertEquals("Goblin", defeated.creatureName)
    }

    @Test
    fun `applyDamage should not emit CreatureDefeated when HP remains above zero`() {
        val (battle, userId, _) = createActiveBattle()
        val goblin = battle.getCreatures().find { it.name == "Goblin" }!!

        val result = battle.applyDamage(userId, goblin.id, 3)

        val events = result.getUncommittedEvents()
        assertEquals(1, events.size)
        assertTrue(events[0] is DamageApplied)
    }

    @Test
    fun `applyDamage should store source description`() {
        val (battle, userId, _) = createActiveBattle()
        val goblin = battle.getCreatures().find { it.name == "Goblin" }!!

        battle.applyDamage(userId, goblin.id, 3, "Attack by Fighter")

        val event = battle.getUncommittedEvents()[0] as DamageApplied
        assertEquals("Attack by Fighter", event.source)
    }

    @Test
    fun `applyDamage should fail when battle is not ACTIVE`() {
        val userId = UUID.randomUUID()
        val battle = Battle.create(userId, "Test")
            .addCreature(userId, "Fighter", CreatureType.PLAYER, 30, 30, 18, 18)
        val creatureId = battle.getCreatures()[0].id

        assertThrows<IllegalArgumentException> {
            battle.applyDamage(userId, creatureId, 5)
        }
    }

    @Test
    fun `applyDamage should fail with zero damage`() {
        val (battle, userId, _) = createActiveBattle()
        val goblin = battle.getCreatures().find { it.name == "Goblin" }!!

        assertThrows<IllegalArgumentException> {
            battle.applyDamage(userId, goblin.id, 0)
        }
    }

    @Test
    fun `applyDamage should fail with negative damage`() {
        val (battle, userId, _) = createActiveBattle()
        val goblin = battle.getCreatures().find { it.name == "Goblin" }!!

        assertThrows<IllegalArgumentException> {
            battle.applyDamage(userId, goblin.id, -5)
        }
    }

    @Test
    fun `applyDamage should fail for non-existent creature`() {
        val (battle, userId, _) = createActiveBattle()

        assertThrows<IllegalArgumentException> {
            battle.applyDamage(userId, UUID.randomUUID(), 5)
        }
    }

    @Test
    fun `applyDamage should fail for already defeated creature`() {
        val (battle, userId, _) = createActiveBattle()
        val goblin = battle.getCreatures().find { it.name == "Goblin" }!!

        // Defeat goblin first
        battle.applyDamage(userId, goblin.id, 7)
        battle.markEventsAsCommitted()

        // Try to damage again
        assertThrows<IllegalArgumentException> {
            battle.applyDamage(userId, goblin.id, 5)
        }
    }

    // === Event Replay Tests ===

    @Test
    fun `should correctly reconstruct state from combat events`() {
        val (battle, userId, _) = createActiveBattle()
        val goblin = battle.getCreatures().find { it.name == "Goblin" }!!

        // Apply damage and advance turn
        battle.applyDamage(userId, goblin.id, 3)
        battle.advanceTurn(userId)

        // Collect all events (including from creation)
        val allEvents = battle.getUncommittedEvents()

        // Replay on fresh instance
        val replayed = Battle.newInstance()
        // We need all events including creation, so let's build from scratch
        val fullBattle = Battle.create(userId, "Combat Test")
        fullBattle.addCreature(userId, "Fighter", CreatureType.PLAYER, 30, 30, 18, 18)
        fullBattle.addCreature(userId, "Goblin", CreatureType.MONSTER, 7, 7, 14, 15)
        fullBattle.addCreature(userId, "Wizard", CreatureType.PLAYER, 20, 20, 12, 12)
        fullBattle.startCombat(userId)
        fullBattle.applyDamage(userId, fullBattle.getCreatures().find { it.name == "Goblin" }!!.id, 3)
        fullBattle.advanceTurn(userId)
        val events = fullBattle.getUncommittedEvents()

        val reconstructed = Battle.newInstance().loadFromHistory(events)

        assertEquals(CombatStatus.ACTIVE, reconstructed.status)
        assertEquals(4, reconstructed.getCreatures().find { it.name == "Goblin" }?.currentHp)
        assertEquals(1, reconstructed.currentTurn)
    }
}

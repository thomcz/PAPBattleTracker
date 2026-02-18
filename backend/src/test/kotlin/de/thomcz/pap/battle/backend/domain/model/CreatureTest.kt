package de.thomcz.pap.battle.backend.domain.model

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

/**
 * Unit tests for Creature value object.
 *
 * Tests validation rules and behavior methods following TDD approach.
 * Domain coverage target: 100% per constitution requirements.
 */
class CreatureTest {

    // === Validation Tests ===

    @Test
    fun `should create valid creature with all required attributes`() {
        // given
        val id = UUID.randomUUID()
        val name = "Goblin"
        val type = CreatureType.MONSTER
        val currentHp = 7
        val maxHp = 7
        val initiative = 14
        val armorClass = 15

        // when
        val creature = Creature(
            id = id,
            name = name,
            type = type,
            currentHp = currentHp,
            maxHp = maxHp,
            initiative = initiative,
            armorClass = armorClass
        )

        // then
        assertEquals(id, creature.id)
        assertEquals(name, creature.name)
        assertEquals(type, creature.type)
        assertEquals(currentHp, creature.currentHp)
        assertEquals(maxHp, creature.maxHp)
        assertEquals(initiative, creature.initiative)
        assertEquals(armorClass, creature.armorClass)
        assertTrue(creature.statusEffects.isEmpty())
    }

    @Test
    fun `should fail when name is blank`() {
        // when/then
        val exception = assertThrows<IllegalArgumentException> {
            Creature(
                id = UUID.randomUUID(),
                name = "",
                type = CreatureType.PLAYER,
                currentHp = 10,
                maxHp = 10,
                initiative = 0,
                armorClass = 10
            )
        }
        assertTrue(exception.message!!.contains("name cannot be blank"))
    }

    @Test
    fun `should fail when name is only whitespace`() {
        // when/then
        val exception = assertThrows<IllegalArgumentException> {
            Creature(
                id = UUID.randomUUID(),
                name = "   ",
                type = CreatureType.PLAYER,
                currentHp = 10,
                maxHp = 10,
                initiative = 0,
                armorClass = 10
            )
        }
        assertTrue(exception.message!!.contains("name cannot be blank"))
    }

    @Test
    fun `should fail when max HP is zero`() {
        // when/then
        val exception = assertThrows<IllegalArgumentException> {
            Creature(
                id = UUID.randomUUID(),
                name = "Fighter",
                type = CreatureType.PLAYER,
                currentHp = 0,
                maxHp = 0,
                initiative = 10,
                armorClass = 18
            )
        }
        assertTrue(exception.message!!.contains("Max HP must be positive"))
    }

    @Test
    fun `should fail when max HP is negative`() {
        // when/then
        val exception = assertThrows<IllegalArgumentException> {
            Creature(
                id = UUID.randomUUID(),
                name = "Fighter",
                type = CreatureType.PLAYER,
                currentHp = 0,
                maxHp = -5,
                initiative = 10,
                armorClass = 18
            )
        }
        assertTrue(exception.message!!.contains("Max HP must be positive"))
    }

    @Test
    fun `should fail when current HP is negative`() {
        // when/then
        val exception = assertThrows<IllegalArgumentException> {
            Creature(
                id = UUID.randomUUID(),
                name = "Goblin",
                type = CreatureType.MONSTER,
                currentHp = -3,
                maxHp = 7,
                initiative = 14,
                armorClass = 15
            )
        }
        assertTrue(exception.message!!.contains("Current HP cannot be negative"))
    }

    @Test
    fun `should fail when current HP exceeds max HP`() {
        // when/then
        val exception = assertThrows<IllegalArgumentException> {
            Creature(
                id = UUID.randomUUID(),
                name = "Goblin",
                type = CreatureType.MONSTER,
                currentHp = 10,
                maxHp = 7,
                initiative = 14,
                armorClass = 15
            )
        }
        assertTrue(exception.message!!.contains("Current HP") && exception.message!!.contains("exceed max HP"))
    }

    @Test
    fun `should fail when armor class is negative`() {
        // when/then
        val exception = assertThrows<IllegalArgumentException> {
            Creature(
                id = UUID.randomUUID(),
                name = "Goblin",
                type = CreatureType.MONSTER,
                currentHp = 7,
                maxHp = 7,
                initiative = 14,
                armorClass = -1
            )
        }
        assertTrue(exception.message!!.contains("Armor class cannot be negative"))
    }

    @Test
    fun `should allow negative initiative values`() {
        // given/when
        val creature = Creature(
            id = UUID.randomUUID(),
            name = "Slow Goblin",
            type = CreatureType.MONSTER,
            currentHp = 5,
            maxHp = 5,
            initiative = -2,
            armorClass = 12
        )

        // then
        assertEquals(-2, creature.initiative)
    }

    @Test
    fun `should allow current HP to be zero`() {
        // given/when
        val creature = Creature(
            id = UUID.randomUUID(),
            name = "Defeated Goblin",
            type = CreatureType.MONSTER,
            currentHp = 0,
            maxHp = 7,
            initiative = 14,
            armorClass = 15
        )

        // then
        assertEquals(0, creature.currentHp)
    }

    // === Behavior Tests ===

    @Test
    fun `should return true for isDefeated when current HP is zero`() {
        // given
        val creature = Creature(
            id = UUID.randomUUID(),
            name = "Defeated Goblin",
            type = CreatureType.MONSTER,
            currentHp = 0,
            maxHp = 7,
            initiative = 14,
            armorClass = 15
        )

        // when/then
        assertTrue(creature.isDefeated())
    }

    @Test
    fun `should return false for isDefeated when current HP is above zero`() {
        // given
        val creature = Creature(
            id = UUID.randomUUID(),
            name = "Healthy Goblin",
            type = CreatureType.MONSTER,
            currentHp = 5,
            maxHp = 7,
            initiative = 14,
            armorClass = 15
        )

        // when/then
        assertFalse(creature.isDefeated())
    }

    @Test
    fun `takeDamage should reduce current HP`() {
        // given
        val creature = Creature(
            id = UUID.randomUUID(),
            name = "Goblin",
            type = CreatureType.MONSTER,
            currentHp = 7,
            maxHp = 7,
            initiative = 14,
            armorClass = 15
        )

        // when
        val damaged = creature.takeDamage(3)

        // then
        assertEquals(4, damaged.currentHp)
        assertEquals(7, damaged.maxHp)
    }

    @Test
    fun `takeDamage should cap HP at zero`() {
        // given
        val creature = Creature(
            id = UUID.randomUUID(),
            name = "Goblin",
            type = CreatureType.MONSTER,
            currentHp = 5,
            maxHp = 7,
            initiative = 14,
            armorClass = 15
        )

        // when
        val defeated = creature.takeDamage(10)

        // then
        assertEquals(0, defeated.currentHp)
        assertTrue(defeated.isDefeated())
    }

    @Test
    fun `takeDamage should fail with negative damage`() {
        // given
        val creature = Creature(
            id = UUID.randomUUID(),
            name = "Goblin",
            type = CreatureType.MONSTER,
            currentHp = 7,
            maxHp = 7,
            initiative = 14,
            armorClass = 15
        )

        // when/then
        val exception = assertThrows<IllegalArgumentException> {
            creature.takeDamage(-5)
        }
        assertTrue(exception.message!!.contains("Damage amount cannot be negative"))
    }

    @Test
    fun `heal should increase current HP`() {
        // given
        val creature = Creature(
            id = UUID.randomUUID(),
            name = "Wounded Goblin",
            type = CreatureType.MONSTER,
            currentHp = 3,
            maxHp = 7,
            initiative = 14,
            armorClass = 15
        )

        // when
        val healed = creature.heal(2)

        // then
        assertEquals(5, healed.currentHp)
    }

    @Test
    fun `heal should cap HP at max HP`() {
        // given
        val creature = Creature(
            id = UUID.randomUUID(),
            name = "Wounded Goblin",
            type = CreatureType.MONSTER,
            currentHp = 3,
            maxHp = 7,
            initiative = 14,
            armorClass = 15
        )

        // when
        val healed = creature.heal(10)

        // then
        assertEquals(7, healed.currentHp)
    }

    @Test
    fun `heal should revive defeated creature`() {
        // given
        val creature = Creature(
            id = UUID.randomUUID(),
            name = "Defeated Goblin",
            type = CreatureType.MONSTER,
            currentHp = 0,
            maxHp = 7,
            initiative = 14,
            armorClass = 15
        )

        // when
        val revived = creature.heal(1)

        // then
        assertEquals(1, revived.currentHp)
        assertFalse(revived.isDefeated())
    }

    @Test
    fun `heal should fail with negative healing`() {
        // given
        val creature = Creature(
            id = UUID.randomUUID(),
            name = "Goblin",
            type = CreatureType.MONSTER,
            currentHp = 5,
            maxHp = 7,
            initiative = 14,
            armorClass = 15
        )

        // when/then
        val exception = assertThrows<IllegalArgumentException> {
            creature.heal(-3)
        }
        assertTrue(exception.message!!.contains("Healing amount cannot be negative"))
    }

    @Test
    fun `addEffect should add status effect to list`() {
        // given
        val creature = Creature(
            id = UUID.randomUUID(),
            name = "Goblin",
            type = CreatureType.MONSTER,
            currentHp = 7,
            maxHp = 7,
            initiative = 14,
            armorClass = 15
        )

        // when
        val poisoned = creature.addEffect("poisoned")

        // then
        assertEquals(1, poisoned.statusEffects.size)
        assertTrue(poisoned.statusEffects.contains("poisoned"))
    }

    @Test
    fun `addEffect should allow multiple effects`() {
        // given
        val creature = Creature(
            id = UUID.randomUUID(),
            name = "Goblin",
            type = CreatureType.MONSTER,
            currentHp = 7,
            maxHp = 7,
            initiative = 14,
            armorClass = 15
        )

        // when
        val withEffects = creature
            .addEffect("poisoned")
            .addEffect("prone")
            .addEffect("stunned")

        // then
        assertEquals(3, withEffects.statusEffects.size)
        assertTrue(withEffects.statusEffects.containsAll(listOf("poisoned", "prone", "stunned")))
    }

    @Test
    fun `addEffect should fail with blank effect`() {
        // given
        val creature = Creature(
            id = UUID.randomUUID(),
            name = "Goblin",
            type = CreatureType.MONSTER,
            currentHp = 7,
            maxHp = 7,
            initiative = 14,
            armorClass = 15
        )

        // when/then
        val exception = assertThrows<IllegalArgumentException> {
            creature.addEffect("")
        }
        assertTrue(exception.message!!.contains("Status effect cannot be blank"))
    }

    @Test
    fun `removeEffect should remove status effect from list`() {
        // given
        val creature = Creature(
            id = UUID.randomUUID(),
            name = "Goblin",
            type = CreatureType.MONSTER,
            currentHp = 7,
            maxHp = 7,
            initiative = 14,
            armorClass = 15,
            statusEffects = listOf("poisoned", "prone")
        )

        // when
        val withoutProne = creature.removeEffect("prone")

        // then
        assertEquals(1, withoutProne.statusEffects.size)
        assertTrue(withoutProne.statusEffects.contains("poisoned"))
        assertFalse(withoutProne.statusEffects.contains("prone"))
    }

    @Test
    fun `removeEffect should handle non-existent effect gracefully`() {
        // given
        val creature = Creature(
            id = UUID.randomUUID(),
            name = "Goblin",
            type = CreatureType.MONSTER,
            currentHp = 7,
            maxHp = 7,
            initiative = 14,
            armorClass = 15,
            statusEffects = listOf("poisoned")
        )

        // when
        val result = creature.removeEffect("stunned")

        // then
        assertEquals(1, result.statusEffects.size)
        assertTrue(result.statusEffects.contains("poisoned"))
    }

    @Test
    fun `clearEffects should remove all status effects`() {
        // given
        val creature = Creature(
            id = UUID.randomUUID(),
            name = "Goblin",
            type = CreatureType.MONSTER,
            currentHp = 7,
            maxHp = 7,
            initiative = 14,
            armorClass = 15,
            statusEffects = listOf("poisoned", "prone", "stunned", "blessed")
        )

        // when
        val cleared = creature.clearEffects()

        // then
        assertTrue(cleared.statusEffects.isEmpty())
    }

    @Test
    fun `creature should be immutable - modifications create new instances`() {
        // given
        val original = Creature(
            id = UUID.randomUUID(),
            name = "Goblin",
            type = CreatureType.MONSTER,
            currentHp = 7,
            maxHp = 7,
            initiative = 14,
            armorClass = 15
        )

        // when
        val damaged = original.takeDamage(3)
        val healed = damaged.heal(1)
        val withEffect = healed.addEffect("poisoned")

        // then - original unchanged
        assertEquals(7, original.currentHp)
        assertTrue(original.statusEffects.isEmpty())

        // and modifications created new instances
        assertEquals(4, damaged.currentHp)
        assertEquals(5, healed.currentHp)
        assertEquals(1, withEffect.statusEffects.size)
    }
}

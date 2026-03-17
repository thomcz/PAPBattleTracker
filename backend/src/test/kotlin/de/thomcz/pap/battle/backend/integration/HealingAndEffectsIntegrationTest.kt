package de.thomcz.pap.battle.backend.integration

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus

/**
 * Integration tests for healing and status effect endpoints:
 * - POST /api/battles/{id}/heal
 * - POST /api/battles/{id}/creatures/{creatureId}/effects
 */
class HealingAndEffectsIntegrationTest : BaseIntegrationTest() {

    // === Helpers ===

    private fun createBattle(token: String, name: String): String {
        val response = authenticatedPost("/api/battles", token, mapOf("name" to name), Map::class.java)
        return (response.body as Map<*, *>)["id"] as String
    }

    private fun addCreature(
        token: String, battleId: String,
        name: String = "Fighter", type: String = "PLAYER",
        currentHp: Int = 20, maxHp: Int = 40,
        initiative: Int = 10, armorClass: Int = 14
    ): String {
        val request = mapOf(
            "name" to name, "type" to type,
            "currentHp" to currentHp, "maxHp" to maxHp,
            "initiative" to initiative, "armorClass" to armorClass
        )
        val response = authenticatedPost("/api/battles/$battleId/creatures", token, request, Map::class.java)
        return (response.body as Map<*, *>)["id"] as String
    }

    private fun startCombat(token: String, battleId: String) {
        authenticatedPost("/api/battles/$battleId/start", token, null, Map::class.java)
    }

    // === Healing tests ===

    @Test
    fun `should heal creature and return 200 with updated HP`() {
        val token = createAuthenticatedUser()
        val battleId = createBattle(token, "Heal Test")
        val creatureId = addCreature(token, battleId, currentHp = 10, maxHp = 40)
        startCombat(token, battleId)

        val response = authenticatedPost(
            "/api/battles/$battleId/heal",
            token,
            mapOf("creatureId" to creatureId, "healing" to 15),
            Map::class.java
        )

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        val creatures = (response.body as Map<*, *>)["creatures"] as List<*>
        val creature = creatures.first { (it as Map<*, *>)["id"] == creatureId } as Map<*, *>
        assertThat(creature["currentHp"]).isEqualTo(25)
    }

    @Test
    fun `should cap healing at maxHp`() {
        val token = createAuthenticatedUser()
        val battleId = createBattle(token, "Cap Heal Test")
        val creatureId = addCreature(token, battleId, currentHp = 35, maxHp = 40)
        startCombat(token, battleId)

        authenticatedPost(
            "/api/battles/$battleId/heal",
            token,
            mapOf("creatureId" to creatureId, "healing" to 999),
            Map::class.java
        )

        val battleResponse = authenticatedGet("/api/battles/$battleId", token, Map::class.java)
        val creatures = (battleResponse.body as Map<*, *>)["creatures"] as List<*>
        val creature = creatures.first { (it as Map<*, *>)["id"] == creatureId } as Map<*, *>
        assertThat(creature["currentHp"]).isEqualTo(40)
    }

    @Test
    fun `should return 409 when healing non-active battle`() {
        val token = createAuthenticatedUser()
        val battleId = createBattle(token, "Not Active")
        val creatureId = addCreature(token, battleId)

        val response = authenticatedPost(
            "/api/battles/$battleId/heal",
            token,
            mapOf("creatureId" to creatureId, "healing" to 5),
            Map::class.java
        )

        assertThat(response.statusCode).isEqualTo(HttpStatus.CONFLICT)
    }

    @Test
    fun `should return 400 when healing amount is less than 1`() {
        val token = createAuthenticatedUser()
        val battleId = createBattle(token, "Bad Heal")
        val creatureId = addCreature(token, battleId)
        startCombat(token, battleId)

        val response = authenticatedPost(
            "/api/battles/$battleId/heal",
            token,
            mapOf("creatureId" to creatureId, "healing" to 0),
            Map::class.java
        )

        assertThat(response.statusCode).isEqualTo(HttpStatus.BAD_REQUEST)
    }

    @Test
    fun `should return 409 when healing creature not found`() {
        val token = createAuthenticatedUser()
        val battleId = createBattle(token, "Not Found")
        addCreature(token, battleId)
        startCombat(token, battleId)

        val response = authenticatedPost(
            "/api/battles/$battleId/heal",
            token,
            mapOf("creatureId" to "00000000-0000-0000-0000-000000000000", "healing" to 5),
            Map::class.java
        )

        assertThat(response.statusCode).isIn(HttpStatus.NOT_FOUND, HttpStatus.CONFLICT)
    }

    // === Status effects tests ===

    @Test
    fun `should add status effect to creature`() {
        val token = createAuthenticatedUser()
        val battleId = createBattle(token, "Effect Test")
        val creatureId = addCreature(token, battleId)
        startCombat(token, battleId)

        val response = authenticatedPost(
            "/api/battles/$battleId/creatures/$creatureId/effects",
            token,
            mapOf("effect" to "Poisoned", "action" to "ADD"),
            Map::class.java
        )

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        val creatures = (response.body as Map<*, *>)["creatures"] as List<*>
        val creature = creatures.first { (it as Map<*, *>)["id"] == creatureId } as Map<*, *>
        @Suppress("UNCHECKED_CAST")
        val effects = creature["statusEffects"] as List<String>
        assertThat(effects).contains("Poisoned")
    }

    @Test
    fun `should remove status effect from creature`() {
        val token = createAuthenticatedUser()
        val battleId = createBattle(token, "Remove Effect Test")
        val creatureId = addCreature(token, battleId)
        startCombat(token, battleId)

        // Add then remove
        authenticatedPost(
            "/api/battles/$battleId/creatures/$creatureId/effects",
            token,
            mapOf("effect" to "Stunned", "action" to "ADD"),
            Map::class.java
        )
        val response = authenticatedPost(
            "/api/battles/$battleId/creatures/$creatureId/effects",
            token,
            mapOf("effect" to "Stunned", "action" to "REMOVE"),
            Map::class.java
        )

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        val creatures = (response.body as Map<*, *>)["creatures"] as List<*>
        val creature = creatures.first { (it as Map<*, *>)["id"] == creatureId } as Map<*, *>
        @Suppress("UNCHECKED_CAST")
        val effects = creature["statusEffects"] as List<String>
        assertThat(effects).doesNotContain("Stunned")
    }

    @Test
    fun `should return 409 when applying effect to non-active battle`() {
        val token = createAuthenticatedUser()
        val battleId = createBattle(token, "Non Active Effect")
        val creatureId = addCreature(token, battleId)

        val response = authenticatedPost(
            "/api/battles/$battleId/creatures/$creatureId/effects",
            token,
            mapOf("effect" to "Blessed", "action" to "ADD"),
            Map::class.java
        )

        assertThat(response.statusCode).isEqualTo(HttpStatus.CONFLICT)
    }
}

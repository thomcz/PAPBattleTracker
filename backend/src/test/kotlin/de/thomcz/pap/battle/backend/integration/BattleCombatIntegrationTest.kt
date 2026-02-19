package de.thomcz.pap.battle.backend.integration

import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.http.HttpStatus

/**
 * Integration tests for combat mechanics endpoints:
 * - POST /api/battles/{id}/turn (advance turn)
 * - POST /api/battles/{id}/damage (apply damage)
 * - GET /api/battles/{id}/log (combat log)
 */
class BattleCombatIntegrationTest : BaseIntegrationTest() {

    private fun createBattleWithCreatures(token: String): String {
        // Create battle
        val battleId = createBattle(token, "Combat Test")

        // Add creatures
        addCreature(token, battleId, "Fighter", "PLAYER", 30, 30, 18, 18)
        addCreature(token, battleId, "Goblin", "MONSTER", 7, 7, 14, 15)

        // Start combat
        authenticatedPost("/api/battles/$battleId/start", token, null, Map::class.java)

        return battleId
    }

    @Test
    fun `should advance turn successfully`() {
        val token = createAuthenticatedUser()
        val battleId = createBattleWithCreatures(token)

        val response = authenticatedPost(
            "/api/battles/$battleId/turn",
            token,
            null,
            Map::class.java
        )

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        val body = response.body as Map<*, *>
        assertThat(body["currentTurn"]).isEqualTo(1)
        assertThat(body["round"]).isEqualTo(1)
    }

    @Test
    fun `should increment round after all creatures act`() {
        val token = createAuthenticatedUser()
        val battleId = createBattleWithCreatures(token)

        // Advance twice (2 creatures)
        authenticatedPost("/api/battles/$battleId/turn", token, null, Map::class.java)
        val response = authenticatedPost(
            "/api/battles/$battleId/turn",
            token,
            null,
            Map::class.java
        )

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        val body = response.body as Map<*, *>
        assertThat(body["round"]).isEqualTo(2)
    }

    @Test
    fun `should apply damage to creature`() {
        val token = createAuthenticatedUser()
        val battleId = createBattleWithCreatures(token)

        // Get creatures to find IDs
        val battleState = getBattle(token, battleId)
        val creatures = battleState["creatures"] as List<*>
        val goblin = creatures.find { (it as Map<*, *>)["name"] == "Goblin" } as Map<*, *>
        val goblinId = goblin["id"] as String

        val damageRequest = mapOf(
            "creatureId" to goblinId,
            "damage" to 3,
            "source" to "Attack by Fighter"
        )

        val response = authenticatedPost(
            "/api/battles/$battleId/damage",
            token,
            damageRequest,
            Map::class.java
        )

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        val body = response.body as Map<*, *>
        val updatedCreatures = body["creatures"] as List<*>
        val updatedGoblin = updatedCreatures.find { (it as Map<*, *>)["name"] == "Goblin" } as Map<*, *>
        assertThat(updatedGoblin["currentHp"]).isEqualTo(4)
    }

    @Test
    fun `should mark creature as defeated when HP reaches zero`() {
        val token = createAuthenticatedUser()
        val battleId = createBattleWithCreatures(token)

        val battleState = getBattle(token, battleId)
        val creatures = battleState["creatures"] as List<*>
        val goblin = creatures.find { (it as Map<*, *>)["name"] == "Goblin" } as Map<*, *>
        val goblinId = goblin["id"] as String

        val damageRequest = mapOf(
            "creatureId" to goblinId,
            "damage" to 7
        )

        val response = authenticatedPost(
            "/api/battles/$battleId/damage",
            token,
            damageRequest,
            Map::class.java
        )

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        val body = response.body as Map<*, *>
        val updatedCreatures = body["creatures"] as List<*>
        val defeatedGoblin = updatedCreatures.find { (it as Map<*, *>)["name"] == "Goblin" } as Map<*, *>
        assertThat(defeatedGoblin["currentHp"]).isEqualTo(0)
        assertThat(defeatedGoblin["isDefeated"]).isEqualTo(true)
    }

    @Test
    fun `should return combat log entries`() {
        val token = createAuthenticatedUser()
        val battleId = createBattleWithCreatures(token)

        // Apply some damage to generate log entries
        val battleState = getBattle(token, battleId)
        val creatures = battleState["creatures"] as List<*>
        val goblin = creatures.find { (it as Map<*, *>)["name"] == "Goblin" } as Map<*, *>
        val goblinId = goblin["id"] as String

        authenticatedPost(
            "/api/battles/$battleId/damage",
            token,
            mapOf("creatureId" to goblinId, "damage" to 3),
            Map::class.java
        )

        val response = authenticatedGet(
            "/api/battles/$battleId/log",
            token,
            Map::class.java
        )

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        val body = response.body as Map<*, *>
        assertThat(body["entries"]).isNotNull()
        val entries = body["entries"] as List<*>
        // At minimum: CombatStarted + DamageApplied = 2 entries
        assertThat(entries.size).isGreaterThanOrEqualTo(2)
        assertThat(body["total"]).isNotNull()
    }

    @Test
    fun `should return 409 when advancing turn on non-active battle`() {
        val token = createAuthenticatedUser()
        val battleId = createBattle(token, "Not Started Battle")

        val response = authenticatedPost(
            "/api/battles/$battleId/turn",
            token,
            null,
            Map::class.java
        )

        assertThat(response.statusCode).isEqualTo(HttpStatus.CONFLICT)
    }

    @Test
    fun `should return 409 when applying damage to non-active battle`() {
        val token = createAuthenticatedUser()
        val battleId = createBattle(token, "Not Started Battle")
        addCreature(token, battleId, "Fighter", "PLAYER", 30, 30, 18, 18)

        val creatureId = (getBattle(token, battleId)["creatures"] as List<*>)
            .let { (it[0] as Map<*, *>)["id"] as String }

        val response = authenticatedPost(
            "/api/battles/$battleId/damage",
            token,
            mapOf("creatureId" to creatureId, "damage" to 5),
            Map::class.java
        )

        assertThat(response.statusCode).isEqualTo(HttpStatus.CONFLICT)
    }

    // === Helpers ===

    private fun createBattle(token: String, name: String): String {
        val request = mapOf("name" to name)
        val response = authenticatedPost("/api/battles", token, request, Map::class.java)
        return (response.body as Map<*, *>)["id"] as String
    }

    private fun addCreature(
        token: String, battleId: String,
        name: String, type: String,
        currentHp: Int, maxHp: Int,
        initiative: Int, armorClass: Int
    ) {
        val request = mapOf(
            "name" to name,
            "type" to type,
            "currentHp" to currentHp,
            "maxHp" to maxHp,
            "initiative" to initiative,
            "armorClass" to armorClass
        )
        authenticatedPost("/api/battles/$battleId/creatures", token, request, Map::class.java)
    }

    private fun getBattle(token: String, battleId: String): Map<*, *> {
        val response = authenticatedGet("/api/battles/$battleId", token, Map::class.java)
        return response.body as Map<*, *>
    }
}

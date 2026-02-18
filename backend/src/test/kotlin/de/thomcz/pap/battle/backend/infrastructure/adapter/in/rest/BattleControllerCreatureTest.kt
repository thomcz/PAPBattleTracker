package de.thomcz.pap.battle.backend.infrastructure.adapter.`in`.rest

import com.fasterxml.jackson.databind.ObjectMapper
import de.thomcz.pap.battle.backend.application.dto.CreateCreatureRequest
import de.thomcz.pap.battle.backend.domain.model.CreatureType
import de.thomcz.pap.battle.backend.infrastructure.adapter.out.security.JwtTokenProvider
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

/**
 * Integration tests for creature management REST endpoints.
 * Tests POST /api/battles/{id}/creatures (User Story 1).
 */
@SpringBootTest
@AutoConfigureMockMvc
class BattleControllerCreatureTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var jwtTokenProvider: JwtTokenProvider

    @Test
    fun `should add creature to battle via REST API`() {
        // given - create battle first
        val token = jwtTokenProvider.generateToken("testuser")
        val battleJson = """{"name": "Test Battle"}"""

        val battleResponse = mockMvc.perform(
            post("/api/battles")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(battleJson)
        ).andReturn().response.contentAsString

        val battleId = objectMapper.readTree(battleResponse).get("id").asText()

        // when - add creature
        val request = CreateCreatureRequest(
            name = "Goblin",
            type = CreatureType.MONSTER,
            currentHp = 7,
            maxHp = 7,
            initiative = 14,
            armorClass = 15
        )

        // then
        mockMvc.perform(
            post("/api/battles/$battleId/creatures")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.name").value("Goblin"))
            .andExpect(jsonPath("$.type").value("MONSTER"))
            .andExpect(jsonPath("$.currentHp").value(7))
            .andExpect(jsonPath("$.maxHp").value(7))
            .andExpect(jsonPath("$.initiative").value(14))
            .andExpect(jsonPath("$.armorClass").value(15))
            .andExpect(jsonPath("$.statusEffects").isEmpty)
    }

    @Test
    fun `should return 400 for invalid creature data`() {
        // given - create battle first
        val token = jwtTokenProvider.generateToken("testuser")
        val battleJson = """{"name": "Test Battle"}"""

        val battleResponse = mockMvc.perform(
            post("/api/battles")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(battleJson)
        ).andReturn().response.contentAsString

        val battleId = objectMapper.readTree(battleResponse).get("id").asText()

        // when - invalid creature (blank name)
        val invalidRequest = CreateCreatureRequest(
            name = "",
            type = CreatureType.MONSTER,
            currentHp = 7,
            maxHp = 7,
            initiative = 14,
            armorClass = 15
        )

        // then
        mockMvc.perform(
            post("/api/battles/$battleId/creatures")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest))
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should return 404 for non-existent battle`() {
        // given
        val token = jwtTokenProvider.generateToken("testuser")
        val nonExistentBattleId = "00000000-0000-0000-0000-000000000000"

        val request = CreateCreatureRequest(
            name = "Goblin",
            type = CreatureType.MONSTER,
            currentHp = 7,
            maxHp = 7,
            initiative = 14,
            armorClass = 15
        )

        // when/then
        mockMvc.perform(
            post("/api/battles/$nonExistentBattleId/creatures")
                .header("Authorization", "Bearer $token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isNotFound)
    }

    @Test
    fun `should return 401 when not authenticated`() {
        // given
        val battleId = "some-battle-id"
        val request = CreateCreatureRequest(
            name = "Goblin",
            type = CreatureType.MONSTER,
            currentHp = 7,
            maxHp = 7,
            initiative = 14,
            armorClass = 15
        )

        // when/then
        mockMvc.perform(
            post("/api/battles/$battleId/creatures")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun `should return 403 when user does not own battle`() {
        // given - user1 creates battle
        val user1Token = jwtTokenProvider.generateToken("user1")
        val battleJson = """{"name": "User1 Battle"}"""

        val battleResponse = mockMvc.perform(
            post("/api/battles")
                .header("Authorization", "Bearer $user1Token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(battleJson)
        ).andReturn().response.contentAsString

        val battleId = objectMapper.readTree(battleResponse).get("id").asText()

        // when - user2 tries to add creature to user1's battle
        val user2Token = jwtTokenProvider.generateToken("user2")
        val request = CreateCreatureRequest(
            name = "Goblin",
            type = CreatureType.MONSTER,
            currentHp = 7,
            maxHp = 7,
            initiative = 14,
            armorClass = 15
        )

        // then
        mockMvc.perform(
            post("/api/battles/$battleId/creatures")
                .header("Authorization", "Bearer $user2Token")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isForbidden)
    }
}

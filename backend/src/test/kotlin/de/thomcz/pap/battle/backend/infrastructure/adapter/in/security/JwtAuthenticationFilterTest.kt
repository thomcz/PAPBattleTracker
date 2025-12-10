package de.thomcz.pap.battle.backend.infrastructure.adapter.`in`.security

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class SampleController {
    @GetMapping("/api/auth/")
    fun authenticationEndpoint() {
    }

    @GetMapping("/api/other/")
    fun anotherEndpoint() {
    }
}

@WebMvcTest(SampleController::class)
class JwtAuthenticationFilterTest {

    @Autowired
    lateinit var mockMvc: MockMvc

    @Test
    fun `should not filter requests to authentication endpoints`() {

        mockMvc.perform(get("/api/auth/"))
            .andExpect {
                status().isOk
            }

    }
}
package de.thomcz.pap.battle.backend.infrastructure.adapter.`in`.rest

import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/session")
class SessionController {
    @PostMapping("/session")
    fun createSession(): String {
        return "pong"
    }
}
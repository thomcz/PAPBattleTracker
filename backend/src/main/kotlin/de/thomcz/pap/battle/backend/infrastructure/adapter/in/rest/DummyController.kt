package de.thomcz.pap.battle.backend.infrastructure.adapter.`in`.rest

import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/dummy")
class DummyController {
    @PostMapping("/ping")
    fun ping(): String {
        return "pong"
    }
}
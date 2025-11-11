package de.thomcz.pap.battle.backend.infrastructure.adapter.`in`.rest

import de.thomcz.pap.battle.backend.application.dto.AuthenticateUserCommand
import de.thomcz.pap.battle.backend.application.dto.RegisterUserCommand
import de.thomcz.pap.battle.backend.domain.port.`in`.AuthenticationUseCase
import de.thomcz.pap.battle.backend.domain.port.`in`.RegisterUseCase
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/auth")
class AuthenticationController(
    val registerUseCase: RegisterUseCase,
    val authenticationUseCase: AuthenticationUseCase
) {

    @PostMapping("/register")
    fun register(@RequestBody request: RegisterRequest): ResponseEntity<*> {

        val command = registerUseCase.execute(
            RegisterUserCommand(
                request.userName,
                request.email,
                request.password
            )
        )
        return ResponseEntity.ok(
            AuthResponse(
                token = command.token,
                userName = command.user.userName,
                email = command.user.email
            )
        )
    }

    @PostMapping("/login")
    fun login(@RequestBody request: LoginRequest): ResponseEntity<*> {
        val command = authenticationUseCase.execute(
            AuthenticateUserCommand(
                request.userName,
                request.password
            )
        )
        return ResponseEntity.ok(
            AuthResponse(
                token = command.token,
                userName = command.user.userName,
                email = command.user.email
            )
        )
    }
}

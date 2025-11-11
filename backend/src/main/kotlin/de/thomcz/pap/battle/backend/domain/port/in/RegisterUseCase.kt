package de.thomcz.pap.battle.backend.domain.port.`in`

import de.thomcz.pap.battle.backend.application.dto.RegisterUserCommand
import de.thomcz.pap.battle.backend.domain.model.AuthenticationResult

interface RegisterUseCase {
    fun execute(command: RegisterUserCommand): AuthenticationResult
}
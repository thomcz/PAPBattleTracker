package de.thomcz.pap.battle.backend.domain.port.`in`

import de.thomcz.pap.battle.backend.application.dto.AuthenticateUserCommand
import de.thomcz.pap.battle.backend.domain.model.AuthenticationResult

fun interface AuthenticationUseCase {
    fun execute(command: AuthenticateUserCommand): AuthenticationResult

}
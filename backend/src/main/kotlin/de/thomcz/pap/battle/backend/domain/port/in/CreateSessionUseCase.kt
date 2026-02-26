package de.thomcz.pap.battle.backend.domain.port.`in`

import de.thomcz.pap.battle.backend.application.dto.CreateSessionCommand
import de.thomcz.pap.battle.backend.domain.model.Session

interface CreateSessionUseCase {
    fun execute(command: CreateSessionCommand, userId: String): Session
}

package de.thomcz.pap.battle.backend.domain.port.`in`

import de.thomcz.pap.battle.backend.domain.model.Session
import java.util.UUID

interface GetSessionUseCase {
    fun execute(sessionId: UUID, userId: String): Session
}

package de.thomcz.pap.battle.backend.domain.port.`in`

import de.thomcz.pap.battle.backend.domain.model.Session
import java.util.UUID

interface FinishSessionUseCase {
    fun finish(sessionId: UUID, userId: String): Session
}

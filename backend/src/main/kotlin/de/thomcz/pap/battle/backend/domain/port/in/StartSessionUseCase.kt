package de.thomcz.pap.battle.backend.domain.port.`in`

import de.thomcz.pap.battle.backend.domain.model.Session
import java.util.UUID

interface StartSessionUseCase {
    fun start(sessionId: UUID, userId: String): Session
}

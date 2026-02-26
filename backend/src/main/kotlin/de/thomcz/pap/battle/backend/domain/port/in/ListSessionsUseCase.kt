package de.thomcz.pap.battle.backend.domain.port.`in`

import de.thomcz.pap.battle.backend.domain.model.Session
import de.thomcz.pap.battle.backend.domain.model.SessionStatus

interface ListSessionsUseCase {
    fun execute(userId: String, status: SessionStatus? = null): List<Session>
}

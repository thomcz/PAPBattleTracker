package de.thomcz.pap.battle.backend.domain.port.`in`

import java.util.UUID

interface DeleteSessionUseCase {
    fun delete(sessionId: UUID, userId: String)
}

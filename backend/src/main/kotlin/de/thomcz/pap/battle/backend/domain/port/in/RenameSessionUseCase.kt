package de.thomcz.pap.battle.backend.domain.port.`in`

import de.thomcz.pap.battle.backend.application.dto.RenameSessionCommand
import de.thomcz.pap.battle.backend.domain.model.Session
import java.util.UUID

interface RenameSessionUseCase {
    fun execute(sessionId: UUID, command: RenameSessionCommand, userId: String): Session
}

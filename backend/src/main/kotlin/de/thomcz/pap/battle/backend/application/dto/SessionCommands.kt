package de.thomcz.pap.battle.backend.application.dto

data class CreateSessionCommand(
    val name: String
)

data class RenameSessionCommand(
    val name: String
)

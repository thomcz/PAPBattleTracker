package de.thomcz.pap.battle.backend.domain.model

data class AuthenticationResult(val token: String, val user: User)

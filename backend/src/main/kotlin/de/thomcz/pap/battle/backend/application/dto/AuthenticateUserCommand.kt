package de.thomcz.pap.battle.backend.application.dto

data class AuthenticateUserCommand(val userName: String, val password: String) {
}
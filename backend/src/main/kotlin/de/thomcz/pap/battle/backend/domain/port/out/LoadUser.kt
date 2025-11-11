package de.thomcz.pap.battle.backend.domain.port.out

import de.thomcz.pap.battle.backend.domain.model.User

interface LoadUser {
    fun loadUserByUserName(username: String): User?
}
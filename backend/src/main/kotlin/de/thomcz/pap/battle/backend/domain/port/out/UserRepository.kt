package de.thomcz.pap.battle.backend.domain.port.out

import de.thomcz.pap.battle.backend.domain.model.User

interface UserRepository {
    fun save(user: User): User
    fun findByUserName(userName: String): User?
    fun existsByUserName(userName: String): Boolean
    fun existsByEmail(email: String): Boolean
}
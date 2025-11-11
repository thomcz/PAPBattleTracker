package de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence

import org.springframework.data.jpa.repository.JpaRepository

interface JpaUserRepository : JpaRepository<UserJpaEntity, Long> {
    fun findByUserName(username: String): UserJpaEntity?
    fun findByEmail(email: String): UserJpaEntity?
    fun existsByUserName(username: String): Boolean
    fun existsByEmail(email: String): Boolean
}
package de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence

import de.thomcz.pap.battle.backend.domain.model.User
import de.thomcz.pap.battle.backend.domain.port.out.LoadUser
import de.thomcz.pap.battle.backend.domain.port.out.UserRepository
import org.springframework.stereotype.Service

@Service
class UserRepositoryAdapter(
    private val jpaUserRepository: JpaUserRepository
) : UserRepository, LoadUser {
    override fun save(user: User): User {
        val saved = jpaUserRepository.save(user.toJpaEntity())
        return saved.toDomainModel()
    }

    override fun findByUserName(userName: String): User? {
        return jpaUserRepository.findByUserName(userName)?.toDomainModel()
    }

    override fun existsByUserName(userName: String): Boolean {
        return jpaUserRepository.existsByUserName(userName)
    }

    override fun existsByEmail(email: String): Boolean {
        return jpaUserRepository.existsByEmail(email)
    }

    private fun User.toJpaEntity(): UserJpaEntity {
        val user = UserJpaEntity()
        user.userName = this.userName
        user.email = this.email
        user.passwordHash = this.passwordHash
        return user
    }


    private fun UserJpaEntity.toDomainModel(): User {
        return User(
            id = this.id,
            userName = this.userName ?: throw IllegalStateException("UserJpaEntity.userName cannot be null"),
            email = this.email ?: throw IllegalStateException("UserJpaEntity.email cannot be null"),
            passwordHash = this.passwordHash ?: throw IllegalStateException("UserJpaEntity.passwordHash cannot be null")
        )

    }

    override fun loadUserByUserName(username: String): User? {
        return jpaUserRepository.findByUserName(username)?.toDomainModel()
    }
}
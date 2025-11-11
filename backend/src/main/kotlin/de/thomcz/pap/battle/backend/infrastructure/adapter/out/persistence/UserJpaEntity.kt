package de.thomcz.pap.battle.backend.infrastructure.adapter.out.persistence

import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "users")
open class UserJpaEntity {

    @Id
    @GeneratedValue
    open var id: Long = 0
    open var userName: String? = null
    open var email: String? = null
    open var passwordHash: String? = null

}

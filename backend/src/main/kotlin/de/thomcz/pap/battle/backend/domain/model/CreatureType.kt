package de.thomcz.pap.battle.backend.domain.model

/**
 * Distinguishes between player characters and monsters in combat.
 *
 * This affects lifecycle management:
 * - PLAYER creatures persist when combat ends
 * - MONSTER creatures are automatically removed when combat ends
 */
enum class CreatureType {
    /**
     * Player character - persists through combat end.
     */
    PLAYER,

    /**
     * Monster/NPC - removed automatically when combat ends.
     */
    MONSTER
}

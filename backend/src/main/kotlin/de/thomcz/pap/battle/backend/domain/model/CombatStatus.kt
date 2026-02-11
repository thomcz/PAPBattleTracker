package de.thomcz.pap.battle.backend.domain.model

/**
 * Represents the current status of combat in a battle session.
 *
 * State transitions:
 * - NOT_STARTED → ACTIVE (start combat)
 * - ACTIVE → PAUSED (pause combat)
 * - ACTIVE → ENDED (end combat)
 * - PAUSED → ACTIVE (resume combat)
 * - PAUSED → ENDED (end combat)
 */
enum class CombatStatus {
    /**
     * Battle created, creatures can be added/edited.
     * Combat has not yet started.
     */
    NOT_STARTED,

    /**
     * Combat in progress.
     * Turn/round tracking active, creatures sorted by initiative.
     */
    ACTIVE,

    /**
     * Combat paused.
     * State preserved, can be resumed.
     */
    PAUSED,

    /**
     * Combat finished.
     * Monster creatures removed, player creatures retained.
     */
    ENDED
}

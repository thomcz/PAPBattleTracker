import { CombatOutcome } from '../../../core/ports/battle.port';
import { CreatureType } from './battle.model';

/**
 * Status effects that can be applied to combatants.
 */
export enum StatusEffect {
  POISONED = 'Poisoned',
  STUNNED = 'Stunned',
  BLINDED = 'Blinded',
  BLESSED = 'Blessed',
  PRONE = 'Prone',
  RESTRAINED = 'Restrained',
  BURNING = 'Burning',
  FROZEN = 'Frozen'
}

/**
 * Tracks combat actions performed by a single combatant during an encounter.
 * Accumulated locally during active combat for display on the result screen.
 */
export interface CombatContribution {
  creatureId: string;
  creatureName: string;
  creatureType: CreatureType;
  totalDamage: number;
  totalHealing: number;
  criticalHits: number;
  buffsApplied: number;
}

/**
 * The final result of a completed encounter.
 * Combines the combat outcome with accumulated statistics.
 */
export interface CombatResult {
  outcome: CombatOutcome;
  totalRounds: number;
  startedAt: Date;
  endedAt: Date;
  contributions: CombatContribution[];
}

import { Observable } from 'rxjs';
import { Battle, BattleSummary, CombatStatus, Creature, CreatureType } from '../domain/models/battle.model';

/**
 * Port interface for battle operations.
 *
 * This defines the contract for battle-related operations in hexagonal architecture.
 * The BattleApiAdapter implements this port to communicate with the backend REST API.
 *
 * Per research.md: Returns Observables for async operations, which can be converted
 * to signals in components using toSignal().
 */
export abstract class BattlePort {
  /**
   * Create a new battle session.
   */
  abstract createBattle(name: string): Observable<Battle>;

  /**
   * List all battles for the authenticated user.
   */
  abstract listBattles(status?: CombatStatus): Observable<BattleSummary[]>;

  /**
   * Get detailed battle information by ID.
   */
  abstract getBattle(battleId: string): Observable<Battle>;

  /**
   * Start combat in a battle.
   * Sorts creatures by initiative and sets status to ACTIVE.
   */
  abstract startCombat(battleId: string): Observable<Battle>;

  /**
   * Pause active combat.
   * Preserves all state for later resumption.
   */
  abstract pauseCombat(battleId: string): Observable<Battle>;

  /**
   * Resume paused combat.
   */
  abstract resumeCombat(battleId: string): Observable<Battle>;

  /**
   * End combat.
   * Removes monster creatures, retains player creatures.
   */
  abstract endCombat(battleId: string, outcome: CombatOutcome): Observable<Battle>;

  /**
   * Advance to next turn in initiative order.
   * Increments round when last creature finishes turn.
   */
  abstract advanceTurn(battleId: string): Observable<Battle>;

  /**
   * Apply damage to a creature in an active battle.
   * User Story 3: Apply Damage
   */
  abstract applyDamage(battleId: string, creatureId: string, damage: number, source?: string): Observable<Battle>;

  /**
   * Get combat log entries for a battle (paginated).
   * User Story 4: Combat Log
   */
  abstract getCombatLog(battleId: string, limit?: number, offset?: number): Observable<CombatLogResponse>;

  /**
   * Delete a battle and all associated data.
   */
  abstract deleteBattle(battleId: string): Observable<void>;

  /**
   * Add a creature to a battle.
   * User Story 1: Add Creatures to Battle
   */
  abstract addCreature(
    battleId: string,
    name: string,
    type: CreatureType,
    currentHp: number,
    maxHp: number,
    initiative: number,
    armorClass: number
  ): Observable<Creature>;

  /**
   * Update a creature's attributes.
   * User Story 2: Edit Creature Attributes
   */
  abstract updateCreature(
    battleId: string,
    creatureId: string,
    name: string,
    currentHp: number,
    maxHp: number,
    initiative: number,
    armorClass: number
  ): Observable<Creature>;

  /**
   * Remove a creature from a battle.
   * User Story 3: Remove Creatures
   */
  abstract removeCreature(battleId: string, creatureId: string): Observable<void>;
}

/**
 * Combat outcome when ending a battle.
 */
export enum CombatOutcome {
  PLAYERS_VICTORIOUS = 'PLAYERS_VICTORIOUS',
  PLAYERS_DEFEATED = 'PLAYERS_DEFEATED',
  DRAW = 'DRAW',
  ABORTED = 'ABORTED'
}

/**
 * Combat log response with pagination.
 */
export interface CombatLogResponse {
  entries: CombatLogEntry[];
  total: number;
  limit: number;
  offset: number;
}

export interface CombatLogEntry {
  timestamp: string;
  message: string;
  type: 'ROUND_START' | 'CREATURE_ACTION' | 'DAMAGE' | 'DEFEAT' | 'BATTLE_END';
}

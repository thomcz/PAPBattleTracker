import { Observable } from 'rxjs';
import { Battle, BattleSummary, CombatStatus } from '../domain/models/battle.model';

/**
 * Port interface for battle operations.
 *
 * This defines the contract for battle-related operations in hexagonal architecture.
 * The BattleApiAdapter implements this port to communicate with the backend REST API.
 *
 * Per research.md: Returns Observables for async operations, which can be converted
 * to signals in components using toSignal().
 */
export interface BattlePort {
  /**
   * Create a new battle session.
   */
  createBattle(name: string): Observable<Battle>;

  /**
   * List all battles for the authenticated user.
   */
  listBattles(status?: CombatStatus): Observable<BattleSummary[]>;

  /**
   * Get detailed battle information by ID.
   */
  getBattle(battleId: string): Observable<Battle>;

  /**
   * Start combat in a battle.
   * Sorts creatures by initiative and sets status to ACTIVE.
   */
  startCombat(battleId: string): Observable<Battle>;

  /**
   * Pause active combat.
   * Preserves all state for later resumption.
   */
  pauseCombat(battleId: string): Observable<Battle>;

  /**
   * Resume paused combat.
   */
  resumeCombat(battleId: string): Observable<Battle>;

  /**
   * End combat.
   * Removes monster creatures, retains player creatures.
   */
  endCombat(battleId: string, outcome: CombatOutcome): Observable<Battle>;

  /**
   * Advance to next turn in initiative order.
   * Increments round when last creature finishes turn.
   */
  advanceTurn(battleId: string): Observable<Battle>;

  /**
   * Delete a battle and all associated data.
   */
  deleteBattle(battleId: string): Observable<void>;
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

import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { BattlePort } from '../../ports/battle.port';
import { Creature, CreatureType } from '../models/battle.model';

/**
 * Use case for adding creatures to battles.
 * User Story 1: Add Creatures to Battle
 *
 * Manages creature addition with signal-based state updates.
 */
@Injectable({
  providedIn: 'root',
})
export class AddCreatureUseCase {
  // Signal for tracking loading state
  private readonly isLoadingSignal = signal<boolean>(false);
  public readonly isLoading = this.isLoadingSignal.asReadonly();

  // Signal for tracking errors
  private readonly errorSignal = signal<string | null>(null);
  public readonly error = this.errorSignal.asReadonly();

  constructor(private readonly battlePort: BattlePort) {}

  /**
   * Execute the add creature use case.
   *
   * @param battleId The battle to add the creature to
   * @param creature Creature details
   * @returns Observable<Creature> that emits the added creature
   */
  execute(
    battleId: string,
    creature: {
      name: string;
      type: CreatureType;
      currentHp: number;
      maxHp: number;
      initiative: number;
      armorClass: number;
    }
  ): Observable<Creature> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return this.battlePort
      .addCreature(
        battleId,
        creature.name,
        creature.type,
        creature.currentHp,
        creature.maxHp,
        creature.initiative,
        creature.armorClass
      )
      .pipe(
        tap({
          next: () => {
            this.isLoadingSignal.set(false);
          },
          error: (err) => {
            this.isLoadingSignal.set(false);
            this.errorSignal.set(err.message || 'Failed to add creature');
          },
        })
      );
  }

  /**
   * Clear any error state.
   */
  clearError(): void {
    this.errorSignal.set(null);
  }
}

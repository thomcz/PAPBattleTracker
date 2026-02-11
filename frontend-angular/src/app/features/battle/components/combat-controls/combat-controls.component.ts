import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BattleApiAdapter } from '../../../../adapters/api/battle-api.adapter';
import { Battle, CombatStatus } from '../../../../core/domain/models/battle.model';
import { CombatOutcome } from '../../../../core/ports/battle.port';

/**
 * Combat Controls Component
 *
 * Provides buttons to control combat state: Start, Pause, Resume, End.
 * Validates actions based on current combat status.
 */
@Component({
  selector: 'app-combat-controls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './combat-controls.component.html',
  styleUrls: ['./combat-controls.component.css']
})
export class CombatControlsComponent {
  @Input({ required: true }) battle!: Battle;
  @Output() battleUpdated = new EventEmitter<Battle>();

  // Signal-based state
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  showEndDialog = signal<boolean>(false);

  // Expose enums to template
  CombatStatus = CombatStatus;
  CombatOutcome = CombatOutcome;

  constructor(private battleApi: BattleApiAdapter) {}

  canStartCombat(): boolean {
    return this.battle.status === CombatStatus.NOT_STARTED &&
           this.battle.creatures.length > 0;
  }

  canPauseCombat(): boolean {
    return this.battle.status === CombatStatus.ACTIVE;
  }

  canResumeCombat(): boolean {
    return this.battle.status === CombatStatus.PAUSED;
  }

  canEndCombat(): boolean {
    return this.battle.status === CombatStatus.ACTIVE ||
           this.battle.status === CombatStatus.PAUSED;
  }

  startCombat(): void {
    if (!this.canStartCombat()) return;

    this.loading.set(true);
    this.error.set(null);

    this.battleApi.startCombat(this.battle.id).subscribe({
      next: (updatedBattle) => {
        this.loading.set(false);
        this.battleUpdated.emit(updatedBattle);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Failed to start combat. Please try again.');
        console.error('Error starting combat:', err);
      }
    });
  }

  pauseCombat(): void {
    if (!this.canPauseCombat()) return;

    this.loading.set(true);
    this.error.set(null);

    this.battleApi.pauseCombat(this.battle.id).subscribe({
      next: (updatedBattle) => {
        this.loading.set(false);
        this.battleUpdated.emit(updatedBattle);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Failed to pause combat. Please try again.');
        console.error('Error pausing combat:', err);
      }
    });
  }

  resumeCombat(): void {
    if (!this.canResumeCombat()) return;

    this.loading.set(true);
    this.error.set(null);

    this.battleApi.resumeCombat(this.battle.id).subscribe({
      next: (updatedBattle) => {
        this.loading.set(false);
        this.battleUpdated.emit(updatedBattle);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Failed to resume combat. Please try again.');
        console.error('Error resuming combat:', err);
      }
    });
  }

  openEndDialog(): void {
    this.showEndDialog.set(true);
  }

  closeEndDialog(): void {
    this.showEndDialog.set(false);
  }

  endCombat(outcome: CombatOutcome): void {
    this.loading.set(true);
    this.error.set(null);

    this.battleApi.endCombat(this.battle.id, outcome).subscribe({
      next: (updatedBattle) => {
        this.loading.set(false);
        this.showEndDialog.set(false);
        this.battleUpdated.emit(updatedBattle);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Failed to end combat. Please try again.');
        console.error('Error ending combat:', err);
      }
    });
  }

  getStartTooltip(): string {
    if (this.battle.creatures.length === 0) {
      return 'Add at least one creature to start combat';
    }
    return 'Start combat and enter initiative order';
  }
}

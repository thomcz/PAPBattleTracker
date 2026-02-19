import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { concat } from 'rxjs';
import { last, switchMap } from 'rxjs/operators';
import { BattleApiAdapter } from '../../../../adapters/api/battle-api.adapter';
import { Battle, CombatStatus, Creature } from '../../../../core/domain/models/battle.model';
import { CombatOutcome } from '../../../../core/ports/battle.port';

interface InitiativeEntry {
  creature: Creature;
  initiative: number;
}

/**
 * Combat Controls Component
 *
 * Provides buttons to control combat state: Start, Pause, Resume, End.
 * Validates actions based on current combat status.
 */
@Component({
  selector: 'app-combat-controls',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  showInitiativeDialog = signal<boolean>(false);
  initiativeEntries = signal<InitiativeEntry[]>([]);
  showDamageDialog = signal<boolean>(false);
  damageTarget = signal<Creature | null>(null);
  damageAmount = signal<number>(1);
  damageSource = signal<string>('');

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
    this.openInitiativeDialog();
  }

  openInitiativeDialog(): void {
    const entries = this.battle.creatures.map(creature => ({
      creature,
      initiative: creature.initiative
    }));
    this.initiativeEntries.set(entries);
    this.showInitiativeDialog.set(true);
  }

  closeInitiativeDialog(): void {
    this.showInitiativeDialog.set(false);
    this.initiativeEntries.set([]);
  }

  updateInitiativeEntry(index: number, value: number): void {
    this.initiativeEntries.update(entries => {
      const updated = [...entries];
      updated[index] = { ...updated[index], initiative: value };
      return updated;
    });
  }

  confirmInitiativeAndStartCombat(): void {
    this.loading.set(true);
    this.error.set(null);

    const entries = this.initiativeEntries();
    const updateCalls = entries
      .filter(entry => entry.initiative !== entry.creature.initiative)
      .map(entry =>
        this.battleApi.updateCreature(
          this.battle.id,
          entry.creature.id,
          entry.creature.name,
          entry.creature.currentHp,
          entry.creature.maxHp,
          entry.initiative,
          entry.creature.armorClass
        )
      );

    const updates$ = updateCalls.length > 0
      ? concat(...updateCalls).pipe(last(), switchMap(() => this.battleApi.startCombat(this.battle.id)))
      : this.battleApi.startCombat(this.battle.id);

    updates$.subscribe({
      next: (updatedBattle) => {
        this.loading.set(false);
        this.showInitiativeDialog.set(false);
        this.initiativeEntries.set([]);
        this.battleUpdated.emit(updatedBattle);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to start combat. Please try again.');
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
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to pause combat. Please try again.');
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
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to resume combat. Please try again.');
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
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to end combat. Please try again.');
      }
    });
  }

  canAdvanceTurn(): boolean {
    return this.battle.status === CombatStatus.ACTIVE;
  }

  canApplyDamage(): boolean {
    return this.battle.status === CombatStatus.ACTIVE;
  }

  advanceTurn(): void {
    if (!this.canAdvanceTurn()) return;

    this.loading.set(true);
    this.error.set(null);

    this.battleApi.advanceTurn(this.battle.id).subscribe({
      next: (updatedBattle) => {
        this.loading.set(false);
        this.battleUpdated.emit(updatedBattle);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to advance turn. Please try again.');
      }
    });
  }

  openDamageDialog(creature: Creature): void {
    this.damageTarget.set(creature);
    this.damageAmount.set(1);
    this.damageSource.set('');
    this.showDamageDialog.set(true);
  }

  closeDamageDialog(): void {
    this.showDamageDialog.set(false);
    this.damageTarget.set(null);
  }

  applyDamage(): void {
    const target = this.damageTarget();
    if (!target) return;

    const damage = this.damageAmount();
    if (damage < 1) return;

    this.loading.set(true);
    this.error.set(null);

    const source = this.damageSource() || undefined;

    this.battleApi.applyDamage(this.battle.id, target.id, damage, source).subscribe({
      next: (updatedBattle) => {
        this.loading.set(false);
        this.showDamageDialog.set(false);
        this.damageTarget.set(null);
        this.battleUpdated.emit(updatedBattle);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to apply damage. Please try again.');
      }
    });
  }

  getActiveCreatures(): Creature[] {
    return this.battle.creatures.filter(c => !c.isDefeated);
  }

  getCurrentActor(): Creature | null {
    if (this.battle.status !== CombatStatus.ACTIVE) return null;
    const creatures = this.battle.creatures;
    if (creatures.length === 0 || this.battle.currentTurn >= creatures.length) return null;
    return creatures[this.battle.currentTurn];
  }

  getStartTooltip(): string {
    if (this.battle.creatures.length === 0) {
      return 'Add at least one creature to start combat';
    }
    return 'Start combat and enter initiative order';
  }
}

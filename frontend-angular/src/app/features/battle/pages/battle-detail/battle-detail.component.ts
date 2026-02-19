import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BattleApiAdapter } from '../../../../adapters/api/battle-api.adapter';
import { Battle, CombatStatus } from '../../../../core/domain/models/battle.model';
import { CombatControlsComponent } from '../../components/combat-controls/combat-controls.component';
import { CreatureListComponent } from '../../components/creature-list/creature-list.component';
import { CombatLogComponent } from '../../components/combat-log/combat-log.component';
import { AddCreatureUseCase } from '../../../../core/domain/use-cases/add-creature.use-case';

/**
 * Battle Detail Component
 *
 * Displays detailed information about a specific battle.
 * Shows battle status, creatures (when implemented in Story 2), and combat controls.
 *
 * Uses signals for reactive state management.
 */
@Component({
  selector: 'app-battle-detail',
  standalone: true,
  imports: [CommonModule, CombatControlsComponent, CreatureListComponent, CombatLogComponent, MatSnackBarModule],
  templateUrl: './battle-detail.component.html',
  styleUrls: ['./battle-detail.component.css']
})
export class BattleDetailComponent implements OnInit {
  // Signal-based state
  battle = signal<Battle | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  logRefreshTrigger = signal<number>(0);

  // Expose CombatStatus enum to template
  CombatStatus = CombatStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private battleApi: BattleApiAdapter,
    private addCreatureUseCase: AddCreatureUseCase,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const battleId = this.route.snapshot.paramMap.get('id');
    if (battleId) {
      this.loadBattle(battleId);
    } else {
      this.error.set('Invalid battle ID');
    }
  }

  loadBattle(battleId: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.battleApi.getBattle(battleId).subscribe({
      next: (battle) => {
        this.battle.set(battle);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load battle details. Please try again.');
        this.loading.set(false);
      }
    });
  }

  onBattleUpdated(updatedBattle: Battle): void {
    this.battle.set(updatedBattle);
    this.logRefreshTrigger.update(v => v + 1);
  }

  goBackToList(): void {
    this.router.navigate(['/battles']);
  }

  getStatusClass(status: CombatStatus): string {
    switch (status) {
      case CombatStatus.NOT_STARTED:
        return 'status-not-started';
      case CombatStatus.ACTIVE:
        return 'status-active';
      case CombatStatus.PAUSED:
        return 'status-paused';
      case CombatStatus.ENDED:
        return 'status-ended';
      default:
        return '';
    }
  }

  getStatusLabel(status: CombatStatus): string {
    switch (status) {
      case CombatStatus.NOT_STARTED:
        return 'Not Started';
      case CombatStatus.ACTIVE:
        return 'Active';
      case CombatStatus.PAUSED:
        return 'Paused';
      case CombatStatus.ENDED:
        return 'Ended';
      default:
        return status;
    }
  }

  // Creature management methods (User Stories 1-3)
  onAddCreature(data: any): void {
    const currentBattle = this.battle();
    if (!currentBattle) return;

    this.addCreatureUseCase.execute(currentBattle.id, data).subscribe({
      next: (newCreature) => {
        // Update battle signal with new creature added to array
        const updatedBattle = {
          ...currentBattle,
          creatures: [...currentBattle.creatures, newCreature]
        };
        this.battle.set(updatedBattle);
        this.snackBar.open('Creature added successfully', 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to add creature', 'Close', { duration: 3000 });
      }
    });
  }

  onUpdateCreature(event: { creatureId: string; data: any }): void {
    const currentBattle = this.battle();
    if (!currentBattle) return;

    this.battleApi.updateCreature(
      currentBattle.id,
      event.creatureId,
      event.data.name,
      event.data.currentHp,
      event.data.maxHp,
      event.data.initiative,
      event.data.armorClass
    ).subscribe({
      next: (updatedCreature) => {
        // Update battle signal with modified creature
        const updatedBattle = {
          ...currentBattle,
          creatures: currentBattle.creatures.map(c =>
            c.id === event.creatureId ? updatedCreature : c
          )
        };
        this.battle.set(updatedBattle);
        this.snackBar.open('Creature updated successfully', 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to update creature', 'Close', { duration: 3000 });
      }
    });
  }

  onRemoveCreature(creatureId: string): void {
    const currentBattle = this.battle();
    if (!currentBattle) return;

    this.battleApi.removeCreature(currentBattle.id, creatureId).subscribe({
      next: () => {
        // Update battle signal with creature removed from array
        const updatedBattle = {
          ...currentBattle,
          creatures: currentBattle.creatures.filter(c => c.id !== creatureId)
        };
        this.battle.set(updatedBattle);
        this.snackBar.open('Creature removed successfully', 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to remove creature', 'Close', { duration: 3000 });
      }
    });
  }
}

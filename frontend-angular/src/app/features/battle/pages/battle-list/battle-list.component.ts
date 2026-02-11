import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BattleApiAdapter } from '../../../../adapters/api/battle-api.adapter';
import { BattleSummary, CombatStatus } from '../../../../core/domain/models/battle.model';
import { CreateBattleDialogComponent } from '../../components/create-battle-dialog/create-battle-dialog.component';

/**
 * Battle List Component
 *
 * Displays all battles for the authenticated user in a table format.
 * Allows creating new battles and navigating to battle details.
 *
 * Uses signals for reactive state management.
 */
@Component({
  selector: 'app-battle-list',
  standalone: true,
  imports: [CommonModule, CreateBattleDialogComponent],
  templateUrl: './battle-list.component.html',
  styleUrls: ['./battle-list.component.css']
})
export class BattleListComponent implements OnInit {
  // Signal-based state
  battles = signal<BattleSummary[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  showCreateDialog = signal<boolean>(false);

  // Expose CombatStatus enum to template
  CombatStatus = CombatStatus;

  constructor(
    private battleApi: BattleApiAdapter,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBattles();
  }

  loadBattles(): void {
    this.loading.set(true);
    this.error.set(null);

    this.battleApi.listBattles().subscribe({
      next: (battles) => {
        this.battles.set(battles);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load battles. Please try again.');
        this.loading.set(false);
        console.error('Error loading battles:', err);
      }
    });
  }

  openCreateDialog(): void {
    this.showCreateDialog.set(true);
  }

  closeCreateDialog(): void {
    this.showCreateDialog.set(false);
  }

  onBattleCreated(battle: BattleSummary): void {
    // Add new battle to the list
    this.battles.update(battles => [...battles, battle]);
    this.closeCreateDialog();

    // Navigate to the new battle detail page
    this.router.navigate(['/battles', battle.id]);
  }

  viewBattle(battleId: string): void {
    this.router.navigate(['/battles', battleId]);
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
}
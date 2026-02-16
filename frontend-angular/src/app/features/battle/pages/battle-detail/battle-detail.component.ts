import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BattleApiAdapter } from '../../../../adapters/api/battle-api.adapter';
import { Battle, CombatStatus } from '../../../../core/domain/models/battle.model';
import { CombatControlsComponent } from '../../components/combat-controls/combat-controls.component';

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
  imports: [CommonModule, CombatControlsComponent],
  templateUrl: './battle-detail.component.html',
  styleUrls: ['./battle-detail.component.css']
})
export class BattleDetailComponent implements OnInit {
  // Signal-based state
  battle = signal<Battle | null>(null);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Expose CombatStatus enum to template
  CombatStatus = CombatStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private battleApi: BattleApiAdapter
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
      error: (err) => {
        this.error.set('Failed to load battle details. Please try again.');
        this.loading.set(false);
        console.error('Error loading battle:', err);
      }
    });
  }

  onBattleUpdated(updatedBattle: Battle): void {
    this.battle.set(updatedBattle);
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
}

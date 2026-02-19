import { Component, Input, OnChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BattleApiAdapter } from '../../../../adapters/api/battle-api.adapter';
import { CombatLogEntry } from '../../../../core/ports/battle.port';

/**
 * Combat Log Component
 *
 * Displays a paginated list of combat events for a battle.
 * Fetches log entries from the backend via the combat log endpoint.
 */
@Component({
  selector: 'app-combat-log',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './combat-log.component.html',
  styleUrls: ['./combat-log.component.css']
})
export class CombatLogComponent implements OnChanges {
  @Input({ required: true }) battleId!: string;
  @Input() refreshTrigger: number = 0;

  entries = signal<CombatLogEntry[]>([]);
  total = signal<number>(0);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(private battleApi: BattleApiAdapter) {}

  ngOnChanges(): void {
    this.loadLog();
  }

  loadLog(): void {
    this.loading.set(true);
    this.error.set(null);

    this.battleApi.getCombatLog(this.battleId).subscribe({
      next: (response) => {
        this.entries.set(response.entries);
        this.total.set(response.total);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load combat log.');
        this.loading.set(false);
      }
    });
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'ROUND_START': return 'log-round-start';
      case 'CREATURE_ACTION': return 'log-action';
      case 'DAMAGE': return 'log-damage';
      case 'DEFEAT': return 'log-defeat';
      case 'BATTLE_END': return 'log-battle-end';
      default: return '';
    }
  }
}

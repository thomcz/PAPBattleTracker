import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Battle, CombatStatus, CreatureType } from '../../../../core/domain/models/battle.model';
import { BattlePort, CombatOutcome } from '../../../../core/ports/battle.port';
import { CombatContribution } from '../../../../core/domain/models/combat.model';
import { CombatContributionService } from '../../services/combat-contribution.service';

@Component({
  selector: 'app-combat-result',
  standalone: true,
  imports: [],
  templateUrl: './combat-result.component.html',
  styleUrl: './combat-result.component.scss'
})
export class CombatResultComponent implements OnInit {
  battle = signal<Battle | null>(null);

  outcome = signal<CombatOutcome | null>(
    (typeof history !== 'undefined' ? (history.state?.['outcome'] ?? null) : null)
  );

  isVictory = computed(() => this.outcome() === CombatOutcome.PLAYERS_VICTORIOUS);

  playerContributions = computed<CombatContribution[]>(() =>
    this.contributionService.getContributions()
      .filter(c => c.creatureType === CreatureType.PLAYER)
      .sort((a, b) => b.totalDamage - a.totalDamage)
  );

  elapsedMs = computed(() => this.contributionService.getElapsedMs());

  elapsedFormatted = computed(() => {
    const ms = this.elapsedMs();
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly battlePort: BattlePort,
    readonly contributionService: CombatContributionService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.battlePort.getBattle(id).subscribe({
        next: (battle) => this.battle.set(battle)
      });
    }
  }

  endEncounter(): void {
    this.contributionService.reset();
    this.router.navigate(['/home']);
  }
}

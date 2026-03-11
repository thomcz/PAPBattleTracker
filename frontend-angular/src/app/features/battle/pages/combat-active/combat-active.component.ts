import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Battle, CombatStatus, Creature } from '../../../../core/domain/models/battle.model';
import { BattlePort, CombatOutcome } from '../../../../core/ports/battle.port';
import { CombatContributionService } from '../../services/combat-contribution.service';
import { CombatantCardComponent } from '../../components/combatant-card/combatant-card.component';
import { ActionManagerComponent } from '../../components/action-manager/action-manager.component';

@Component({
  selector: 'app-combat-active',
  standalone: true,
  imports: [CombatantCardComponent, ActionManagerComponent],
  templateUrl: './combat-active.component.html',
  styleUrl: './combat-active.component.scss'
})
export class CombatActiveComponent implements OnInit {
  protected readonly CombatOutcome = CombatOutcome;

  battle = signal<Battle | null>(null);
  actionTarget = signal<Creature | null>(null);
  showEndDialog = signal<boolean>(false);

  sortedCreatures = computed(() =>
    [...(this.battle()?.creatures ?? [])].sort((a, b) => (b.initiative ?? 0) - (a.initiative ?? 0))
  );

  currentActor = computed<Creature | null>(() => {
    const turn = this.battle()?.currentTurn ?? 0;
    return this.sortedCreatures()[turn] ?? null;
  });

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly battlePort: BattlePort,
    private readonly contributionService: CombatContributionService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadBattle(id);
  }

  private loadBattle(id: string): void {
    this.battlePort.getBattle(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (battle) => {
        this.battle.set(battle);
        if (battle.status === CombatStatus.NOT_STARTED) {
          this.router.navigate(['../'], { relativeTo: this.route });
        } else {
          this.contributionService.reset();
          this.contributionService.startTimer();
        }
      },
      error: (err) => console.error('Failed to load battle', err)
    });
  }

  openActionManager(creature: Creature): void {
    this.actionTarget.set(creature);
  }

  closeActionManager(): void {
    this.actionTarget.set(null);
  }

  onDamageApplied(event: { creature: Creature; amount: number }): void {
    const battleId = this.battle()?.id;
    if (!battleId) return;
    this.battlePort.applyDamage(battleId, event.creature.id, event.amount).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (updated) => {
        this.battle.set(updated);
        this.contributionService.recordDamage(event.creature.id, event.creature.name, event.creature.type, event.amount);
        this.closeActionManager();
      },
      error: (err) => console.error('Failed to apply damage', err)
    });
  }

  onHealingApplied(event: { creature: Creature; amount: number }): void {
    const battleId = this.battle()?.id;
    if (!battleId) return;
    this.battlePort.applyHealing(battleId, event.creature.id, event.amount).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (updated) => {
        this.battle.set(updated);
        this.contributionService.recordHealing(event.creature.id, event.creature.name, event.creature.type, event.amount);
        this.closeActionManager();
      },
      error: (err) => console.error('Failed to apply healing', err)
    });
  }

  onStatusToggled(event: { creature: Creature; effect: string; action: 'ADD' | 'REMOVE' }): void {
    const battleId = this.battle()?.id;
    if (!battleId) return;
    this.battlePort.applyStatusEffect(battleId, event.creature.id, event.effect, event.action).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (updated) => {
        this.battle.set(updated);
        if (event.action === 'ADD') {
          this.contributionService.recordStatusApplied(event.creature.id, event.creature.name, event.creature.type);
        }
        // Keep the panel open and refresh the target so active effects update
        const refreshed = updated.creatures.find(c => c.id === event.creature.id) ?? null;
        this.actionTarget.set(refreshed);
      },
      error: (err) => console.error('Failed to toggle status effect', err)
    });
  }

  nextTurn(): void {
    const battleId = this.battle()?.id;
    if (!battleId) return;
    this.battlePort.advanceTurn(battleId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (updated) => this.battle.set(updated),
      error: (err) => console.error('Failed to advance turn', err)
    });
  }

  openEndDialog(): void {
    this.showEndDialog.set(true);
  }

  endCombat(outcome: CombatOutcome): void {
    const battleId = this.battle()?.id;
    if (!battleId) return;
    this.battlePort.endCombat(battleId, outcome).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.contributionService.stopTimer();
        this.router.navigate(['../result'], { relativeTo: this.route, state: { outcome } });
      },
      error: (err) => console.error('Failed to end combat', err)
    });
  }
}

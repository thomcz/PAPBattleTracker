import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { from } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { BattlePort } from '../../../../core/ports/battle.port';
import { Battle, Creature, CreatureType } from '../../../../core/domain/models/battle.model';

interface InitiativeRow {
  creature: Creature;
  initiativeValue: number | null;
}

@Component({
  selector: 'app-combat-initiative',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './combat-initiative.component.html',
  styleUrl: './combat-initiative.component.scss'
})
export class CombatInitiativeComponent implements OnInit {
  battle = signal<Battle | null>(null);
  rows = signal<InitiativeRow[]>([]);

  allFilled = computed(() =>
    this.rows().length > 0 &&
    this.rows().every(r => r.initiativeValue !== null && r.initiativeValue !== undefined)
  );

  readonly CreatureType = CreatureType;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private battlePort: BattlePort
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.battlePort.getBattle(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(battle => {
        this.battle.set(battle);
        this.rows.set(battle.creatures.map(c => ({
          creature: c,
          initiativeValue: c.initiative ?? null
        })));
      });
    }
  }

  formatDexMod(creature: Creature): string {
    const mod = creature.dexModifier;
    if (mod === undefined || mod === null) return '';
    return mod >= 0 ? `+${mod}` : `${mod}`;
  }

  rollInitiative(row: InitiativeRow): void {
    const roll = Math.floor(Math.random() * 20) + 1;
    const mod = row.creature.dexModifier ?? 0;
    row.initiativeValue = roll + mod;
    this.rows.update(rows => [...rows]);
  }

  rollAllMonsters(): void {
    this.rows.update(rows => rows.map(r => {
      if (r.creature.type === CreatureType.MONSTER) {
        const roll = Math.floor(Math.random() * 20) + 1;
        const mod = r.creature.dexModifier ?? 0;
        return { ...r, initiativeValue: roll + mod };
      }
      return r;
    }));
  }

  typeLabel(creature: Creature): string {
    return creature.type === CreatureType.PLAYER ? 'PC' : 'MON';
  }

  startBattle(): void {
    const battle = this.battle();
    if (!battle) return;

    const updateCalls = this.rows()
      .filter(r => r.initiativeValue !== null)
      .map(r => this.battlePort.updateCreature(
        battle.id, r.creature.id,
        r.creature.name, r.creature.currentHp, r.creature.maxHp,
        r.initiativeValue!, r.creature.armorClass
      ));

    if (updateCalls.length === 0) {
      this.doStartCombat(battle.id);
      return;
    }

    from(updateCalls).pipe(
      concatMap(call => call),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      error: (err) => console.error('Failed to save initiative values', err),
      complete: () => this.doStartCombat(battle.id)
    });
  }

  private doStartCombat(battleId: string): void {
    this.battlePort.startCombat(battleId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.router.navigate(['../combat'], { relativeTo: this.route }),
      error: (err) => console.error('Failed to start combat', err)
    });
  }

  onInitiativeChange(): void {
    this.rows.update(r => [...r]);
  }

  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}

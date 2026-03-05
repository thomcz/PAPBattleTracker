import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { from } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { BattleApiAdapter } from '../../../../adapters/api/battle-api.adapter';
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private battleApi: BattleApiAdapter
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.battleApi.getBattle(id).subscribe(battle => {
        this.battle.set(battle);
        this.rows.set(battle.creatures.map(c => ({
          creature: c,
          initiativeValue: c.initiative || null
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
      .map(r => this.battleApi.updateCreature(
        battle.id, r.creature.id,
        r.creature.name, r.creature.currentHp, r.creature.maxHp,
        r.initiativeValue!, r.creature.armorClass
      ));

    if (updateCalls.length === 0) {
      this.doStartCombat(battle.id);
      return;
    }

    from(updateCalls).pipe(
      concatMap(call => call)
    ).subscribe({
      error: (err) => console.error('Failed to save initiative values', err),
      complete: () => this.doStartCombat(battle.id)
    });
  }

  private doStartCombat(battleId: string): void {
    this.battleApi.startCombat(battleId).subscribe(() => {
      this.router.navigate(['../combat'], { relativeTo: this.route });
    });
  }

  onInitiativeChange(): void {
    this.rows.update(r => [...r]);
  }

  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}

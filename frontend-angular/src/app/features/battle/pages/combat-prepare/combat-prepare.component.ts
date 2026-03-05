import { Component, OnInit, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BattleApiAdapter } from '../../../../adapters/api/battle-api.adapter';
import { Battle, CombatStatus, Creature, CreatureType } from '../../../../core/domain/models/battle.model';
import { CombatantCardComponent } from '../../components/combatant-card/combatant-card.component';
import { CreatureDialogComponent } from '../../components/creature-dialog/creature-dialog.component';
import { AddCreatureUseCase } from '../../../../core/domain/use-cases/add-creature.use-case';

@Component({
  selector: 'app-combat-prepare',
  standalone: true,
  imports: [CombatantCardComponent, MatDialogModule],
  templateUrl: './combat-prepare.component.html',
  styleUrl: './combat-prepare.component.scss'
})
export class CombatPrepareComponent implements OnInit {
  battle = signal<Battle | null>(null);
  loading = signal<boolean>(false);

  enemies = computed(() =>
    this.battle()?.creatures.filter(c => c.type === CreatureType.MONSTER) ?? []
  );

  players = computed(() =>
    this.battle()?.creatures.filter(c => c.type === CreatureType.PLAYER) ?? []
  );

  avgCr = computed(() => {
    const monsters = this.enemies();
    if (!monsters.length) return 0;
    const avgAc = monsters.reduce((sum, m) => sum + m.armorClass, 0) / monsters.length;
    return Math.round(avgAc - 10);
  });

  canStart = computed(() => (this.battle()?.creatures.length ?? 0) > 0);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private battleApi: BattleApiAdapter,
    private addCreatureUseCase: AddCreatureUseCase,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBattle(id);
    }
  }

  loadBattle(id: string): void {
    this.loading.set(true);
    this.battleApi.getBattle(id).subscribe({
      next: (battle) => {
        this.loading.set(false);
        this.battle.set(battle);
        if (battle.status === CombatStatus.ACTIVE) {
          this.router.navigate(['/battles', battle.id, 'combat']);
        } else if (battle.status === CombatStatus.ENDED) {
          this.router.navigate(['/battles', battle.id, 'result']);
        }
      },
      error: () => this.loading.set(false)
    });
  }

  startBattle(): void {
    const battle = this.battle();
    if (!battle) return;
    this.router.navigate(['/battles', battle.id, 'initiative']);
  }

  goBack(): void {
    this.router.navigate(['/battles']);
  }

  openAddCreature(): void {
    const ref = this.dialog.open(CreatureDialogComponent, {
      data: { mode: 'add' }
    });
    ref.afterClosed().subscribe(result => {
      if (!result) return;
      const currentBattle = this.battle();
      if (!currentBattle) return;
      this.addCreatureUseCase.execute(currentBattle.id, result).subscribe({
        next: (creature: Creature) => {
          this.battle.update(b => b ? {
            ...b,
            creatures: [...b.creatures, creature]
          } : b);
        }
      });
    });
  }

  removeAllCreatures(): void {
    const currentBattle = this.battle();
    if (!currentBattle) return;
    const ids = currentBattle.creatures.map(c => c.id);
    ids.forEach(id => {
      this.battleApi.removeCreature(currentBattle.id, id).subscribe({
        next: () => {
          this.battle.update(b => b ? {
            ...b,
            creatures: b.creatures.filter(c => c.id !== id)
          } : b);
        }
      });
    });
  }
}

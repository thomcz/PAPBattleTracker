import { Component, computed, input, output } from '@angular/core';
import { Creature } from '../../../../core/domain/models/battle.model';

@Component({
  selector: 'app-combatant-card',
  standalone: true,
  templateUrl: './combatant-card.component.html',
  styleUrl: './combatant-card.component.scss'
})
export class CombatantCardComponent {
  creature = input.required<Creature>();
  isActive = input<boolean>(false);
  showInitiative = input<boolean>(false);

  clicked = output<void>();

  hpPercent = computed(() => {
    const c = this.creature();
    return c.maxHp > 0 ? (c.currentHp / c.maxHp) * 100 : 0;
  });

  hpBarClass = computed(() => {
    const pct = this.hpPercent();
    if (pct <= 25) return 'hp-critical';
    if (pct <= 50) return 'hp-wounded';
    return 'hp-healthy';
  });
}

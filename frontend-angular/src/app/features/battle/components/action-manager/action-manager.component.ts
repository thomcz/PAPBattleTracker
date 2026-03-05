import { Component, OnInit, effect, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Battle, Creature } from '../../../../core/domain/models/battle.model';
import { StatusEffect } from '../../../../core/domain/models/combat.model';

@Component({
  standalone: true,
  selector: 'app-action-manager',
  imports: [CommonModule],
  templateUrl: './action-manager.component.html',
  styleUrl: './action-manager.component.scss'
})
export class ActionManagerComponent implements OnInit {
  battle = input.required<Battle>();
  initialTarget = input<Creature | null>(null);

  damageApplied = output<{ creature: Creature; amount: number }>();
  healingApplied = output<{ creature: Creature; amount: number }>();
  statusToggled = output<{ creature: Creature; effect: string; action: 'ADD' | 'REMOVE' }>();
  closed = output<void>();

  selectedTarget = signal<Creature | null>(null);
  amount = signal<number>(0);

  readonly statusEffects = Object.values(StatusEffect);

  activeEffects = computed<string[]>(() => this.selectedTarget()?.effects ?? []);

  constructor() {
    // Keep selectedTarget in sync when the parent refreshes the initialTarget
    // (e.g. after a status-effect toggle the parent passes back the updated creature)
    effect(() => {
      const target = this.initialTarget();
      if (target !== null) {
        this.selectedTarget.set(target);
      }
    });
  }

  ngOnInit(): void {}

  selectTarget(creature: Creature): void {
    this.selectedTarget.set(creature);
  }

  increment(): void {
    this.amount.update((v) => v + 1);
  }

  decrement(): void {
    this.amount.update((v) => Math.max(0, v - 1));
  }

  rollDice(sides: number): void {
    const result = Math.floor(Math.random() * sides) + 1;
    this.amount.set(result);
  }

  applyDamage(): void {
    const target = this.selectedTarget();
    if (!target) return;
    this.damageApplied.emit({ creature: target, amount: this.amount() });
  }

  applyHealing(): void {
    const target = this.selectedTarget();
    if (!target) return;
    this.healingApplied.emit({ creature: target, amount: this.amount() });
  }

  toggleEffect(effect: string): void {
    const target = this.selectedTarget();
    if (!target) return;
    const action = target.effects.includes(effect) ? 'REMOVE' : 'ADD';
    this.statusToggled.emit({ creature: target, effect, action });
  }

  close(): void {
    this.closed.emit();
  }
}

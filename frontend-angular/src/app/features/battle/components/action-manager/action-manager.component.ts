import { Component, effect, input, output, signal, computed } from '@angular/core';
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
export class ActionManagerComponent {
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
    // Sync selectedTarget when the parent refreshes initialTarget
    // (e.g. after a status-effect toggle the parent passes back the updated creature).
    // The null guard is intentionally removed: the parent gates rendering with @if(actionTarget()),
    // so this component is never alive when initialTarget() would become null.
    effect(() => {
      this.selectedTarget.set(this.initialTarget());
    });
  }

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

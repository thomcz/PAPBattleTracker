import { Injectable, signal } from '@angular/core';
import { CombatContribution } from '../../../core/domain/models/combat.model';
import { CreatureType } from '../../../core/domain/models/battle.model';

@Injectable({
  providedIn: 'root',
})
export class CombatContributionService {
  private readonly contributionsSignal = signal<Map<string, CombatContribution>>(new Map());
  private startedAt: number | null = null;
  private stoppedAt: number | null = null;

  startTimer(): void {
    this.startedAt = Date.now();
    this.stoppedAt = null;
  }

  stopTimer(): void {
    if (this.startedAt !== null) {
      this.stoppedAt = Date.now();
    }
  }

  getElapsedMs(): number {
    if (this.startedAt === null) return 0;
    const end = this.stoppedAt ?? Date.now();
    return end - this.startedAt;
  }

  recordDamage(creatureId: string, creatureName: string, creatureType: CreatureType, amount: number): void {
    this.updateEntry(creatureId, creatureName, creatureType, (entry) => {
      entry.totalDamage += amount;
    });
  }

  recordHealing(creatureId: string, creatureName: string, creatureType: CreatureType, amount: number): void {
    this.updateEntry(creatureId, creatureName, creatureType, (entry) => {
      entry.totalHealing += amount;
    });
  }

  recordStatusApplied(creatureId: string, creatureName: string, creatureType: CreatureType): void {
    this.updateEntry(creatureId, creatureName, creatureType, (entry) => {
      entry.buffsApplied += 1;
    });
  }

  getContributions(): CombatContribution[] {
    return Array.from(this.contributionsSignal().values());
  }

  reset(): void {
    this.contributionsSignal.set(new Map());
    this.startedAt = null;
    this.stoppedAt = null;
  }

  private updateEntry(
    creatureId: string,
    creatureName: string,
    creatureType: CreatureType,
    mutate: (entry: CombatContribution) => void
  ): void {
    this.contributionsSignal.update((map) => {
      const next = new Map(map);
      const existing = next.get(creatureId) ?? {
        creatureId,
        creatureName,
        creatureType,
        totalDamage: 0,
        totalHealing: 0,
        criticalHits: 0,
        buffsApplied: 0
      };
      const entry = { ...existing };
      mutate(entry);
      next.set(creatureId, entry);
      return next;
    });
  }
}

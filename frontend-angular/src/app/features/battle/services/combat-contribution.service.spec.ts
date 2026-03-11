import { TestBed } from '@angular/core/testing';
import { vi, expect, describe, it, beforeEach, afterEach } from 'vitest';
import { CombatContributionService } from './combat-contribution.service';
import { CreatureType } from '../../../core/domain/models/battle.model';
import { CombatContribution } from '../../../core/domain/models/combat.model';

describe('CombatContributionService', () => {
  let service: CombatContributionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CombatContributionService);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have empty contributions', () => {
      expect(service.getContributions()).toEqual([]);
    });

    it('should have zero elapsed time', () => {
      expect(service.getElapsedMs()).toBe(0);
    });
  });

  describe('recordDamage', () => {
    it('should create contribution entry on first damage', () => {
      service.recordDamage('creature-1', 'Paladin', CreatureType.PLAYER, 10);

      const contributions = service.getContributions();
      expect(contributions).toHaveLength(1);
      expect(contributions[0].creatureId).toBe('creature-1');
      expect(contributions[0].totalDamage).toBe(10);
    });

    it('should accumulate damage for same creature', () => {
      service.recordDamage('creature-1', 'Paladin', CreatureType.PLAYER, 10);
      service.recordDamage('creature-1', 'Paladin', CreatureType.PLAYER, 5);

      const contributions = service.getContributions();
      expect(contributions[0].totalDamage).toBe(15);
    });

    it('should track separate contributions per creature', () => {
      service.recordDamage('creature-1', 'Paladin', CreatureType.PLAYER, 10);
      service.recordDamage('creature-2', 'Rogue', CreatureType.PLAYER, 20);

      const contributions = service.getContributions();
      expect(contributions).toHaveLength(2);
    });
  });

  describe('recordHealing', () => {
    it('should create contribution entry on first healing', () => {
      service.recordHealing('creature-1', 'Cleric', CreatureType.PLAYER, 8);

      const contributions = service.getContributions();
      expect(contributions[0].totalHealing).toBe(8);
    });

    it('should accumulate healing for same creature', () => {
      service.recordHealing('creature-1', 'Cleric', CreatureType.PLAYER, 8);
      service.recordHealing('creature-1', 'Cleric', CreatureType.PLAYER, 4);

      expect(service.getContributions()[0].totalHealing).toBe(12);
    });
  });

  describe('recordStatusApplied', () => {
    it('should increment buffsApplied', () => {
      service.recordStatusApplied('creature-1', 'Bard', CreatureType.PLAYER);
      service.recordStatusApplied('creature-1', 'Bard', CreatureType.PLAYER);

      expect(service.getContributions()[0].buffsApplied).toBe(2);
    });
  });

  describe('timer', () => {
    it('should return 0 elapsed ms before starting', () => {
      expect(service.getElapsedMs()).toBe(0);
    });

    it('should track elapsed time after startTimer', () => {
      service.startTimer();
      vi.advanceTimersByTime(5000);

      expect(service.getElapsedMs()).toBeGreaterThanOrEqual(5000);
    });

    it('should stop tracking after stopTimer', () => {
      service.startTimer();
      vi.advanceTimersByTime(3000);
      service.stopTimer();
      vi.advanceTimersByTime(2000);

      const elapsed = service.getElapsedMs();
      expect(elapsed).toBeGreaterThanOrEqual(3000);
      expect(elapsed).toBeLessThan(5000);
    });
  });

  describe('reset', () => {
    it('should clear all contributions', () => {
      service.recordDamage('creature-1', 'Fighter', CreatureType.PLAYER, 20);
      service.reset();

      expect(service.getContributions()).toEqual([]);
    });

    it('should reset elapsed time', () => {
      service.startTimer();
      vi.advanceTimersByTime(2000);
      service.reset();

      expect(service.getElapsedMs()).toBe(0);
    });
  });
});

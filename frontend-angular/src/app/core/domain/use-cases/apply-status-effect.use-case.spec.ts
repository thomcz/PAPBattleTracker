import { TestBed } from '@angular/core/testing';
import { vi, expect, describe, it, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { ApplyStatusEffectUseCase } from './apply-status-effect.use-case';
import { BattlePort } from '../../ports/battle.port';
import { Battle, CombatStatus, CreatureType } from '../models/battle.model';

describe('ApplyStatusEffectUseCase', () => {
  let useCase: ApplyStatusEffectUseCase;
  let battlePortMock: BattlePort;

  const mockBattle: Battle = {
    id: 'battle-123',
    name: 'Test Battle',
    status: CombatStatus.ACTIVE,
    creatures: [
      {
        id: 'creature-1',
        name: 'Rogue',
        type: CreatureType.PLAYER,
        currentHp: 25,
        maxHp: 30,
        initiative: 14,
        armorClass: 15,
        isDefeated: false,
        effects: ['Poisoned']
      }
    ],
    currentTurn: 0,
    round: 1,
    createdAt: '2024-01-01T00:00:00Z',
    lastModified: '2024-01-01T00:00:00Z'
  };

  beforeEach(() => {
    battlePortMock = {
      createBattle: vi.fn(),
      listBattles: vi.fn(),
      getBattle: vi.fn(),
      startCombat: vi.fn(),
      pauseCombat: vi.fn(),
      resumeCombat: vi.fn(),
      endCombat: vi.fn(),
      advanceTurn: vi.fn(),
      applyDamage: vi.fn(),
      applyHealing: vi.fn(),
      applyStatusEffect: vi.fn(),
      getCombatLog: vi.fn(),
      deleteBattle: vi.fn(),
      addCreature: vi.fn(),
      updateCreature: vi.fn(),
      removeCreature: vi.fn()
    } as BattlePort;

    TestBed.configureTestingModule({
      providers: [
        ApplyStatusEffectUseCase,
        { provide: BattlePort, useValue: battlePortMock }
      ]
    });
    useCase = TestBed.inject(ApplyStatusEffectUseCase);
  });

  it('should be created', () => {
    expect(useCase).toBeTruthy();
  });

  describe('execute', () => {
    it('should call battlePort.applyStatusEffect with ADD action', () => {
      (battlePortMock.applyStatusEffect as any).mockReturnValue(of(mockBattle));

      useCase.execute('battle-123', 'creature-1', 'Poisoned', 'ADD').subscribe();

      expect(battlePortMock.applyStatusEffect).toHaveBeenCalledWith('battle-123', 'creature-1', 'Poisoned', 'ADD');
    });

    it('should call battlePort.applyStatusEffect with REMOVE action', () => {
      (battlePortMock.applyStatusEffect as any).mockReturnValue(of(mockBattle));

      useCase.execute('battle-123', 'creature-1', 'Stunned', 'REMOVE').subscribe();

      expect(battlePortMock.applyStatusEffect).toHaveBeenCalledWith('battle-123', 'creature-1', 'Stunned', 'REMOVE');
    });

    it('should return updated battle from port', () => {
      (battlePortMock.applyStatusEffect as any).mockReturnValue(of(mockBattle));

      useCase.execute('battle-123', 'creature-1', 'Poisoned', 'ADD').subscribe((result) => {
        expect(result).toEqual(mockBattle);
      });
    });
  });
});

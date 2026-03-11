import { TestBed } from '@angular/core/testing';
import { vi, expect, describe, it, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { ApplyHealingUseCase } from './apply-healing.use-case';
import { BattlePort } from '../../ports/battle.port';
import { Battle, CombatStatus, CreatureType } from '../models/battle.model';

describe('ApplyHealingUseCase', () => {
  let useCase: ApplyHealingUseCase;
  let battlePortMock: BattlePort;

  const mockBattle: Battle = {
    id: 'battle-123',
    name: 'Test Battle',
    status: CombatStatus.ACTIVE,
    creatures: [
      {
        id: 'creature-1',
        name: 'Paladin',
        type: CreatureType.PLAYER,
        currentHp: 30,
        maxHp: 40,
        initiative: 10,
        armorClass: 18,
        isDefeated: false,
        effects: []
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
        ApplyHealingUseCase,
        { provide: BattlePort, useValue: battlePortMock }
      ]
    });
    useCase = TestBed.inject(ApplyHealingUseCase);
  });

  it('should be created', () => {
    expect(useCase).toBeTruthy();
  });

  describe('execute', () => {
    it('should call battlePort.applyHealing with correct parameters', () => {
      (battlePortMock.applyHealing as any).mockReturnValue(of(mockBattle));

      useCase.execute('battle-123', 'creature-1', 10).subscribe();

      expect(battlePortMock.applyHealing).toHaveBeenCalledWith('battle-123', 'creature-1', 10, undefined);
    });

    it('should forward optional source to battlePort', () => {
      (battlePortMock.applyHealing as any).mockReturnValue(of(mockBattle));

      useCase.execute('battle-123', 'creature-1', 20, 'Healing Potion').subscribe();

      expect(battlePortMock.applyHealing).toHaveBeenCalledWith('battle-123', 'creature-1', 20, 'Healing Potion');
    });

    it('should return updated battle from port', () => {
      (battlePortMock.applyHealing as any).mockReturnValue(of(mockBattle));

      useCase.execute('battle-123', 'creature-1', 10).subscribe((result) => {
        expect(result).toEqual(mockBattle);
      });
    });
  });
});

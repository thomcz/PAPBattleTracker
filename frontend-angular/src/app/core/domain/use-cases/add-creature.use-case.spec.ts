import { TestBed } from '@angular/core/testing';
import { vi, expect, describe, it, beforeEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { AddCreatureUseCase } from './add-creature.use-case';
import { BattlePort } from '../../ports/battle.port';
import { CreatureType, Creature } from '../models/battle.model';

describe('AddCreatureUseCase', () => {
  let useCase: AddCreatureUseCase;
  let battlePortMock: BattlePort;

  const mockCreature: Creature = {
    id: 'creature-123',
    name: 'Goblin',
    type: CreatureType.MONSTER,
    currentHp: 20,
    maxHp: 20,
    initiative: 10,
    armorClass: 15,
    isDefeated: false,
    effects: []
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
      deleteBattle: vi.fn(),
      addCreature: vi.fn(),
      updateCreature: vi.fn(),
      removeCreature: vi.fn(),
      applyDamage: vi.fn(),
      getCombatLog: vi.fn()
    } as BattlePort;

    TestBed.configureTestingModule({
      providers: [
        AddCreatureUseCase,
        { provide: BattlePort, useValue: battlePortMock }
      ]
    });
    useCase = TestBed.inject(AddCreatureUseCase);
  });

  it('should be created', () => {
    expect(useCase).toBeTruthy();
  });

  it('should have initial loading state as false', () => {
    expect(useCase.isLoading()).toBe(false);
  });

  it('should have initial error state as null', () => {
    expect(useCase.error()).toBe(null);
  });

  describe('execute', () => {
    const battleId = 'battle-123';
    const creatureData = {
      name: 'Goblin',
      type: CreatureType.MONSTER,
      currentHp: 20,
      maxHp: 20,
      initiative: 10,
      armorClass: 15
    };

    it('should call battlePort.addCreature with correct parameters', () => {
      (battlePortMock.addCreature as any).mockReturnValue(of(mockCreature));

      useCase.execute(battleId, creatureData).subscribe();

      expect(battlePortMock.addCreature).toHaveBeenCalledWith(
        battleId,
        'Goblin',
        CreatureType.MONSTER,
        20,
        20,
        10,
        15
      );
    });

    it('should return created creature on success', () => {
      (battlePortMock.addCreature as any).mockReturnValue(of(mockCreature));

      useCase.execute(battleId, creatureData).subscribe((creature) => {
        expect(creature).toEqual(mockCreature);
        expect(useCase.isLoading()).toBe(false);
        expect(useCase.error()).toBe(null);
      });
    });

    it('should set error signal when adding creature fails', () => {
      const errorMessage = 'Failed to add creature';
      (battlePortMock.addCreature as any).mockReturnValue(
        throwError(() => new Error(errorMessage))
      );

      useCase.execute(battleId, creatureData).subscribe({
        error: () => {
          expect(useCase.isLoading()).toBe(false);
          expect(useCase.error()).toBe(errorMessage);
        }
      });
    });

    it('should handle generic error without message', () => {
      (battlePortMock.addCreature as any).mockReturnValue(
        throwError(() => ({}))
      );

      useCase.execute(battleId, creatureData).subscribe({
        error: () => {
          expect(useCase.error()).toBe('Failed to add creature');
        }
      });
    });
  });

  describe('clearError', () => {
    it('should clear error signal', () => {
      const battleId = 'battle-123';
      const creatureData = {
        name: 'Goblin',
        type: CreatureType.MONSTER,
        currentHp: 20,
        maxHp: 20,
        initiative: 10,
        armorClass: 15
      };

      (battlePortMock.addCreature as any).mockReturnValue(
        throwError(() => new Error('Test error'))
      );

      useCase.execute(battleId, creatureData).subscribe({
        error: () => {
          expect(useCase.error()).toBe('Test error');

          useCase.clearError();

          expect(useCase.error()).toBe(null);
        }
      });
    });
  });
});

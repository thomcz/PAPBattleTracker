import { TestBed } from '@angular/core/testing';
import { vi, expect, describe, it, beforeEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { BeasteryListUseCase } from './beastery-list.use-case';
import { BeasteryPort } from '../../ports/beastery.port';
import { BeasteryCreature } from '../models/beastery-creature.model';

describe('BeasteryListUseCase', () => {
  let useCase: BeasteryListUseCase;
  let beasteryPortMock: BeasteryPort;

  const mockCreature: BeasteryCreature = {
    creatureId: 'creature-123',
    name: 'Goblin',
    hitPoints: 7,
    armorClass: 15,
    isDeleted: false,
    createdAt: '2026-01-01T00:00:00Z',
    lastModified: '2026-01-01T00:00:00Z'
  };

  beforeEach(() => {
    beasteryPortMock = {
      createCreature: vi.fn(),
      listCreatures: vi.fn(),
      getCreature: vi.fn(),
      updateCreature: vi.fn(),
      deleteCreature: vi.fn(),
      duplicateCreature: vi.fn()
    } as unknown as BeasteryPort;

    TestBed.configureTestingModule({
      providers: [
        BeasteryListUseCase,
        { provide: BeasteryPort, useValue: beasteryPortMock }
      ]
    });
    useCase = TestBed.inject(BeasteryListUseCase);
  });

  it('should be created', () => {
    expect(useCase).toBeTruthy();
  });

  it('should have initial empty creatures list', () => {
    expect(useCase.creatures()).toEqual([]);
  });

  it('should have initial loading state as false', () => {
    expect(useCase.isLoading()).toBe(false);
  });

  it('should have initial error state as null', () => {
    expect(useCase.error()).toBe(null);
  });

  describe('loadCreatures', () => {
    it('should load creatures and update signal', () => {
      (beasteryPortMock.listCreatures as any).mockReturnValue(
        of({ creatures: [mockCreature], total: 1 })
      );

      useCase.loadCreatures().subscribe(() => {
        expect(useCase.creatures()).toEqual([mockCreature]);
        expect(useCase.isLoading()).toBe(false);
      });
    });

    it('should set error on failure', () => {
      (beasteryPortMock.listCreatures as any).mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      useCase.loadCreatures().subscribe({
        error: () => {
          expect(useCase.isLoading()).toBe(false);
          expect(useCase.error()).toBe('Network error');
        }
      });
    });
  });

  describe('createCreature', () => {
    it('should add creature to list on success', () => {
      (beasteryPortMock.createCreature as any).mockReturnValue(of(mockCreature));

      useCase.createCreature({
        name: 'Goblin',
        hitPoints: 7,
        armorClass: 15
      }).subscribe(() => {
        expect(useCase.creatures()).toContainEqual(mockCreature);
        expect(useCase.isLoading()).toBe(false);
      });
    });

    it('should set error on failure', () => {
      (beasteryPortMock.createCreature as any).mockReturnValue(
        throwError(() => new Error('Create failed'))
      );

      useCase.createCreature({
        name: 'Goblin',
        hitPoints: 7,
        armorClass: 15
      }).subscribe({
        error: () => {
          expect(useCase.error()).toBe('Create failed');
        }
      });
    });
  });

  describe('updateCreature', () => {
    it('should update creature in list on success', () => {
      (beasteryPortMock.listCreatures as any).mockReturnValue(
        of({ creatures: [mockCreature], total: 1 })
      );
      useCase.loadCreatures().subscribe();

      const updated = { ...mockCreature, name: 'Hobgoblin', hitPoints: 11 };
      (beasteryPortMock.updateCreature as any).mockReturnValue(of(updated));

      useCase.updateCreature('creature-123', {
        name: 'Hobgoblin',
        hitPoints: 11,
        armorClass: 15
      }).subscribe(() => {
        expect(useCase.creatures()[0].name).toBe('Hobgoblin');
        expect(useCase.creatures()[0].hitPoints).toBe(11);
      });
    });
  });

  describe('deleteCreature', () => {
    it('should remove creature from list on success', () => {
      (beasteryPortMock.listCreatures as any).mockReturnValue(
        of({ creatures: [mockCreature], total: 1 })
      );
      useCase.loadCreatures().subscribe();

      (beasteryPortMock.deleteCreature as any).mockReturnValue(of(undefined));

      useCase.deleteCreature('creature-123').subscribe(() => {
        expect(useCase.creatures()).toEqual([]);
      });
    });
  });

  describe('duplicateCreature', () => {
    it('should add duplicated creature to list on success', () => {
      const duplicated = { ...mockCreature, creatureId: 'creature-456', name: 'Goblin Copy' };
      (beasteryPortMock.duplicateCreature as any).mockReturnValue(of(duplicated));

      useCase.duplicateCreature('creature-123').subscribe(() => {
        expect(useCase.creatures()).toContainEqual(duplicated);
      });
    });

    it('should pass custom name when provided', () => {
      const duplicated = { ...mockCreature, creatureId: 'creature-456', name: 'Elite Goblin' };
      (beasteryPortMock.duplicateCreature as any).mockReturnValue(of(duplicated));

      useCase.duplicateCreature('creature-123', 'Elite Goblin').subscribe(() => {
        expect(beasteryPortMock.duplicateCreature).toHaveBeenCalledWith('creature-123', { name: 'Elite Goblin' });
      });
    });
  });

  describe('clearError', () => {
    it('should clear error signal', () => {
      (beasteryPortMock.listCreatures as any).mockReturnValue(
        throwError(() => new Error('Test error'))
      );

      useCase.loadCreatures().subscribe({
        error: () => {
          expect(useCase.error()).toBe('Test error');
          useCase.clearError();
          expect(useCase.error()).toBe(null);
        }
      });
    });
  });
});

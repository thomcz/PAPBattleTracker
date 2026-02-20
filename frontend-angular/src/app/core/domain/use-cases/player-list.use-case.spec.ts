import { TestBed } from '@angular/core/testing';
import { vi, expect, describe, it, beforeEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { PlayerListUseCase } from './player-list.use-case';
import { PlayerPort } from '../../ports/player.port';
import { Player } from '../models/player.model';

describe('PlayerListUseCase', () => {
  let useCase: PlayerListUseCase;
  let playerPortMock: PlayerPort;

  const mockPlayer: Player = {
    playerId: 'player-123',
    name: 'Thorin',
    characterClass: 'Fighter',
    level: 5,
    maxHp: 45,
    isDeleted: false,
    createdAt: '2026-01-01T00:00:00Z',
    lastModified: '2026-01-01T00:00:00Z'
  };

  beforeEach(() => {
    playerPortMock = {
      createPlayer: vi.fn(),
      listPlayers: vi.fn(),
      getPlayer: vi.fn(),
      updatePlayer: vi.fn(),
      deletePlayer: vi.fn()
    } as unknown as PlayerPort;

    TestBed.configureTestingModule({
      providers: [
        PlayerListUseCase,
        { provide: PlayerPort, useValue: playerPortMock }
      ]
    });
    useCase = TestBed.inject(PlayerListUseCase);
  });

  it('should be created', () => {
    expect(useCase).toBeTruthy();
  });

  it('should have initial empty players list', () => {
    expect(useCase.players()).toEqual([]);
  });

  it('should have initial loading state as false', () => {
    expect(useCase.isLoading()).toBe(false);
  });

  it('should have initial error state as null', () => {
    expect(useCase.error()).toBe(null);
  });

  describe('loadPlayers', () => {
    it('should load players and update signal', () => {
      (playerPortMock.listPlayers as any).mockReturnValue(
        of({ players: [mockPlayer], total: 1 })
      );

      useCase.loadPlayers().subscribe(() => {
        expect(useCase.players()).toEqual([mockPlayer]);
        expect(useCase.isLoading()).toBe(false);
      });
    });

    it('should set error on failure', () => {
      (playerPortMock.listPlayers as any).mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      useCase.loadPlayers().subscribe({
        error: () => {
          expect(useCase.isLoading()).toBe(false);
          expect(useCase.error()).toBe('Network error');
        }
      });
    });
  });

  describe('createPlayer', () => {
    it('should add player to list on success', () => {
      (playerPortMock.createPlayer as any).mockReturnValue(of(mockPlayer));

      useCase.createPlayer({
        name: 'Thorin',
        characterClass: 'Fighter',
        level: 5,
        maxHp: 45
      }).subscribe(() => {
        expect(useCase.players()).toContainEqual(mockPlayer);
        expect(useCase.isLoading()).toBe(false);
      });
    });

    it('should set error on failure', () => {
      (playerPortMock.createPlayer as any).mockReturnValue(
        throwError(() => new Error('Create failed'))
      );

      useCase.createPlayer({
        name: 'Thorin',
        characterClass: 'Fighter',
        level: 5,
        maxHp: 45
      }).subscribe({
        error: () => {
          expect(useCase.error()).toBe('Create failed');
        }
      });
    });
  });

  describe('updatePlayer', () => {
    it('should update player in list on success', () => {
      // Pre-populate
      (playerPortMock.listPlayers as any).mockReturnValue(
        of({ players: [mockPlayer], total: 1 })
      );
      useCase.loadPlayers().subscribe();

      const updated = { ...mockPlayer, name: 'Thorin II', level: 6 };
      (playerPortMock.updatePlayer as any).mockReturnValue(of(updated));

      useCase.updatePlayer('player-123', {
        name: 'Thorin II',
        characterClass: 'Fighter',
        level: 6,
        maxHp: 45
      }).subscribe(() => {
        expect(useCase.players()[0].name).toBe('Thorin II');
        expect(useCase.players()[0].level).toBe(6);
      });
    });
  });

  describe('deletePlayer', () => {
    it('should remove player from list on success', () => {
      // Pre-populate
      (playerPortMock.listPlayers as any).mockReturnValue(
        of({ players: [mockPlayer], total: 1 })
      );
      useCase.loadPlayers().subscribe();

      (playerPortMock.deletePlayer as any).mockReturnValue(of(undefined));

      useCase.deletePlayer('player-123').subscribe(() => {
        expect(useCase.players()).toEqual([]);
      });
    });
  });

  describe('clearError', () => {
    it('should clear error signal', () => {
      (playerPortMock.listPlayers as any).mockReturnValue(
        throwError(() => new Error('Test error'))
      );

      useCase.loadPlayers().subscribe({
        error: () => {
          expect(useCase.error()).toBe('Test error');
          useCase.clearError();
          expect(useCase.error()).toBe(null);
        }
      });
    });
  });
});

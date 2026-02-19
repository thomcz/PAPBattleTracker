import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpParams } from '@angular/common/http';
import { vi } from 'vitest';
import { of } from 'rxjs';
import { BattleApiAdapter } from './battle-api.adapter';
import { Battle, BattleSummary, CombatStatus, CreatureType } from '../../core/domain/models/battle.model';
import { CombatOutcome } from '../../core/ports/battle.port';

describe('BattleApiAdapter', () => {
  let adapter: BattleApiAdapter;
  let httpClient: HttpClient;

  const mockBattle: Battle = {
    id: 'battle-123',
    name: 'Dragon\'s Lair',
    status: CombatStatus.NOT_STARTED,
    creatures: [
      {
        id: 'creature-1',
        name: 'Dragon',
        type: CreatureType.MONSTER,
        currentHp: 100,
        maxHp: 100,
        initiative: 15,
        armorClass: 20,
        isDefeated: false,
        effects: []
      }
    ],
    currentTurn: 0,
    round: 0,
    createdAt: '2024-01-01T10:00:00Z',
    lastModified: '2024-01-01T11:00:00Z'
  };

  const mockBattleSummaries: BattleSummary[] = [
    {
      id: 'battle-1',
      name: 'Battle 1',
      status: CombatStatus.NOT_STARTED,
      createdAt: '2024-01-01T10:00:00Z',
      lastModified: '2024-01-01T10:00:00Z'
    },
    {
      id: 'battle-2',
      name: 'Battle 2',
      status: CombatStatus.ACTIVE,
      createdAt: '2024-01-02T10:00:00Z',
      lastModified: '2024-01-02T11:00:00Z'
    }
  ];

  beforeEach(() => {
    const httpClientMock = {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn()
    } as unknown as HttpClient;

    TestBed.configureTestingModule({
      providers: [
        BattleApiAdapter,
        { provide: HttpClient, useValue: httpClientMock }
      ]
    });

    adapter = TestBed.inject(BattleApiAdapter);
    httpClient = TestBed.inject(HttpClient);
  });

  describe('createBattle', () => {
    it('should send POST request to create battle', () => {
      const name = 'Dragon\'s Lair';
      (httpClient.post as ReturnType<typeof vi.fn>).mockReturnValue(of(mockBattle));

      adapter.createBattle(name).subscribe((result) => {
        expect(httpClient.post).toHaveBeenCalledWith(
          'http://localhost:8080/api/battles',
          { name }
        );
        expect(result).toEqual(mockBattle);
      });
    });
  });

  describe('listBattles', () => {
    it('should send GET request to list all battles', () => {
      (httpClient.get as ReturnType<typeof vi.fn>).mockReturnValue(
        of({ battles: mockBattleSummaries })
      );

      adapter.listBattles().subscribe((result) => {
        expect(httpClient.get).toHaveBeenCalledWith(
          'http://localhost:8080/api/battles',
          { params: expect.any(HttpParams) }
        );
        expect(result).toEqual(mockBattleSummaries);
      });
    });

    it('should send GET request with status filter', () => {
      (httpClient.get as ReturnType<typeof vi.fn>).mockReturnValue(
        of({ battles: mockBattleSummaries })
      );

      adapter.listBattles(CombatStatus.ACTIVE).subscribe((result) => {
        const call = (httpClient.get as ReturnType<typeof vi.fn>).mock.calls[0];
        const params: HttpParams = call[1].params;

        expect(params.get('status')).toBe(CombatStatus.ACTIVE);
        expect(result).toEqual(mockBattleSummaries);
      });
    });

    it('should extract battles from response wrapper', () => {
      (httpClient.get as ReturnType<typeof vi.fn>).mockReturnValue(
        of({ battles: mockBattleSummaries })
      );

      adapter.listBattles().subscribe((result) => {
        expect(result).toEqual(mockBattleSummaries);
        expect(Array.isArray(result)).toBe(true);
      });
    });
  });

  describe('getBattle', () => {
    it('should send GET request to retrieve battle by ID', () => {
      (httpClient.get as ReturnType<typeof vi.fn>).mockReturnValue(of(mockBattle));

      adapter.getBattle('battle-123').subscribe((result) => {
        expect(httpClient.get).toHaveBeenCalledWith(
          'http://localhost:8080/api/battles/battle-123'
        );
        expect(result).toEqual(mockBattle);
      });
    });
  });

  describe('startCombat', () => {
    it('should send POST request to start combat', () => {
      const activeBattle = { ...mockBattle, status: CombatStatus.ACTIVE };
      (httpClient.post as ReturnType<typeof vi.fn>).mockReturnValue(of(activeBattle));

      adapter.startCombat('battle-123').subscribe((result) => {
        expect(httpClient.post).toHaveBeenCalledWith(
          'http://localhost:8080/api/battles/battle-123/start',
          {}
        );
        expect(result.status).toBe(CombatStatus.ACTIVE);
      });
    });
  });

  describe('pauseCombat', () => {
    it('should send POST request to pause combat', () => {
      const pausedBattle = { ...mockBattle, status: CombatStatus.PAUSED };
      (httpClient.post as ReturnType<typeof vi.fn>).mockReturnValue(of(pausedBattle));

      adapter.pauseCombat('battle-123').subscribe((result) => {
        expect(httpClient.post).toHaveBeenCalledWith(
          'http://localhost:8080/api/battles/battle-123/pause',
          {}
        );
        expect(result.status).toBe(CombatStatus.PAUSED);
      });
    });
  });

  describe('resumeCombat', () => {
    it('should send POST request to resume combat', () => {
      const activeBattle = { ...mockBattle, status: CombatStatus.ACTIVE };
      (httpClient.post as ReturnType<typeof vi.fn>).mockReturnValue(of(activeBattle));

      adapter.resumeCombat('battle-123').subscribe((result) => {
        expect(httpClient.post).toHaveBeenCalledWith(
          'http://localhost:8080/api/battles/battle-123/resume',
          {}
        );
        expect(result.status).toBe(CombatStatus.ACTIVE);
      });
    });
  });

  describe('endCombat', () => {
    it('should send POST request to end combat with outcome', () => {
      const endedBattle = { ...mockBattle, status: CombatStatus.ENDED };
      (httpClient.post as ReturnType<typeof vi.fn>).mockReturnValue(of(endedBattle));

      adapter.endCombat('battle-123', CombatOutcome.PLAYERS_VICTORIOUS).subscribe((result) => {
        expect(httpClient.post).toHaveBeenCalledWith(
          'http://localhost:8080/api/battles/battle-123/end',
          { outcome: CombatOutcome.PLAYERS_VICTORIOUS }
        );
        expect(result.status).toBe(CombatStatus.ENDED);
      });
    });

    it('should handle different combat outcomes', () => {
      const endedBattle = { ...mockBattle, status: CombatStatus.ENDED };
      (httpClient.post as ReturnType<typeof vi.fn>).mockReturnValue(of(endedBattle));

      adapter.endCombat('battle-123', CombatOutcome.PLAYERS_DEFEATED).subscribe(() => {
        expect(httpClient.post).toHaveBeenCalledWith(
          'http://localhost:8080/api/battles/battle-123/end',
          { outcome: CombatOutcome.PLAYERS_DEFEATED }
        );
      });
    });
  });

  describe('advanceTurn', () => {
    it('should send POST request to advance turn', () => {
      const updatedBattle = { ...mockBattle, currentTurn: 1 };
      (httpClient.post as ReturnType<typeof vi.fn>).mockReturnValue(of(updatedBattle));

      adapter.advanceTurn('battle-123').subscribe((result) => {
        expect(httpClient.post).toHaveBeenCalledWith(
          'http://localhost:8080/api/battles/battle-123/turn',
          {}
        );
        expect(result.currentTurn).toBe(1);
      });
    });
  });

  describe('deleteBattle', () => {
    it('should send DELETE request to remove battle', () => {
      (httpClient.delete as ReturnType<typeof vi.fn>).mockReturnValue(of(undefined));

      adapter.deleteBattle('battle-123').subscribe(() => {
        expect(httpClient.delete).toHaveBeenCalledWith(
          'http://localhost:8080/api/battles/battle-123'
        );
      });
    });
  });
});

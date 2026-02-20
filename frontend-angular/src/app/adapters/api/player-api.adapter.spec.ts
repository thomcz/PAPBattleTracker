import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PlayerApiAdapter } from './player-api.adapter';
import { Player } from '../../core/domain/models/player.model';

describe('PlayerApiAdapter', () => {
  let adapter: PlayerApiAdapter;
  let httpMock: HttpTestingController;

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
    TestBed.configureTestingModule({
      providers: [
        PlayerApiAdapter,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    adapter = TestBed.inject(PlayerApiAdapter);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(adapter).toBeTruthy();
  });

  describe('createPlayer', () => {
    it('should POST to /api/players', () => {
      const request = { name: 'Thorin', characterClass: 'Fighter', level: 5, maxHp: 45 };

      adapter.createPlayer(request).subscribe(player => {
        expect(player).toEqual(mockPlayer);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/players');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockPlayer);
    });
  });

  describe('listPlayers', () => {
    it('should GET /api/players', () => {
      adapter.listPlayers().subscribe(response => {
        expect(response.players).toEqual([mockPlayer]);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/players');
      expect(req.request.method).toBe('GET');
      req.flush({ players: [mockPlayer], total: 1 });
    });

    it('should include includeDeleted param when true', () => {
      adapter.listPlayers(true).subscribe();

      const req = httpMock.expectOne('http://localhost:8080/api/players?includeDeleted=true');
      expect(req.request.method).toBe('GET');
      req.flush({ players: [], total: 0 });
    });
  });

  describe('getPlayer', () => {
    it('should GET /api/players/:id', () => {
      adapter.getPlayer('player-123').subscribe(player => {
        expect(player).toEqual(mockPlayer);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/players/player-123');
      expect(req.request.method).toBe('GET');
      req.flush(mockPlayer);
    });
  });

  describe('updatePlayer', () => {
    it('should PUT to /api/players/:id', () => {
      const request = { name: 'Thorin II', characterClass: 'Paladin', level: 6, maxHp: 50 };

      adapter.updatePlayer('player-123', request).subscribe(player => {
        expect(player.name).toBe('Thorin II');
      });

      const req = httpMock.expectOne('http://localhost:8080/api/players/player-123');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush({ ...mockPlayer, ...request });
    });
  });

  describe('deletePlayer', () => {
    it('should DELETE /api/players/:id', () => {
      adapter.deletePlayer('player-123').subscribe();

      const req = httpMock.expectOne('http://localhost:8080/api/players/player-123');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});

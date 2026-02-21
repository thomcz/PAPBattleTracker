import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';
import { BeasteryApiAdapter } from './beastery-api.adapter';
import { HttpClientPort } from '../../core/ports/http-client.port';
import { BeasteryCreature } from '../../core/domain/models/beastery-creature.model';

describe('BeasteryApiAdapter', () => {
  let adapter: BeasteryApiAdapter;
  let httpMock: HttpClientPort;

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
    httpMock = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    } as HttpClientPort;

    TestBed.configureTestingModule({
      providers: [
        BeasteryApiAdapter,
        { provide: HttpClientPort, useValue: httpMock }
      ]
    });
    adapter = TestBed.inject(BeasteryApiAdapter);
  });

  it('should be created', () => {
    expect(adapter).toBeTruthy();
  });

  describe('createCreature', () => {
    it('should POST to /api/beastery/creatures', () => {
      const request = { name: 'Goblin', hitPoints: 7, armorClass: 15 };
      (httpMock.post as any).mockReturnValue(of(mockCreature));

      adapter.createCreature(request).subscribe(creature => {
        expect(creature).toEqual(mockCreature);
      });

      expect(httpMock.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/beastery/creatures',
        request
      );
    });
  });

  describe('listCreatures', () => {
    it('should GET /api/beastery/creatures', () => {
      const response = { creatures: [mockCreature], total: 1 };
      (httpMock.get as any).mockReturnValue(of(response));

      adapter.listCreatures().subscribe(result => {
        expect(result.creatures).toEqual([mockCreature]);
      });

      expect(httpMock.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/beastery/creatures'
      );
    });

    it('should include includeDeleted param when true', () => {
      (httpMock.get as any).mockReturnValue(of({ creatures: [], total: 0 }));

      adapter.listCreatures(true).subscribe();

      expect(httpMock.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/beastery/creatures?includeDeleted=true'
      );
    });
  });

  describe('getCreature', () => {
    it('should GET /api/beastery/creatures/:id', () => {
      (httpMock.get as any).mockReturnValue(of(mockCreature));

      adapter.getCreature('creature-123').subscribe(creature => {
        expect(creature).toEqual(mockCreature);
      });

      expect(httpMock.get).toHaveBeenCalledWith(
        'http://localhost:8080/api/beastery/creatures/creature-123'
      );
    });
  });

  describe('updateCreature', () => {
    it('should PUT to /api/beastery/creatures/:id', () => {
      const request = { name: 'Hobgoblin', hitPoints: 11, armorClass: 18 };
      const updated = { ...mockCreature, ...request };
      (httpMock.put as any).mockReturnValue(of(updated));

      adapter.updateCreature('creature-123', request).subscribe(creature => {
        expect(creature.name).toBe('Hobgoblin');
      });

      expect(httpMock.put).toHaveBeenCalledWith(
        'http://localhost:8080/api/beastery/creatures/creature-123',
        request
      );
    });
  });

  describe('deleteCreature', () => {
    it('should DELETE /api/beastery/creatures/:id', () => {
      (httpMock.delete as any).mockReturnValue(of(null));

      adapter.deleteCreature('creature-123').subscribe();

      expect(httpMock.delete).toHaveBeenCalledWith(
        'http://localhost:8080/api/beastery/creatures/creature-123'
      );
    });
  });

  describe('duplicateCreature', () => {
    it('should POST to /api/beastery/creatures/:id/duplicate', () => {
      const duplicated = { ...mockCreature, creatureId: 'creature-456', name: 'Goblin Copy' };
      (httpMock.post as any).mockReturnValue(of(duplicated));

      adapter.duplicateCreature('creature-123').subscribe(creature => {
        expect(creature).toEqual(duplicated);
      });

      expect(httpMock.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/beastery/creatures/creature-123/duplicate',
        {}
      );
    });

    it('should send custom name in request body', () => {
      const duplicated = { ...mockCreature, name: 'Elite Goblin' };
      (httpMock.post as any).mockReturnValue(of(duplicated));

      adapter.duplicateCreature('creature-123', { name: 'Elite Goblin' }).subscribe();

      expect(httpMock.post).toHaveBeenCalledWith(
        'http://localhost:8080/api/beastery/creatures/creature-123/duplicate',
        { name: 'Elite Goblin' }
      );
    });
  });
});

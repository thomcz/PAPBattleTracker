import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BeasteryApiAdapter } from './beastery-api.adapter';
import { BeasteryCreature } from '../../core/domain/models/beastery-creature.model';

describe('BeasteryApiAdapter', () => {
  let adapter: BeasteryApiAdapter;
  let httpMock: HttpTestingController;

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
    TestBed.configureTestingModule({
      providers: [
        BeasteryApiAdapter,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    adapter = TestBed.inject(BeasteryApiAdapter);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(adapter).toBeTruthy();
  });

  describe('createCreature', () => {
    it('should POST to /api/beastery/creatures', () => {
      const request = { name: 'Goblin', hitPoints: 7, armorClass: 15 };

      adapter.createCreature(request).subscribe(creature => {
        expect(creature).toEqual(mockCreature);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/beastery/creatures');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);
      req.flush(mockCreature);
    });
  });

  describe('listCreatures', () => {
    it('should GET /api/beastery/creatures', () => {
      adapter.listCreatures().subscribe(response => {
        expect(response.creatures).toEqual([mockCreature]);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/beastery/creatures');
      expect(req.request.method).toBe('GET');
      req.flush({ creatures: [mockCreature], total: 1 });
    });

    it('should include includeDeleted param when true', () => {
      adapter.listCreatures(true).subscribe();

      const req = httpMock.expectOne('http://localhost:8080/api/beastery/creatures?includeDeleted=true');
      expect(req.request.method).toBe('GET');
      req.flush({ creatures: [], total: 0 });
    });
  });

  describe('getCreature', () => {
    it('should GET /api/beastery/creatures/:id', () => {
      adapter.getCreature('creature-123').subscribe(creature => {
        expect(creature).toEqual(mockCreature);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/beastery/creatures/creature-123');
      expect(req.request.method).toBe('GET');
      req.flush(mockCreature);
    });
  });

  describe('updateCreature', () => {
    it('should PUT to /api/beastery/creatures/:id', () => {
      const request = { name: 'Hobgoblin', hitPoints: 11, armorClass: 18 };

      adapter.updateCreature('creature-123', request).subscribe(creature => {
        expect(creature.name).toBe('Hobgoblin');
      });

      const req = httpMock.expectOne('http://localhost:8080/api/beastery/creatures/creature-123');
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(request);
      req.flush({ ...mockCreature, ...request });
    });
  });

  describe('deleteCreature', () => {
    it('should DELETE /api/beastery/creatures/:id', () => {
      adapter.deleteCreature('creature-123').subscribe();

      const req = httpMock.expectOne('http://localhost:8080/api/beastery/creatures/creature-123');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('duplicateCreature', () => {
    it('should POST to /api/beastery/creatures/:id/duplicate', () => {
      const duplicated = { ...mockCreature, creatureId: 'creature-456', name: 'Goblin Copy' };

      adapter.duplicateCreature('creature-123').subscribe(creature => {
        expect(creature).toEqual(duplicated);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/beastery/creatures/creature-123/duplicate');
      expect(req.request.method).toBe('POST');
      req.flush(duplicated);
    });

    it('should send custom name in request body', () => {
      adapter.duplicateCreature('creature-123', { name: 'Elite Goblin' }).subscribe();

      const req = httpMock.expectOne('http://localhost:8080/api/beastery/creatures/creature-123/duplicate');
      expect(req.request.body).toEqual({ name: 'Elite Goblin' });
      req.flush({ ...mockCreature, name: 'Elite Goblin' });
    });
  });
});

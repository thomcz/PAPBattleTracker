import {TestBed} from '@angular/core/testing';
import {vi} from 'vitest';
import {of, throwError} from 'rxjs';
import {SessionDetailUseCase} from './session-detail.use-case';
import {SessionPort} from '../../ports/session.port';
import {SessionDetail, SessionStatus} from '../models/session.model';
import {CombatStatus} from '../models/battle.model';

describe('SessionDetailUseCase', () => {
  let useCase: SessionDetailUseCase;
  let sessionPortMock: SessionPort;

  const mockSession: SessionDetail = {
    sessionId: 'session-1',
    name: 'Friday Night Game',
    status: SessionStatus.PLANNED,
    battles: [],
    createdAt: '2026-01-01T00:00:00Z',
    lastModified: '2026-01-01T00:00:00Z'
  };

  beforeEach(() => {
    sessionPortMock = {
      createSession: vi.fn(),
      listSessions: vi.fn(),
      getSession: vi.fn(),
      startSession: vi.fn(),
      finishSession: vi.fn(),
      renameSession: vi.fn(),
      deleteSession: vi.fn(),
      createBattleInSession: vi.fn()
    } as unknown as SessionPort;

    TestBed.configureTestingModule({
      providers: [
        SessionDetailUseCase,
        {provide: SessionPort, useValue: sessionPortMock}
      ]
    });
    useCase = TestBed.inject(SessionDetailUseCase);
  });

  it('should be created', () => {
    expect(useCase).toBeTruthy();
  });

  describe('loadSession', () => {
    it('should load session and update signal', () => {
      vi.spyOn(sessionPortMock, 'getSession').mockReturnValue(of(mockSession));

      useCase.loadSession('session-1');

      expect(useCase.session()).toEqual(mockSession);
      expect(useCase.loading()).toBe(false);
      expect(useCase.error()).toBeNull();
    });

    it('should handle error when loading session fails', () => {
      vi.spyOn(sessionPortMock, 'getSession').mockReturnValue(throwError(() => new Error('Not found')));

      useCase.loadSession('session-1');

      expect(useCase.error()).toBe('Failed to load session. Please try again.');
      expect(useCase.loading()).toBe(false);
      expect(useCase.session()).toBeNull();
    });
  });

  describe('createBattle', () => {
    it('should create battle and add to session battles', () => {
      vi.spyOn(sessionPortMock, 'getSession').mockReturnValue(of(mockSession));
      useCase.loadSession('session-1');

      const newBattle = {
        id: 'battle-1',
        name: 'Dragon Fight',
        status: CombatStatus.NOT_STARTED,
        createdAt: '2026-01-02T00:00:00Z',
        lastModified: '2026-01-02T00:00:00Z'
      };
      vi.spyOn(sessionPortMock, 'createBattleInSession').mockReturnValue(of(newBattle));

      useCase.createBattle('session-1', 'Dragon Fight').subscribe();

      expect(useCase.session()?.battles).toHaveLength(1);
      expect(useCase.session()?.battles[0].name).toBe('Dragon Fight');
    });
  });
});

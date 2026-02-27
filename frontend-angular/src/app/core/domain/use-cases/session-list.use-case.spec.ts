import {TestBed} from '@angular/core/testing';
import {vi} from 'vitest';
import {of, throwError} from 'rxjs';
import {SessionListUseCase} from './session-list.use-case';
import {SessionPort} from '../../ports/session.port';
import {SessionStatus, SessionSummary} from '../models/session.model';

describe('SessionListUseCase', () => {
  let useCase: SessionListUseCase;
  let sessionPortMock: SessionPort;

  const mockSessions: SessionSummary[] = [
    {
      sessionId: '1',
      name: 'Friday Night Game',
      status: SessionStatus.PLANNED,
      battleCount: 0,
      createdAt: '2026-01-01T00:00:00Z',
      lastModified: '2026-01-01T00:00:00Z'
    },
    {
      sessionId: '2',
      name: 'Saturday Campaign',
      status: SessionStatus.STARTED,
      battleCount: 3,
      createdAt: '2026-01-02T00:00:00Z',
      lastModified: '2026-01-02T00:00:00Z'
    }
  ];

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
        SessionListUseCase,
        {provide: SessionPort, useValue: sessionPortMock}
      ]
    });
    useCase = TestBed.inject(SessionListUseCase);
  });

  it('should be created', () => {
    expect(useCase).toBeTruthy();
  });

  describe('loadSessions', () => {
    it('should load sessions and update signal', () => {
      vi.spyOn(sessionPortMock, 'listSessions').mockReturnValue(of(mockSessions));

      useCase.loadSessions();

      expect(useCase.sessions()).toEqual(mockSessions);
      expect(useCase.loading()).toBe(false);
      expect(useCase.error()).toBeNull();
      expect(useCase.sessionCount()).toBe(2);
    });

    it('should set loading while fetching', () => {
      vi.spyOn(sessionPortMock, 'listSessions').mockReturnValue(of(mockSessions));

      expect(useCase.loading()).toBe(false);
      useCase.loadSessions();
      expect(useCase.loading()).toBe(false); // resolved synchronously in test
    });

    it('should handle error when loading sessions fails', () => {
      vi.spyOn(sessionPortMock, 'listSessions').mockReturnValue(throwError(() => new Error('Network error')));

      useCase.loadSessions();

      expect(useCase.error()).toBe('Failed to load sessions. Please try again.');
      expect(useCase.loading()).toBe(false);
      expect(useCase.sessions()).toEqual([]);
    });

    it('should pass status filter to port', () => {
      vi.spyOn(sessionPortMock, 'listSessions').mockReturnValue(of([]));

      useCase.loadSessions('PLANNED');

      expect(sessionPortMock.listSessions).toHaveBeenCalledWith('PLANNED');
    });
  });

  describe('createSession', () => {
    it('should create session and add to list', () => {
      const response = {
        sessionId: '3',
        name: 'New Session',
        status: SessionStatus.PLANNED,
        createdAt: '2026-01-03T00:00:00Z',
        lastModified: '2026-01-03T00:00:00Z'
      };

      vi.spyOn(sessionPortMock, 'createSession').mockReturnValue(of(response));

      useCase.createSession({name: 'New Session'}).subscribe(result => {
        expect(result.sessionId).toBe('3');
        expect(result.name).toBe('New Session');
      });

      expect(useCase.sessions().length).toBe(1);
      expect(useCase.sessions()[0].name).toBe('New Session');
      expect(useCase.sessions()[0].battleCount).toBe(0);
    });

    it('should handle error when creating session fails', () => {
      vi.spyOn(sessionPortMock, 'createSession').mockReturnValue(throwError(() => new Error('Server error')));

      useCase.createSession({name: 'Failing Session'}).subscribe({
        error: () => {
          // expected
        }
      });

      expect(useCase.error()).toBe('Failed to create session. Please try again.');
      expect(useCase.loading()).toBe(false);
    });
  });
});

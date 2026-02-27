import { Observable } from 'rxjs';
import {
  CreateSessionRequest,
  RenameSessionRequest,
  SessionDetail,
  SessionResponse,
  SessionSummary
} from '../domain/models/session.model';
import { BattleSummary } from '../domain/models/battle.model';

export abstract class SessionPort {
  abstract createSession(request: CreateSessionRequest): Observable<SessionResponse>;
  abstract listSessions(status?: string): Observable<SessionSummary[]>;
  abstract getSession(sessionId: string): Observable<SessionDetail>;
  abstract startSession(sessionId: string): Observable<SessionResponse>;
  abstract finishSession(sessionId: string): Observable<SessionResponse>;
  abstract renameSession(sessionId: string, request: RenameSessionRequest): Observable<SessionResponse>;
  abstract deleteSession(sessionId: string): Observable<void>;
  abstract createBattleInSession(sessionId: string, request: { name: string }): Observable<BattleSummary>;
}

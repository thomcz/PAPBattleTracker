import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionPort } from '../../core/ports/session.port';
import {
  CreateSessionRequest,
  RenameSessionRequest,
  SessionDetail,
  SessionResponse,
  SessionSummary
} from '../../core/domain/models/session.model';
import { BattleSummary } from '../../core/domain/models/battle.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SessionApiAdapter extends SessionPort {
  private readonly apiUrl = `${environment.apiUrl}/sessions`;

  constructor(private http: HttpClient) {
    super();
  }

  createSession(request: CreateSessionRequest): Observable<SessionResponse> {
    return this.http.post<SessionResponse>(this.apiUrl, request);
  }

  listSessions(status?: string): Observable<SessionSummary[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<SessionSummary[]>(this.apiUrl, { params });
  }

  getSession(sessionId: string): Observable<SessionDetail> {
    return this.http.get<SessionDetail>(`${this.apiUrl}/${sessionId}`);
  }

  startSession(sessionId: string): Observable<SessionResponse> {
    return this.http.post<SessionResponse>(`${this.apiUrl}/${sessionId}/start`, {});
  }

  finishSession(sessionId: string): Observable<SessionResponse> {
    return this.http.post<SessionResponse>(`${this.apiUrl}/${sessionId}/finish`, {});
  }

  renameSession(sessionId: string, request: RenameSessionRequest): Observable<SessionResponse> {
    return this.http.put<SessionResponse>(`${this.apiUrl}/${sessionId}`, request);
  }

  deleteSession(sessionId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${sessionId}`);
  }

  createBattleInSession(sessionId: string, request: { name: string }): Observable<BattleSummary> {
    return this.http.post<BattleSummary>(`${this.apiUrl}/${sessionId}/battles`, request);
  }
}

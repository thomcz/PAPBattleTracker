import {computed, Injectable, signal} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {SessionPort} from '../../ports/session.port';
import {
  CreateSessionRequest,
  SessionResponse,
  SessionSummary
} from '../models/session.model';

@Injectable({
  providedIn: 'root',
})
export class SessionListUseCase {

  private readonly sessionsSignal = signal<SessionSummary[]>([]);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  public sessions = this.sessionsSignal.asReadonly();
  public loading = this.loadingSignal.asReadonly();
  public error = this.errorSignal.asReadonly();

  public sessionCount = computed(() => this.sessionsSignal().length);

  constructor(private readonly sessionPort: SessionPort) {}

  loadSessions(status?: string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.sessionPort.listSessions(status).subscribe({
      next: (sessions) => {
        this.sessionsSignal.set(sessions);
        this.loadingSignal.set(false);
      },
      error: () => {
        this.errorSignal.set('Failed to load sessions. Please try again.');
        this.loadingSignal.set(false);
      }
    });
  }

  deleteSession(sessionId: string): Observable<void> {
    return this.sessionPort.deleteSession(sessionId).pipe(
      tap({
        next: () => {
          this.sessionsSignal.update(sessions => sessions.filter(s => s.sessionId !== sessionId));
        }
      })
    );
  }

  createSession(request: CreateSessionRequest): Observable<SessionResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.sessionPort.createSession(request).pipe(
      tap({
        next: (response) => {
          const summary: SessionSummary = {
            sessionId: response.sessionId,
            name: response.name,
            status: response.status,
            battleCount: 0,
            createdAt: response.createdAt,
            lastModified: response.lastModified
          };
          this.sessionsSignal.update(sessions => [...sessions, summary]);
          this.loadingSignal.set(false);
        },
        error: () => {
          this.errorSignal.set('Failed to create session. Please try again.');
          this.loadingSignal.set(false);
        }
      })
    );
  }
}

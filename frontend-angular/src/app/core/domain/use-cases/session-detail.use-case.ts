import {Injectable, signal} from '@angular/core';
import {Observable, map, tap} from 'rxjs';
import {SessionPort} from '../../ports/session.port';
import {BattleSummary} from '../models/battle.model';
import {SessionDetail} from '../models/session.model';

@Injectable({
  providedIn: 'root',
})
export class SessionDetailUseCase {

  private readonly sessionSignal = signal<SessionDetail | null>(null);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  public session = this.sessionSignal.asReadonly();
  public loading = this.loadingSignal.asReadonly();
  public error = this.errorSignal.asReadonly();

  constructor(private readonly sessionPort: SessionPort) {}

  loadSession(sessionId: string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.sessionPort.getSession(sessionId).subscribe({
      next: (session) => {
        this.sessionSignal.set(session);
        this.loadingSignal.set(false);
      },
      error: () => {
        this.errorSignal.set('Failed to load session. Please try again.');
        this.loadingSignal.set(false);
      }
    });
  }

  createBattle(sessionId: string, name: string): Observable<BattleSummary> {
    return this.sessionPort.createBattleInSession(sessionId, {name}).pipe(
      tap({
        next: (battle) => {
          this.sessionSignal.update(session => {
            if (!session) return session;
            return {
              ...session,
              battles: [...session.battles, {
                id: battle.id,
                name: battle.name,
                status: battle.status,
                createdAt: battle.createdAt,
                lastModified: battle.lastModified
              }]
            };
          });
        }
      })
    );
  }

  startSession(sessionId: string): Observable<void> {
    return this.sessionPort.startSession(sessionId).pipe(
      tap({
        next: (response) => {
          this.sessionSignal.update(session => {
            if (!session) return session;
            return {...session, status: response.status};
          });
        }
      }),
      map(() => undefined)
    );
  }

  finishSession(sessionId: string): Observable<void> {
    return this.sessionPort.finishSession(sessionId).pipe(
      tap({
        next: (response) => {
          this.sessionSignal.update(session => {
            if (!session) return session;
            return {...session, status: response.status};
          });
        }
      }),
      map(() => undefined)
    );
  }

  renameSession(sessionId: string, name: string): Observable<void> {
    return this.sessionPort.renameSession(sessionId, {name}).pipe(
      tap({
        next: (response) => {
          this.sessionSignal.update(session => {
            if (!session) return session;
            return {...session, name: response.name};
          });
        }
      }),
      map(() => undefined)
    );
  }

  deleteSession(sessionId: string): Observable<void> {
    return this.sessionPort.deleteSession(sessionId);
  }
}

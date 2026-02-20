import { Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { PlayerPort } from '../../ports/player.port';
import { CreatePlayerRequest, Player, PlayerListResponse, UpdatePlayerRequest } from '../models/player.model';

@Injectable({ providedIn: 'root' })
export class PlayerListUseCase {
  private readonly playersSignal = signal<Player[]>([]);
  public readonly players = this.playersSignal.asReadonly();

  private readonly isLoadingSignal = signal<boolean>(false);
  public readonly isLoading = this.isLoadingSignal.asReadonly();

  private readonly errorSignal = signal<string | null>(null);
  public readonly error = this.errorSignal.asReadonly();

  constructor(private readonly playerPort: PlayerPort) {}

  loadPlayers(): Observable<PlayerListResponse> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return this.playerPort.listPlayers(false).pipe(
      tap({
        next: (response) => {
          this.playersSignal.set(response.players);
          this.isLoadingSignal.set(false);
        },
        error: (err) => {
          this.isLoadingSignal.set(false);
          this.errorSignal.set(err.message || 'Failed to load players');
        }
      })
    );
  }

  createPlayer(request: CreatePlayerRequest): Observable<Player> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return this.playerPort.createPlayer(request).pipe(
      tap({
        next: (player) => {
          this.playersSignal.update(players => [...players, player]);
          this.isLoadingSignal.set(false);
        },
        error: (err) => {
          this.isLoadingSignal.set(false);
          this.errorSignal.set(err.message || 'Failed to create player');
        }
      })
    );
  }

  updatePlayer(playerId: string, request: UpdatePlayerRequest): Observable<Player> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return this.playerPort.updatePlayer(playerId, request).pipe(
      tap({
        next: (updated) => {
          this.playersSignal.update(players =>
            players.map(p => p.playerId === playerId ? updated : p)
          );
          this.isLoadingSignal.set(false);
        },
        error: (err) => {
          this.isLoadingSignal.set(false);
          this.errorSignal.set(err.message || 'Failed to update player');
        }
      })
    );
  }

  deletePlayer(playerId: string): Observable<void> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return this.playerPort.deletePlayer(playerId).pipe(
      tap({
        next: () => {
          this.playersSignal.update(players =>
            players.filter(p => p.playerId !== playerId)
          );
          this.isLoadingSignal.set(false);
        },
        error: (err) => {
          this.isLoadingSignal.set(false);
          this.errorSignal.set(err.message || 'Failed to delete player');
        }
      })
    );
  }

  clearError(): void {
    this.errorSignal.set(null);
  }
}

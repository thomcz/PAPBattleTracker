import { Observable } from 'rxjs';
import { CreatePlayerRequest, Player, PlayerListResponse, UpdatePlayerRequest } from '../domain/models/player.model';

export abstract class PlayerPort {
  abstract createPlayer(request: CreatePlayerRequest): Observable<Player>;
  abstract listPlayers(includeDeleted?: boolean): Observable<PlayerListResponse>;
  abstract getPlayer(playerId: string): Observable<Player>;
  abstract updatePlayer(playerId: string, request: UpdatePlayerRequest): Observable<Player>;
  abstract deletePlayer(playerId: string): Observable<void>;
}

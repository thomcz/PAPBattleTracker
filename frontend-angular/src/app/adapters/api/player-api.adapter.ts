import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PlayerPort } from '../../core/ports/player.port';
import { CreatePlayerRequest, Player, PlayerListResponse, UpdatePlayerRequest } from '../../core/domain/models/player.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PlayerApiAdapter extends PlayerPort {
  private readonly apiUrl = `${environment.apiUrl}/players`;

  constructor(private http: HttpClient) {
    super();
  }

  createPlayer(request: CreatePlayerRequest): Observable<Player> {
    return this.http.post<Player>(this.apiUrl, request);
  }

  listPlayers(includeDeleted = false): Observable<PlayerListResponse> {
    let params = new HttpParams();
    if (includeDeleted) {
      params = params.set('includeDeleted', 'true');
    }
    return this.http.get<PlayerListResponse>(this.apiUrl, { params });
  }

  getPlayer(playerId: string): Observable<Player> {
    return this.http.get<Player>(`${this.apiUrl}/${playerId}`);
  }

  updatePlayer(playerId: string, request: UpdatePlayerRequest): Observable<Player> {
    return this.http.put<Player>(`${this.apiUrl}/${playerId}`, request);
  }

  deletePlayer(playerId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${playerId}`);
  }
}

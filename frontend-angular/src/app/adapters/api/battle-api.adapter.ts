import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BattlePort, CombatOutcome } from '../../core/ports/battle.port';
import { Battle, BattleSummary, CombatStatus, Creature, CreatureType } from '../../core/domain/models/battle.model';
import { environment } from '../../../environments/environment';

/**
 * HTTP adapter implementing BattlePort.
 *
 * Communicates with backend REST API using HttpClient.
 * Converts between frontend models and API payloads.
 *
 * Per research.md: Returns Observables that can be converted to signals
 * in components using toSignal() for reactive UI updates.
 */
@Injectable({
  providedIn: 'root'
})
export class BattleApiAdapter implements BattlePort {
  private readonly apiUrl = `${environment.apiUrl}/battles`;

  constructor(private http: HttpClient) {}

  createBattle(name: string): Observable<Battle> {
    return this.http.post<Battle>(this.apiUrl, { name });
  }

  listBattles(status?: CombatStatus): Observable<BattleSummary[]> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<{ battles: BattleSummary[] }>(this.apiUrl, { params })
      .pipe(
        // Extract battles array from response wrapper
        map(response => response.battles)
      );
  }

  getBattle(battleId: string): Observable<Battle> {
    return this.http.get<Battle>(`${this.apiUrl}/${battleId}`);
  }

  startCombat(battleId: string): Observable<Battle> {
    return this.http.post<Battle>(`${this.apiUrl}/${battleId}/start`, {});
  }

  pauseCombat(battleId: string): Observable<Battle> {
    return this.http.post<Battle>(`${this.apiUrl}/${battleId}/pause`, {});
  }

  resumeCombat(battleId: string): Observable<Battle> {
    return this.http.post<Battle>(`${this.apiUrl}/${battleId}/resume`, {});
  }

  endCombat(battleId: string, outcome: CombatOutcome): Observable<Battle> {
    return this.http.post<Battle>(`${this.apiUrl}/${battleId}/end`, { outcome });
  }

  advanceTurn(battleId: string): Observable<Battle> {
    return this.http.post<Battle>(`${this.apiUrl}/${battleId}/next-turn`, {});
  }

  deleteBattle(battleId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${battleId}`);
  }

  addCreature(
    battleId: string,
    name: string,
    type: CreatureType,
    currentHp: number,
    maxHp: number,
    initiative: number,
    armorClass: number
  ): Observable<Creature> {
    return this.http.post<Creature>(`${this.apiUrl}/${battleId}/creatures`, {
      name,
      type,
      currentHp,
      maxHp,
      initiative,
      armorClass
    });
  }

  updateCreature(
    battleId: string,
    creatureId: string,
    name: string,
    currentHp: number,
    maxHp: number,
    initiative: number,
    armorClass: number
  ): Observable<Creature> {
    return this.http.put<Creature>(`${this.apiUrl}/${battleId}/creatures/${creatureId}`, {
      name,
      currentHp,
      maxHp,
      initiative,
      armorClass
    });
  }

  removeCreature(battleId: string, creatureId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${battleId}/creatures/${creatureId}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BattlePort, CombatLogResponse, CombatOutcome } from '../../core/ports/battle.port';
import { Battle, BattleSummary, CombatStatus, Creature, CreatureType } from '../../core/domain/models/battle.model';
import { environment } from '../../../environments/environment';

// Raw shape returned by the API (statusEffects instead of effects)
interface RawCreature extends Omit<Creature, 'effects'> {
  statusEffects?: string[];
}
interface RawBattle extends Omit<Battle, 'creatures'> {
  creatures: RawCreature[];
}

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

  private mapBattle(raw: RawBattle): Battle {
    return {
      ...raw,
      creatures: raw.creatures.map(c => ({
        ...c,
        effects: c.statusEffects ?? []
      }))
    };
  }

  createBattle(name: string): Observable<Battle> {
    return this.http.post<RawBattle>(this.apiUrl, { name }).pipe(map(r => this.mapBattle(r)));
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
    return this.http.get<RawBattle>(`${this.apiUrl}/${battleId}`).pipe(map(r => this.mapBattle(r)));
  }

  startCombat(battleId: string): Observable<Battle> {
    return this.http.post<RawBattle>(`${this.apiUrl}/${battleId}/start`, {}).pipe(map(r => this.mapBattle(r)));
  }

  pauseCombat(battleId: string): Observable<Battle> {
    return this.http.post<RawBattle>(`${this.apiUrl}/${battleId}/pause`, {}).pipe(map(r => this.mapBattle(r)));
  }

  resumeCombat(battleId: string): Observable<Battle> {
    return this.http.post<RawBattle>(`${this.apiUrl}/${battleId}/resume`, {}).pipe(map(r => this.mapBattle(r)));
  }

  endCombat(battleId: string, outcome: CombatOutcome): Observable<Battle> {
    return this.http.post<RawBattle>(`${this.apiUrl}/${battleId}/end`, { outcome }).pipe(map(r => this.mapBattle(r)));
  }

  advanceTurn(battleId: string): Observable<Battle> {
    return this.http.post<RawBattle>(`${this.apiUrl}/${battleId}/turn`, {}).pipe(map(r => this.mapBattle(r)));
  }

  applyDamage(battleId: string, creatureId: string, damage: number, source?: string): Observable<Battle> {
    return this.http.post<RawBattle>(`${this.apiUrl}/${battleId}/damage`, {
      creatureId,
      damage,
      source
    }).pipe(map(r => this.mapBattle(r)));
  }

  getCombatLog(battleId: string, limit: number = 100, offset: number = 0): Observable<CombatLogResponse> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());
    return this.http.get<CombatLogResponse>(`${this.apiUrl}/${battleId}/log`, { params });
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

  applyHealing(battleId: string, creatureId: string, healing: number, source?: string): Observable<Battle> {
    return this.http.post<RawBattle>(`${this.apiUrl}/${battleId}/heal`, { creatureId, healing, source }).pipe(map(r => this.mapBattle(r)));
  }

  applyStatusEffect(battleId: string, creatureId: string, effect: string, action: 'ADD' | 'REMOVE'): Observable<Battle> {
    return this.http.post<RawBattle>(`${this.apiUrl}/${battleId}/creatures/${creatureId}/effects`, { effect, action }).pipe(map(r => this.mapBattle(r)));
  }
}

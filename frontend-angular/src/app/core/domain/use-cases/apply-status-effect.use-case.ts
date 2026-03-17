import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BattlePort } from '../../ports/battle.port';
import { Battle } from '../models/battle.model';

@Injectable({
  providedIn: 'root',
})
export class ApplyStatusEffectUseCase {
  constructor(private readonly battlePort: BattlePort) {}

  execute(battleId: string, creatureId: string, effect: string, action: 'ADD' | 'REMOVE'): Observable<Battle> {
    return this.battlePort.applyStatusEffect(battleId, creatureId, effect, action);
  }
}

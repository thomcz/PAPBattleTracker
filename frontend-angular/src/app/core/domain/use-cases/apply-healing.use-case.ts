import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BattlePort } from '../../ports/battle.port';
import { Battle } from '../models/battle.model';

@Injectable({
  providedIn: 'root',
})
export class ApplyHealingUseCase {
  constructor(private readonly battlePort: BattlePort) {}

  execute(battleId: string, creatureId: string, healing: number, source?: string): Observable<Battle> {
    return this.battlePort.applyHealing(battleId, creatureId, healing, source);
  }
}

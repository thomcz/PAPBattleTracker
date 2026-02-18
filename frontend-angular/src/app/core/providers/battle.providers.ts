import { Provider } from '@angular/core';
import { BattlePort } from '../ports/battle.port';
import { BattleApiAdapter } from '../../adapters/api/battle-api.adapter';

export const battleProviders: Provider[] = [
  { provide: BattlePort, useClass: BattleApiAdapter }
];

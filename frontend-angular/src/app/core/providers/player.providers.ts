import { Provider } from '@angular/core';
import { PlayerPort } from '../ports/player.port';
import { PlayerApiAdapter } from '../../adapters/api/player-api.adapter';

export const playerProviders: Provider[] = [
  { provide: PlayerPort, useClass: PlayerApiAdapter }
];

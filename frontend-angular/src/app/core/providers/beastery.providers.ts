import { Provider } from '@angular/core';
import { BeasteryPort } from '../ports/beastery.port';
import { BeasteryApiAdapter } from '../../adapters/api/beastery-api.adapter';

export const beasteryProviders: Provider[] = [
  { provide: BeasteryPort, useClass: BeasteryApiAdapter }
];

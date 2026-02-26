import { Provider } from '@angular/core';
import { SessionPort } from '../ports/session.port';
import { SessionApiAdapter } from '../../adapters/api/session-api.adapter';

export const sessionProviders: Provider[] = [
  { provide: SessionPort, useClass: SessionApiAdapter }
];

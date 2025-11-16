import {Provider} from '@angular/core';
import {AuthPort} from '../ports/auth.port';
import {StoragePort} from '../ports/storage.port';
import {LocalStorageAdapter} from '../../adapters/storage/local-storage.adapter';
import {HttpClientPort} from '../ports/http-client.port';
import {AngularHttpAdapter} from '../../adapters/api/angular-http.adapter';
import {NavigationPort} from '../ports/navigation.port';
import {AngularRouterAdapter} from '../../adapters/navigation/angular-router.adapter';
import {Authentication} from '../../adapters/api/authentication';

export const authProviders: Provider[] = [
  {provide: AuthPort, useClass: Authentication},

  {provide: StoragePort, useClass: LocalStorageAdapter},

  {provide: HttpClientPort, useClass: AngularHttpAdapter},

  {provide: NavigationPort, useClass: AngularRouterAdapter}
];

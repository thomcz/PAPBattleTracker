import {TestBed} from '@angular/core/testing';

import {AngularRouterAdapter} from './angular-router.adapter';

describe('AngularRouter', () => {
  let service: AngularRouterAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AngularRouterAdapter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

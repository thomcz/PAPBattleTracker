import { TestBed } from '@angular/core/testing';

import { AngularHttpAdapter } from './angular-http.adapter';

describe('AngularHttpAdapter', () => {
  let service: AngularHttpAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AngularHttpAdapter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

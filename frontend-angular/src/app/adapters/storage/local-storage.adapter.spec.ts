import { TestBed } from '@angular/core/testing';

import { LocalStorageAdapter } from './local-storage.adapter';

describe('LocalStorageAdapter', () => {
  let service: LocalStorageAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageAdapter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

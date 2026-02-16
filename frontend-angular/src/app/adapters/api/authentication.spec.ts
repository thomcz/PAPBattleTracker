import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Authentication } from './authentication';
import { HttpClientPort } from '../../core/ports/http-client.port';
import { StoragePort } from '../../core/ports/storage.port';

describe('Authentication', () => {
  let service: Authentication;
  let httpClientPortMock: HttpClientPort;
  let storagePortMock: StoragePort;

  beforeEach(() => {
    httpClientPortMock = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    } as HttpClientPort;

    storagePortMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    } as StoragePort;

    TestBed.configureTestingModule({
      providers: [
        Authentication,
        { provide: HttpClientPort, useValue: httpClientPortMock },
        { provide: StoragePort, useValue: storagePortMock }
      ]
    });
    service = TestBed.inject(Authentication);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

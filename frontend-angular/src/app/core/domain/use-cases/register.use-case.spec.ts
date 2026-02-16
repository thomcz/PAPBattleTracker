import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { RegisterUseCase } from './register.use-case';
import { AuthPort } from '../../ports/auth.port';
import { StoragePort } from '../../ports/storage.port';

describe('RegisterUseCase', () => {
  let service: RegisterUseCase;
  let authPortMock: AuthPort;
  let storagePortMock: StoragePort;

  beforeEach(() => {
    authPortMock = {
      register: vi.fn(),
      login: vi.fn(),
      getCurrentUser: vi.fn().mockReturnValue(null),
      isAuthenticated: vi.fn()
    } as AuthPort;

    storagePortMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    } as StoragePort;

    TestBed.configureTestingModule({
      providers: [
        RegisterUseCase,
        { provide: AuthPort, useValue: authPortMock },
        { provide: StoragePort, useValue: storagePortMock }
      ]
    });
    service = TestBed.inject(RegisterUseCase);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

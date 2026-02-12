import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { LogoutUseCase } from './logout.use-case';
import { NavigationPort } from '../../ports/navigation.port';
import { StoragePort } from '../../ports/storage.port';

describe('LogoutUseCase', () => {
  let service: LogoutUseCase;
  let navigationPortMock: NavigationPort;
  let storagePortMock: StoragePort;

  beforeEach(() => {
    navigationPortMock = {
      navigate: vi.fn(),
      navigateByUrl: vi.fn()
    } as NavigationPort;

    storagePortMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    } as StoragePort;

    TestBed.configureTestingModule({
      providers: [
        LogoutUseCase,
        { provide: NavigationPort, useValue: navigationPortMock },
        { provide: StoragePort, useValue: storagePortMock }
      ]
    });
    service = TestBed.inject(LogoutUseCase);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

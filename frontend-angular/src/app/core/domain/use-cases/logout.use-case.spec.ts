import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { LogoutUseCase } from './logout.use-case';
import { LoginUseCase } from './login.use-case';
import { NavigationPort } from '../../ports/navigation.port';
import { StoragePort } from '../../ports/storage.port';

describe('LogoutUseCase', () => {
  let service: LogoutUseCase;
  let navigationPortMock: NavigationPort;
  let storagePortMock: StoragePort;
  let loginUseCaseMock: { clearAuthState: ReturnType<typeof vi.fn> };

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

    loginUseCaseMock = {
      clearAuthState: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        LogoutUseCase,
        { provide: NavigationPort, useValue: navigationPortMock },
        { provide: StoragePort, useValue: storagePortMock },
        { provide: LoginUseCase, useValue: loginUseCaseMock }
      ]
    });
    service = TestBed.inject(LogoutUseCase);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should remove user and token from storage', () => {
    service.execute();

    expect(storagePortMock.removeItem).toHaveBeenCalledWith('current_user');
    expect(storagePortMock.removeItem).toHaveBeenCalledWith('auth_token');
  });

  it('should clear auth state signal in LoginUseCase', () => {
    service.execute();

    expect(loginUseCaseMock.clearAuthState).toHaveBeenCalled();
  });

  it('should navigate to login page', () => {
    service.execute();

    expect(navigationPortMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should clear storage before navigating', () => {
    const callOrder: string[] = [];
    (storagePortMock.removeItem as ReturnType<typeof vi.fn>).mockImplementation(() => callOrder.push('removeItem'));
    loginUseCaseMock.clearAuthState.mockImplementation(() => callOrder.push('clearAuthState'));
    (navigationPortMock.navigate as ReturnType<typeof vi.fn>).mockImplementation(() => callOrder.push('navigate'));

    service.execute();

    expect(callOrder.indexOf('removeItem')).toBeLessThan(callOrder.indexOf('navigate'));
    expect(callOrder.indexOf('clearAuthState')).toBeLessThan(callOrder.indexOf('navigate'));
  });
});

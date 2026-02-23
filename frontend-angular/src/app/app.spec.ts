import {TestBed} from '@angular/core/testing';
import {vi} from 'vitest';
import {App} from './app';
import {AuthPort} from './core/ports/auth.port';
import {StoragePort} from './core/ports/storage.port';
import {NavigationPort} from './core/ports/navigation.port';
import {LoginUseCase} from './core/domain/use-cases/login.use-case';
import {provideRouter} from '@angular/router';

describe('App', () => {
  const mockLoginUseCase = {
    isAuthenticated: vi.fn().mockReturnValue(false),
    currentUser: vi.fn().mockReturnValue(null),
    getToken: vi.fn(),
    clearAuthState: vi.fn(),
    execute: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        {provide: AuthPort, useValue: {login: vi.fn(), register: vi.fn(), getCurrentUser: vi.fn(), isAuthenticated: vi.fn()}},
        {provide: StoragePort, useValue: {getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn()}},
        {provide: NavigationPort, useValue: {navigate: vi.fn(), navigateByUrl: vi.fn()}},
        {provide: LoginUseCase, useValue: mockLoginUseCase},
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render router outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should not show bottom nav when not authenticated', () => {
    mockLoginUseCase.isAuthenticated.mockReturnValue(false);
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-bottom-nav')).toBeNull();
  });
});

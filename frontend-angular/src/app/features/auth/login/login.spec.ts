import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ActivatedRoute } from '@angular/router';
import { Login } from './login';
import { AuthPort } from '../../../core/ports/auth.port';
import { StoragePort } from '../../../core/ports/storage.port';
import { NavigationPort } from '../../../core/ports/navigation.port';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authPortMock: AuthPort;
  let storagePortMock: StoragePort;
  let navigationPortMock: NavigationPort;

  beforeEach(async () => {
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

    navigationPortMock = {
      navigate: vi.fn(),
      navigateByUrl: vi.fn()
    } as NavigationPort;

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        { provide: AuthPort, useValue: authPortMock },
        { provide: StoragePort, useValue: storagePortMock },
        { provide: NavigationPort, useValue: navigationPortMock },
        { provide: ActivatedRoute, useValue: {} }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

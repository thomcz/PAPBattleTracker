import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { HomeComponent } from './home';
import { AuthPort } from '../core/ports/auth.port';
import { StoragePort } from '../core/ports/storage.port';
import { NavigationPort } from '../core/ports/navigation.port';
import { Router } from '@angular/router';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let authPortMock: AuthPort;
  let storagePortMock: StoragePort;
  let navigationPortMock: NavigationPort;
  let routerMock: Router;

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

    routerMock = {
      navigate: vi.fn()
    } as unknown as Router;

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: AuthPort, useValue: authPortMock },
        { provide: StoragePort, useValue: storagePortMock },
        { provide: NavigationPort, useValue: navigationPortMock },
        { provide: Router, useValue: routerMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

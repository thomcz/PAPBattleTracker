import {TestBed} from '@angular/core/testing';
import {vi} from 'vitest';
import {signal} from '@angular/core';
import {Router} from '@angular/router';
import {SessionListComponent} from './session-list.component';
import {SessionListUseCase} from '../../../../core/domain/use-cases/session-list.use-case';
import {LoginUseCase} from '../../../../core/domain/use-cases/login.use-case';
import {LogoutUseCase} from '../../../../core/domain/use-cases/logout.use-case';
import {SessionStatus} from '../../../../core/domain/models/session.model';

describe('SessionListComponent', () => {
  let component: SessionListComponent;
  let router: Router;
  let sessionListUseCaseMock: Partial<SessionListUseCase>;
  let loginUseCaseMock: Partial<LoginUseCase>;
  let logoutUseCaseMock: Partial<LogoutUseCase>;

  beforeEach(() => {
    sessionListUseCaseMock = {
      sessions: signal([]),
      loading: signal(false),
      error: signal(null),
      sessionCount: signal(0),
      loadSessions: vi.fn(),
      createSession: vi.fn()
    };

    loginUseCaseMock = {
      currentUser: signal({userName: 'testuser', email: 'test@test.com'}),
      isAuthenticated: signal(true)
    };

    logoutUseCaseMock = {
      execute: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [SessionListComponent],
      providers: [
        {provide: SessionListUseCase, useValue: sessionListUseCaseMock},
        {provide: LoginUseCase, useValue: loginUseCaseMock},
        {provide: LogoutUseCase, useValue: logoutUseCaseMock},
        {provide: Router, useValue: {navigate: vi.fn()}}
      ]
    });

    const fixture = TestBed.createComponent(SessionListComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load sessions on init', () => {
    component.ngOnInit();
    expect(sessionListUseCaseMock.loadSessions).toHaveBeenCalled();
  });

  it('should navigate to session detail on viewSession', () => {
    component.viewSession('session-123');
    expect(router.navigate).toHaveBeenCalledWith(['/sessions', 'session-123']);
  });

  it('should open and close create dialog', () => {
    expect(component.showCreateDialog()).toBe(false);

    component.openCreateDialog();
    expect(component.showCreateDialog()).toBe(true);

    component.closeCreateDialog();
    expect(component.showCreateDialog()).toBe(false);
  });

  it('should close dialog on session created', () => {
    component.openCreateDialog();
    component.onSessionCreated();
    expect(component.showCreateDialog()).toBe(false);
  });

  it('should call logout use case', () => {
    component.logout();
    expect(logoutUseCaseMock.execute).toHaveBeenCalled();
  });

  it('should return user initial', () => {
    expect(component.getUserInitial()).toBe('T');
  });

  it('should return correct status class', () => {
    expect(component.getStatusClass(SessionStatus.PLANNED)).toBe('status-planned');
    expect(component.getStatusClass(SessionStatus.STARTED)).toBe('status-started');
    expect(component.getStatusClass(SessionStatus.FINISHED)).toBe('status-finished');
  });

  it('should return correct status label', () => {
    expect(component.getStatusLabel(SessionStatus.PLANNED)).toBe('Planned');
    expect(component.getStatusLabel(SessionStatus.STARTED)).toBe('Started');
    expect(component.getStatusLabel(SessionStatus.FINISHED)).toBe('Finished');
  });
});

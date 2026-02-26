import {TestBed} from '@angular/core/testing';
import {vi} from 'vitest';
import {signal} from '@angular/core';
import {of, throwError} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {SessionDetailComponent} from './session-detail.component';
import {SessionDetailUseCase} from '../../../../core/domain/use-cases/session-detail.use-case';
import {LoginUseCase} from '../../../../core/domain/use-cases/login.use-case';
import {LogoutUseCase} from '../../../../core/domain/use-cases/logout.use-case';
import {CombatStatus} from '../../../../core/domain/models/battle.model';

describe('SessionDetailComponent', () => {
  let component: SessionDetailComponent;
  let router: Router;
  let sessionDetailUseCaseMock: Partial<SessionDetailUseCase>;
  let loginUseCaseMock: Partial<LoginUseCase>;
  let logoutUseCaseMock: Partial<LogoutUseCase>;

  beforeEach(() => {
    sessionDetailUseCaseMock = {
      session: signal(null),
      loading: signal(false),
      error: signal(null),
      loadSession: vi.fn(),
      createBattle: vi.fn(),
      startSession: vi.fn().mockReturnValue(of(undefined)),
      finishSession: vi.fn().mockReturnValue(of(undefined)),
      renameSession: vi.fn().mockReturnValue(of(undefined)),
      deleteSession: vi.fn().mockReturnValue(of(undefined))
    };

    loginUseCaseMock = {
      currentUser: signal({userName: 'testuser', email: 'test@test.com'}),
      isAuthenticated: signal(true)
    };

    logoutUseCaseMock = {
      execute: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [SessionDetailComponent],
      providers: [
        {provide: SessionDetailUseCase, useValue: sessionDetailUseCaseMock},
        {provide: LoginUseCase, useValue: loginUseCaseMock},
        {provide: LogoutUseCase, useValue: logoutUseCaseMock},
        {provide: Router, useValue: {navigate: vi.fn()}},
        {provide: ActivatedRoute, useValue: {snapshot: {paramMap: {get: () => 'session-123'}}}}
      ]
    });

    const fixture = TestBed.createComponent(SessionDetailComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load session on init', () => {
    component.ngOnInit();
    expect(sessionDetailUseCaseMock.loadSession).toHaveBeenCalledWith('session-123');
  });

  it('should navigate home when no sessionId', () => {
    TestBed.resetTestingModule();

    const routerMock = {navigate: vi.fn()};

    TestBed.configureTestingModule({
      imports: [SessionDetailComponent],
      providers: [
        {provide: SessionDetailUseCase, useValue: sessionDetailUseCaseMock},
        {provide: LoginUseCase, useValue: loginUseCaseMock},
        {provide: LogoutUseCase, useValue: logoutUseCaseMock},
        {provide: Router, useValue: routerMock},
        {provide: ActivatedRoute, useValue: {snapshot: {paramMap: {get: () => null}}}}
      ]
    });

    const fixture = TestBed.createComponent(SessionDetailComponent);
    fixture.componentInstance.ngOnInit();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should navigate to battle on viewBattle', () => {
    component.viewBattle('battle-456');
    expect(router.navigate).toHaveBeenCalledWith(['/battles', 'battle-456']);
  });

  it('should navigate home on goBack', () => {
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should open and close create battle dialog', () => {
    expect(component.showCreateBattleDialog()).toBe(false);
    component.openCreateBattleDialog();
    expect(component.showCreateBattleDialog()).toBe(true);
    component.closeCreateBattleDialog();
    expect(component.showCreateBattleDialog()).toBe(false);
  });

  it('should call logout use case', () => {
    component.logout();
    expect(logoutUseCaseMock.execute).toHaveBeenCalled();
  });

  it('should return correct status label', () => {
    expect(component.getStatusLabel('NOT_STARTED')).toBe('Not Started');
    expect(component.getStatusLabel('ACTIVE')).toBe('Active');
    expect(component.getStatusLabel('PAUSED')).toBe('Paused');
    expect(component.getStatusLabel('ENDED')).toBe('Ended');
  });

  it('should return correct status class', () => {
    expect(component.getStatusClass('NOT_STARTED')).toBe('status-not-started');
    expect(component.getStatusClass('ACTIVE')).toBe('status-active');
    expect(component.getStatusClass('PAUSED')).toBe('status-paused');
    expect(component.getStatusClass('ENDED')).toBe('status-ended');
  });

  it('should call startSession use case on startSession', () => {
    component.sessionId = 'session-123';
    component.startSession();
    expect(sessionDetailUseCaseMock.startSession).toHaveBeenCalledWith('session-123');
  });

  it('should call finishSession use case on finishSession', () => {
    component.sessionId = 'session-123';
    component.finishSession();
    expect(sessionDetailUseCaseMock.finishSession).toHaveBeenCalledWith('session-123');
  });

  it('should set lifecycleError on startSession failure', () => {
    sessionDetailUseCaseMock.startSession = vi.fn().mockReturnValue(throwError(() => new Error('fail')));
    component.sessionId = 'session-123';
    component.startSession();
    expect(component.lifecycleError()).toBe('Failed to start session.');
  });

  it('should set lifecycleError on finishSession failure', () => {
    sessionDetailUseCaseMock.finishSession = vi.fn().mockReturnValue(throwError(() => new Error('fail')));
    component.sessionId = 'session-123';
    component.finishSession();
    expect(component.lifecycleError()).toBe('Failed to finish session.');
  });

  it('should clear lifecycleError on startSession success', () => {
    component.lifecycleError.set('old error');
    component.sessionId = 'session-123';
    component.startSession();
    expect(component.lifecycleError()).toBeNull();
  });

  it('should open and close rename dialog', () => {
    expect(component.showRenameDialog()).toBe(false);
    component.openRenameDialog();
    expect(component.showRenameDialog()).toBe(true);
    component.closeRenameDialog();
    expect(component.showRenameDialog()).toBe(false);
  });

  it('should call renameSession on submitRename', () => {
    component.sessionId = 'session-123';
    component.pendingRename.set('New Name');
    component.submitRename();
    expect(sessionDetailUseCaseMock.renameSession).toHaveBeenCalledWith('session-123', 'New Name');
  });

  it('should close rename dialog on successful rename', () => {
    component.sessionId = 'session-123';
    component.showRenameDialog.set(true);
    component.pendingRename.set('New Name');
    component.submitRename();
    expect(component.showRenameDialog()).toBe(false);
  });

  it('should set renameError on rename failure', () => {
    sessionDetailUseCaseMock.renameSession = vi.fn().mockReturnValue(throwError(() => new Error('fail')));
    component.sessionId = 'session-123';
    component.pendingRename.set('New Name');
    component.submitRename();
    expect(component.renameError()).toBe('Failed to rename session.');
  });

  it('should open and close delete confirmation', () => {
    expect(component.showDeleteConfirm()).toBe(false);
    component.openDeleteConfirm();
    expect(component.showDeleteConfirm()).toBe(true);
    component.closeDeleteConfirm();
    expect(component.showDeleteConfirm()).toBe(false);
  });

  it('should call deleteSession on confirmDelete and navigate home', () => {
    component.sessionId = 'session-123';
    component.confirmDelete();
    expect(sessionDetailUseCaseMock.deleteSession).toHaveBeenCalledWith('session-123');
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should close delete confirm on delete failure', () => {
    sessionDetailUseCaseMock.deleteSession = vi.fn().mockReturnValue(throwError(() => new Error('fail')));
    component.sessionId = 'session-123';
    component.showDeleteConfirm.set(true);
    component.confirmDelete();
    expect(component.showDeleteConfirm()).toBe(false);
  });
});

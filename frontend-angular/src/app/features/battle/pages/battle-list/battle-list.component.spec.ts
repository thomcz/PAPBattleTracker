import {render, screen, waitFor} from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import {vi} from 'vitest';
import {of, throwError, Observable} from 'rxjs';
import {Router} from '@angular/router';
import {BattleListComponent} from './battle-list.component';
import {BattleApiAdapter} from '../../../../adapters/api/battle-api.adapter';
import {BattleSummary, CombatStatus} from '../../../../core/domain/models/battle.model';
import {LoginUseCase} from '../../../../core/domain/use-cases/login.use-case';
import {LogoutUseCase} from '../../../../core/domain/use-cases/logout.use-case';
import {AuthPort} from '../../../../core/ports/auth.port';
import {StoragePort} from '../../../../core/ports/storage.port';
import {NavigationPort} from '../../../../core/ports/navigation.port';

describe('BattleListComponent', () => {
  const mockBattles: BattleSummary[] = [
    {
      id: 'battle-1',
      name: 'Shadow of Aethelgard',
      status: CombatStatus.ACTIVE,
      createdAt: '2026-02-20T10:00:00Z',
      lastModified: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'battle-2',
      name: 'Siege of Ironhold',
      status: CombatStatus.NOT_STARTED,
      createdAt: '2026-02-19T08:00:00Z',
      lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'battle-3',
      name: 'Ancient Temple',
      status: CombatStatus.ENDED,
      createdAt: '2026-02-18T10:00:00Z',
      lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ];

  const mockBattleApiAdapter = {
    createBattle: vi.fn(),
    listBattles: vi.fn(),
    getBattle: vi.fn(),
    startCombat: vi.fn(),
    pauseCombat: vi.fn(),
    resumeCombat: vi.fn(),
    endCombat: vi.fn(),
    deleteBattle: vi.fn(),
    addCreature: vi.fn(),
    updateCreature: vi.fn(),
    removeCreature: vi.fn(),
    advanceTurn: vi.fn(),
    applyDamage: vi.fn(),
    getCombatLog: vi.fn(),
  };

  const mockRouter = {
    navigate: vi.fn()
  };

  const mockLoginUseCase = {
    execute: vi.fn(),
    currentUser: vi.fn().mockReturnValue({userName: 'TestGM', email: 'gm@realm.com'}),
    isAuthenticated: vi.fn().mockReturnValue(true),
    getToken: vi.fn(),
    clearAuthState: vi.fn(),
  };

  const mockLogoutUseCase = {
    execute: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLoginUseCase.currentUser.mockReturnValue({userName: 'TestGM', email: 'gm@realm.com'});
  });

  async function setup(overrides: { battles?: BattleSummary[] | 'error' } = {}) {
    if (overrides.battles === 'error') {
      mockBattleApiAdapter.listBattles.mockReturnValue(throwError(() => new Error('Network error')));
    } else if (overrides.battles !== undefined) {
      mockBattleApiAdapter.listBattles.mockReturnValue(of(overrides.battles));
    } else {
      mockBattleApiAdapter.listBattles.mockReturnValue(of(mockBattles));
    }

    const result = await render(BattleListComponent, {
      providers: [
        {provide: BattleApiAdapter, useValue: mockBattleApiAdapter},
        {provide: Router, useValue: mockRouter},
        {provide: LoginUseCase, useValue: mockLoginUseCase},
        {provide: LogoutUseCase, useValue: mockLogoutUseCase},
        {provide: AuthPort, useValue: {login: vi.fn(), register: vi.fn(), getCurrentUser: vi.fn(), isAuthenticated: vi.fn()}},
        {provide: StoragePort, useValue: {getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn()}},
        {provide: NavigationPort, useValue: {navigate: vi.fn(), navigateByUrl: vi.fn()}},
      ]
    });

    await result.fixture.whenStable();
    return result;
  }

  // === Header & Dashboard ===

  it('should render "Active Sessions" heading', async () => {
    await setup();
    expect(screen.getByText('Active Sessions')).toBeTruthy();
  });

  it('should render user avatar with first letter of username', async () => {
    await setup();
    const avatar = screen.getByText('T');
    expect(avatar.classList.contains('user-avatar')).toBe(true);
  });

  it('should render logout button', async () => {
    await setup();
    const logoutBtn = screen.getByRole('button', {name: /logout/i});
    expect(logoutBtn).toBeTruthy();
  });

  it('should call logout when logout button is clicked', async () => {
    const user = userEvent.setup();
    await setup();
    const logoutBtn = screen.getByRole('button', {name: /logout/i});
    await user.click(logoutBtn);
    expect(mockLogoutUseCase.execute).toHaveBeenCalled();
  });

  it('should render "Current Battles" section heading', async () => {
    await setup();
    expect(screen.getByText('Current Battles')).toBeTruthy();
  });

  // === Stats Cards ===

  it('should display "In Progress" stat', async () => {
    await setup();
    expect(screen.getByText(/in progress/i)).toBeTruthy();
  });

  it('should display stats with correct values', async () => {
    await setup();
    const statValues = document.querySelectorAll('.stat-value');
    expect(statValues.length).toBe(2);
    expect(statValues[0].textContent?.trim()).toBe('2'); // 2 non-ended battles
    expect(statValues[1].textContent?.trim()).toBe('3'); // 3 total battles
  });

  it('should display stats with zero when no battles', async () => {
    await setup({battles: []});
    const statValues = document.querySelectorAll('.stat-value');
    expect(statValues.length).toBe(2);
    expect(statValues[0].textContent?.trim()).toBe('0');
    expect(statValues[1].textContent?.trim()).toBe('0');
  });

  // === Battle Cards ===

  it('should load battles on initialization', async () => {
    await setup();
    expect(mockBattleApiAdapter.listBattles).toHaveBeenCalled();
  });

  it('should display battle cards when battles exist', async () => {
    await setup();
    expect(screen.getByText('Shadow of Aethelgard')).toBeTruthy();
    expect(screen.getByText('Siege of Ironhold')).toBeTruthy();
    expect(screen.getByText('Ancient Temple')).toBeTruthy();
  });

  it('should show status badges on battle cards', async () => {
    await setup();
    expect(screen.getByText('Active')).toBeTruthy();
    expect(screen.getByText('Not Started')).toBeTruthy();
    expect(screen.getByText('Ended')).toBeTruthy();
  });

  it('should show "Resume Session" button on each battle card', async () => {
    await setup();
    const resumeButtons = screen.getAllByText(/resume session/i);
    expect(resumeButtons.length).toBe(3);
  });

  it('should show relative last activity time', async () => {
    await setup();
    const timeTexts = screen.getAllByText(/ago/i);
    expect(timeTexts.length).toBeGreaterThan(0);
  });

  it('should navigate to battle detail when Resume Session is clicked', async () => {
    const user = userEvent.setup();
    await setup();
    const resumeButtons = screen.getAllByRole('button', {name: /resume session/i});
    await user.click(resumeButtons[0]);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/battles', 'battle-1']);
  });

  // === Empty State ===

  it('should show empty state when no battles exist', async () => {
    await setup({battles: []});
    expect(screen.getByText(/no battles yet/i)).toBeTruthy();
  });

  it('should show create battle button in empty state', async () => {
    await setup({battles: []});
    const btn = screen.getByRole('button', {name: /create battle/i});
    expect(btn).toBeTruthy();
  });

  // === Error State ===

  it('should show error state when battles fail to load', async () => {
    await setup({battles: 'error'});
    expect(screen.getByText(/failed to load/i)).toBeTruthy();
  });

  it('should show retry button on error', async () => {
    await setup({battles: 'error'});
    expect(screen.getByRole('button', {name: /retry/i})).toBeTruthy();
  });

  it('should retry loading battles when retry button is clicked', async () => {
    const user = userEvent.setup();
    mockBattleApiAdapter.listBattles
      .mockReturnValueOnce(throwError(() => new Error('Network error')))
      .mockReturnValueOnce(of(mockBattles));

    const result = await render(BattleListComponent, {
      providers: [
        {provide: BattleApiAdapter, useValue: mockBattleApiAdapter},
        {provide: Router, useValue: mockRouter},
        {provide: LoginUseCase, useValue: mockLoginUseCase},
        {provide: LogoutUseCase, useValue: mockLogoutUseCase},
        {provide: AuthPort, useValue: {login: vi.fn(), register: vi.fn(), getCurrentUser: vi.fn(), isAuthenticated: vi.fn()}},
        {provide: StoragePort, useValue: {getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn(), clear: vi.fn()}},
        {provide: NavigationPort, useValue: {navigate: vi.fn(), navigateByUrl: vi.fn()}},
      ]
    });

    await result.fixture.whenStable();

    expect(screen.getByText(/failed to load/i)).toBeTruthy();

    const retryButton = screen.getByRole('button', {name: /retry/i});
    await user.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('Shadow of Aethelgard')).toBeTruthy();
      expect(mockBattleApiAdapter.listBattles).toHaveBeenCalledTimes(2);
    });
  });

  // === Create Battle ===

  it('should show "New Battle" button in section header', async () => {
    await setup();
    expect(screen.getByRole('button', {name: /new battle/i})).toBeTruthy();
  });

  it('should open create dialog when "New Battle" button is clicked', async () => {
    const user = userEvent.setup();
    const {fixture} = await setup();
    const component = fixture.componentInstance;
    expect(component.showCreateDialog()).toBe(false);

    const createButton = screen.getByRole('button', {name: /new battle/i});
    await user.click(createButton);
    expect(component.showCreateDialog()).toBe(true);
  });

  it('should open create dialog from empty state', async () => {
    const user = userEvent.setup();
    const {fixture} = await setup({battles: []});
    const component = fixture.componentInstance;

    const createButton = screen.getByRole('button', {name: /create battle/i});
    await user.click(createButton);
    expect(component.showCreateDialog()).toBe(true);
  });

  it('should add new battle to list and navigate after creation', async () => {
    const {fixture} = await setup({battles: []});
    const component = fixture.componentInstance;

    const newBattle: BattleSummary = {
      id: 'battle-new',
      name: 'New Battle',
      status: CombatStatus.NOT_STARTED,
      createdAt: '2026-02-23T10:00:00Z',
      lastModified: '2026-02-23T10:00:00Z'
    };

    component.onBattleCreated(newBattle);

    expect(component.battles()).toEqual([newBattle]);
    expect(component.showCreateDialog()).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/battles', 'battle-new']);
  });

  it('should close create dialog when dialogClosed event is emitted', async () => {
    const {fixture} = await setup();
    const component = fixture.componentInstance;

    component.openCreateDialog();
    expect(component.showCreateDialog()).toBe(true);

    component.closeCreateDialog();
    expect(component.showCreateDialog()).toBe(false);
  });

  // === Status Helpers ===

  it('should apply correct CSS classes for different statuses', async () => {
    const {fixture} = await setup();
    const component = fixture.componentInstance;

    expect(component.getStatusClass(CombatStatus.NOT_STARTED)).toBe('status-not-started');
    expect(component.getStatusClass(CombatStatus.ACTIVE)).toBe('status-active');
    expect(component.getStatusClass(CombatStatus.PAUSED)).toBe('status-paused');
    expect(component.getStatusClass(CombatStatus.ENDED)).toBe('status-ended');
  });

  it('should return correct status labels', async () => {
    const {fixture} = await setup();
    const component = fixture.componentInstance;

    expect(component.getStatusLabel(CombatStatus.NOT_STARTED)).toBe('Not Started');
    expect(component.getStatusLabel(CombatStatus.ACTIVE)).toBe('Active');
    expect(component.getStatusLabel(CombatStatus.PAUSED)).toBe('Paused');
    expect(component.getStatusLabel(CombatStatus.ENDED)).toBe('Ended');
  });
});

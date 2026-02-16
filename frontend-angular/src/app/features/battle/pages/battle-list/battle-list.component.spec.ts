import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { of, throwError, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { BattleListComponent } from './battle-list.component';
import { BattleApiAdapter } from '../../../../adapters/api/battle-api.adapter';
import { BattleSummary, CombatStatus } from '../../../../core/domain/models/battle.model';

describe('BattleListComponent', () => {
  const mockBattles: BattleSummary[] = [
    {
      id: 'battle-1',
      name: 'Dragon\'s Lair',
      status: CombatStatus.ACTIVE,
      createdAt: '2024-01-01T10:00:00Z',
      lastModified: '2024-01-01T11:00:00Z'
    },
    {
      id: 'battle-2',
      name: 'Goblin Ambush',
      status: CombatStatus.NOT_STARTED,
      createdAt: '2024-01-02T10:00:00Z',
      lastModified: '2024-01-02T10:00:00Z'
    },
    {
      id: 'battle-3',
      name: 'Ancient Temple',
      status: CombatStatus.ENDED,
      createdAt: '2024-01-03T10:00:00Z',
      lastModified: '2024-01-03T12:00:00Z'
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
    deleteBattle: vi.fn()
  };

  const mockRouter = {
    navigate: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component with header', async () => {
    mockBattleApiAdapter.listBattles.mockReturnValue(of([]));

    await render(BattleListComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter }
      ]
    });

    expect(screen.getByRole('heading', { name: /battle sessions/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /create new battle/i })).toBeTruthy();
  });

  it('should load battles on initialization', async () => {
    mockBattleApiAdapter.listBattles.mockReturnValue(of(mockBattles));

    await render(BattleListComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter }
      ]
    });

    expect(mockBattleApiAdapter.listBattles).toHaveBeenCalled();
  });

  it('should show loading state while fetching battles', async () => {
    // Create a promise we control
    let resolveBattles: (value: BattleSummary[]) => void;
    const battlesPromise = new Promise<BattleSummary[]>((resolve) => {
      resolveBattles = resolve;
    });
    mockBattleApiAdapter.listBattles.mockReturnValue(of(mockBattles).pipe(
      (source) => new Observable(subscriber => {
        battlesPromise.then(battles => {
          subscriber.next(battles);
          subscriber.complete();
        });
      })
    ));

    await render(BattleListComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter }
      ]
    });

    // Should show loading state
    expect(screen.getByText(/loading battles.../i)).toBeTruthy();
  });

  it('should display empty state when no battles exist', async () => {
    mockBattleApiAdapter.listBattles.mockReturnValue(of([]));

    await render(BattleListComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter }
      ]
    });

    await waitFor(() => {
      expect(screen.getByText(/ready to begin your adventure/i)).toBeTruthy();
      expect(screen.getByText(/create your first battle session/i)).toBeTruthy();
    });
  });

  it('should display battles in a table', async () => {
    mockBattleApiAdapter.listBattles.mockReturnValue(of(mockBattles));

    await render(BattleListComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter }
      ]
    });

    await waitFor(() => {
      expect(screen.getByText('Dragon\'s Lair')).toBeTruthy();
      expect(screen.getByText('Goblin Ambush')).toBeTruthy();
      expect(screen.getByText('Ancient Temple')).toBeTruthy();
    });
  });

  it('should display correct status labels for battles', async () => {
    mockBattleApiAdapter.listBattles.mockReturnValue(of(mockBattles));

    await render(BattleListComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter }
      ]
    });

    await waitFor(() => {
      expect(screen.getByText('Active')).toBeTruthy();
      expect(screen.getByText('Not Started')).toBeTruthy();
      expect(screen.getByText('Ended')).toBeTruthy();
    });
  });

  it('should show error message when loading battles fails', async () => {
    mockBattleApiAdapter.listBattles.mockReturnValue(
      throwError(() => new Error('Network error'))
    );

    await render(BattleListComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter }
      ]
    });

    await waitFor(() => {
      expect(screen.getByText(/failed to load battles/i)).toBeTruthy();
      expect(screen.getByRole('button', { name: /retry/i })).toBeTruthy();
    });
  });

  it('should retry loading battles when retry button is clicked', async () => {
    const user = userEvent.setup();
    mockBattleApiAdapter.listBattles
      .mockReturnValueOnce(throwError(() => new Error('Network error')))
      .mockReturnValueOnce(of(mockBattles));

    await render(BattleListComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter }
      ]
    });

    await waitFor(() => {
      expect(screen.getByText(/failed to load battles/i)).toBeTruthy();
    });

    const retryButton = screen.getByRole('button', { name: /retry/i });
    await user.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('Dragon\'s Lair')).toBeTruthy();
      expect(mockBattleApiAdapter.listBattles).toHaveBeenCalledTimes(2);
    });
  });

  it('should open create dialog when create button is clicked', async () => {
    const user = userEvent.setup();
    mockBattleApiAdapter.listBattles.mockReturnValue(of(mockBattles));

    const { fixture } = await render(BattleListComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter }
      ]
    });

    const component = fixture.componentInstance;
    expect(component.showCreateDialog()).toBe(false);

    const createButton = screen.getByRole('button', { name: /create new battle/i });
    await user.click(createButton);

    expect(component.showCreateDialog()).toBe(true);
  });

  it('should open create dialog from empty state', async () => {
    const user = userEvent.setup();
    mockBattleApiAdapter.listBattles.mockReturnValue(of([]));

    const { fixture } = await render(BattleListComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter }
      ]
    });

    const component = fixture.componentInstance;

    await waitFor(() => {
      expect(screen.getByText(/ready to begin your adventure/i)).toBeTruthy();
    });

    const createButton = screen.getByRole('button', { name: /create your first battle/i });
    await user.click(createButton);

    expect(component.showCreateDialog()).toBe(true);
  });

  it('should navigate to battle detail when view button is clicked', async () => {
    const user = userEvent.setup();
    mockBattleApiAdapter.listBattles.mockReturnValue(of(mockBattles));

    await render(BattleListComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter }
      ]
    });

    await waitFor(() => {
      expect(screen.getByText('Dragon\'s Lair')).toBeTruthy();
    });

    // Get all view buttons and click the first one
    const viewButtons = screen.getAllByRole('button', { name: /view battle details/i });
    await user.click(viewButtons[0]);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/battles', 'battle-1']);
  });

  it('should navigate to battle detail when row is clicked', async () => {
    const user = userEvent.setup();
    mockBattleApiAdapter.listBattles.mockReturnValue(of(mockBattles));

    const { container } = await render(BattleListComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter }
      ]
    });

    await waitFor(() => {
      expect(screen.getByText('Dragon\'s Lair')).toBeTruthy();
    });

    // Find the first battle row and click it
    const battleRow = container.querySelector('.battle-row') as HTMLElement;
    await user.click(battleRow);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/battles', 'battle-1']);
  });

  it('should add new battle to list and navigate after creation', async () => {
    const user = userEvent.setup();
    mockBattleApiAdapter.listBattles.mockReturnValue(of([]));

    const { fixture } = await render(BattleListComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter }
      ]
    });

    const component = fixture.componentInstance;

    // Simulate battle creation
    const newBattle: BattleSummary = {
      id: 'battle-new',
      name: 'New Battle',
      status: CombatStatus.NOT_STARTED,
      createdAt: '2024-01-04T10:00:00Z',
      lastModified: '2024-01-04T10:00:00Z'
    };

    component.onBattleCreated(newBattle);

    expect(component.battles()).toEqual([newBattle]);
    expect(component.showCreateDialog()).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/battles', 'battle-new']);
  });

  it('should close create dialog when dialogClosed event is emitted', async () => {
    mockBattleApiAdapter.listBattles.mockReturnValue(of(mockBattles));

    const { fixture } = await render(BattleListComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter }
      ]
    });

    const component = fixture.componentInstance;

    component.openCreateDialog();
    expect(component.showCreateDialog()).toBe(true);

    component.closeCreateDialog();
    expect(component.showCreateDialog()).toBe(false);
  });

  it('should apply correct CSS classes for different statuses', async () => {
    mockBattleApiAdapter.listBattles.mockReturnValue(of(mockBattles));

    const { fixture } = await render(BattleListComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter }
      ]
    });

    const component = fixture.componentInstance;

    expect(component.getStatusClass(CombatStatus.NOT_STARTED)).toBe('status-not-started');
    expect(component.getStatusClass(CombatStatus.ACTIVE)).toBe('status-active');
    expect(component.getStatusClass(CombatStatus.PAUSED)).toBe('status-paused');
    expect(component.getStatusClass(CombatStatus.ENDED)).toBe('status-ended');
  });

  it('should return correct status labels', async () => {
    mockBattleApiAdapter.listBattles.mockReturnValue(of(mockBattles));

    const { fixture } = await render(BattleListComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter }
      ]
    });

    const component = fixture.componentInstance;

    expect(component.getStatusLabel(CombatStatus.NOT_STARTED)).toBe('Not Started');
    expect(component.getStatusLabel(CombatStatus.ACTIVE)).toBe('Active');
    expect(component.getStatusLabel(CombatStatus.PAUSED)).toBe('Paused');
    expect(component.getStatusLabel(CombatStatus.ENDED)).toBe('Ended');
  });
});

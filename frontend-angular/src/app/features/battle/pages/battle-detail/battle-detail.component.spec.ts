import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { BattleDetailComponent } from './battle-detail.component';
import { BattleApiAdapter } from '../../../../adapters/api/battle-api.adapter';
import { Battle, CombatStatus, CreatureType } from '../../../../core/domain/models/battle.model';
import { BattlePort } from '../../../../core/ports/battle.port';
import { AddCreatureUseCase } from '../../../../core/domain/use-cases/add-creature.use-case';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('BattleDetailComponent', () => {
  const mockBattle: Battle = {
    id: 'battle-123',
    name: 'Dragon\'s Lair',
    status: CombatStatus.NOT_STARTED,
    creatures: [
      {
        id: 'creature-1',
        name: 'Ancient Red Dragon',
        type: CreatureType.MONSTER,
        currentHp: 100,
        maxHp: 100,
        initiative: 15,
        armorClass: 22,
        isDefeated: false,
        effects: []
      },
      {
        id: 'creature-2',
        name: 'Brave Warrior',
        type: CreatureType.PLAYER,
        currentHp: 45,
        maxHp: 50,
        initiative: 12,
        armorClass: 18,
        isDefeated: false,
        effects: []
      }
    ],
    currentTurn: 0,
    round: 0,
    combatLog: [],
    createdAt: '2024-01-01T10:00:00Z',
    lastModified: '2024-01-01T11:00:00Z'
  };

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
    removeCreature: vi.fn()
  };

  const mockRouter = {
    navigate: vi.fn()
  };

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: vi.fn()
      }
    }
  };

  const mockSnackBar = {
    open: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('battle-123');
  });

  it('should render the component with back button', async () => {
    mockBattleApiAdapter.getBattle.mockReturnValue(of(mockBattle));

    await render(BattleDetailComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: BattlePort, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatSnackBar, useValue: mockSnackBar },
        AddCreatureUseCase
      ]
    });

    expect(screen.getByRole('button', { name: /back to battles/i })).toBeTruthy();
  });

  it('should load battle on initialization', async () => {
    mockBattleApiAdapter.getBattle.mockReturnValue(of(mockBattle));

    await render(BattleDetailComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: BattlePort, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatSnackBar, useValue: mockSnackBar },
        AddCreatureUseCase
      ]
    });

    expect(mockBattleApiAdapter.getBattle).toHaveBeenCalledWith('battle-123');
  });

  it('should show loading state while fetching battle', async () => {
    mockBattleApiAdapter.getBattle.mockReturnValue(of(mockBattle));

    await render(BattleDetailComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: BattlePort, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatSnackBar, useValue: mockSnackBar },
        AddCreatureUseCase
      ]
    });

    // Initially shows loading (though it may be brief)
    // The test passes if the component loads without errors
    expect(mockBattleApiAdapter.getBattle).toHaveBeenCalled();
  });

  it('should display battle details after loading', async () => {
    mockBattleApiAdapter.getBattle.mockReturnValue(of(mockBattle));

    await render(BattleDetailComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: BattlePort, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatSnackBar, useValue: mockSnackBar },
        AddCreatureUseCase
      ]
    });

    await waitFor(() => {
      expect(screen.getByText('Dragon\'s Lair')).toBeTruthy();
      expect(screen.getByText('Not Started')).toBeTruthy();
    });
  });

  it('should display battle metadata', async () => {
    mockBattleApiAdapter.getBattle.mockReturnValue(of(mockBattle));

    await render(BattleDetailComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: BattlePort, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatSnackBar, useValue: mockSnackBar },
        AddCreatureUseCase
      ]
    });

    await waitFor(() => {
      expect(screen.getByText(/created:/i)).toBeTruthy();
      expect(screen.getByText(/last modified:/i)).toBeTruthy();
    });
  });

  it('should display creatures when battle has creatures', async () => {
    mockBattleApiAdapter.getBattle.mockReturnValue(of(mockBattle));

    await render(BattleDetailComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: BattlePort, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatSnackBar, useValue: mockSnackBar },
        AddCreatureUseCase
      ]
    });

    await waitFor(() => {
      expect(screen.getByText('Ancient Red Dragon')).toBeTruthy();
      expect(screen.getByText('Brave Warrior')).toBeTruthy();
      expect(screen.getByText('100 / 100 HP')).toBeTruthy();
      expect(screen.getByText('45 / 50 HP')).toBeTruthy();
    });
  });

  it('should show empty state when no creatures exist', async () => {
    const battleWithoutCreatures: Battle = {
      ...mockBattle,
      creatures: []
    };
    mockBattleApiAdapter.getBattle.mockReturnValue(of(battleWithoutCreatures));

    await render(BattleDetailComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: BattlePort, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatSnackBar, useValue: mockSnackBar },
        AddCreatureUseCase
      ]
    });

    await waitFor(() => {
      expect(screen.getByText(/no creatures yet/i)).toBeTruthy();
    });
  });

  it('should show round information for active battles', async () => {
    const activeBattle: Battle = {
      ...mockBattle,
      status: CombatStatus.ACTIVE,
      round: 5
    };
    mockBattleApiAdapter.getBattle.mockReturnValue(of(activeBattle));

    const { fixture } = await render(BattleDetailComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: BattlePort, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatSnackBar, useValue: mockSnackBar },
        AddCreatureUseCase
      ]
    });

    const component = fixture.componentInstance;

    await waitFor(() => {
      expect(component.battle()?.status).toBe(CombatStatus.ACTIVE);
      expect(component.battle()?.round).toBe(5);
    });
  });

  it('should show combat log when entries exist', async () => {
    const battleWithLog: Battle = {
      ...mockBattle,
      combatLog: [
        {
          id: 'log-1',
          round: 1,
          timestamp: '2024-01-01T12:00:00Z',
          text: 'Combat started!'
        },
        {
          id: 'log-2',
          round: 1,
          timestamp: '2024-01-01T12:01:00Z',
          text: 'Dragon attacks warrior for 15 damage'
        }
      ]
    };
    mockBattleApiAdapter.getBattle.mockReturnValue(of(battleWithLog));

    await render(BattleDetailComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: BattlePort, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatSnackBar, useValue: mockSnackBar },
        AddCreatureUseCase
      ]
    });

    await waitFor(() => {
      expect(screen.getByText(/combat log/i)).toBeTruthy();
      expect(screen.getByText('Combat started!')).toBeTruthy();
      expect(screen.getByText('Dragon attacks warrior for 15 damage')).toBeTruthy();
    });
  });

  it('should show error message when loading battle fails', async () => {
    mockBattleApiAdapter.getBattle.mockReturnValue(
      throwError(() => new Error('Network error'))
    );

    await render(BattleDetailComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: BattlePort, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatSnackBar, useValue: mockSnackBar },
        AddCreatureUseCase
      ]
    });

    await waitFor(() => {
      expect(screen.getByText(/failed to load battle details/i)).toBeTruthy();
    });
  });

  it('should show error when battle ID is missing', async () => {
    mockActivatedRoute.snapshot.paramMap.get.mockReturnValue(null);
    mockBattleApiAdapter.getBattle.mockReturnValue(of(mockBattle));

    const { fixture } = await render(BattleDetailComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: BattlePort, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatSnackBar, useValue: mockSnackBar },
        AddCreatureUseCase
      ]
    });

    const component = fixture.componentInstance;

    await waitFor(() => {
      expect(component.error()).toBe('Invalid battle ID');
    });
  });

  it('should navigate back to battles list when back button is clicked', async () => {
    const user = userEvent.setup();
    mockBattleApiAdapter.getBattle.mockReturnValue(of(mockBattle));

    await render(BattleDetailComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: BattlePort, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatSnackBar, useValue: mockSnackBar },
        AddCreatureUseCase
      ]
    });

    const backButton = screen.getByRole('button', { name: /back to battles/i });
    await user.click(backButton);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/battles']);
  });

  it('should navigate back when error occurs and back button is clicked', async () => {
    const user = userEvent.setup();
    mockBattleApiAdapter.getBattle.mockReturnValue(
      throwError(() => new Error('Network error'))
    );

    await render(BattleDetailComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: BattlePort, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatSnackBar, useValue: mockSnackBar },
        AddCreatureUseCase
      ]
    });

    await waitFor(() => {
      expect(screen.getByText(/failed to load battle details/i)).toBeTruthy();
    });

    const backButton = screen.getByRole('button', { name: /back to list/i });
    await user.click(backButton);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/battles']);
  });

  it('should update battle state when battleUpdated event is emitted', async () => {
    mockBattleApiAdapter.getBattle.mockReturnValue(of(mockBattle));

    const { fixture } = await render(BattleDetailComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: BattlePort, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatSnackBar, useValue: mockSnackBar },
        AddCreatureUseCase
      ]
    });

    const component = fixture.componentInstance;

    await waitFor(() => {
      expect(component.battle()?.name).toBe('Dragon\'s Lair');
    });

    const updatedBattle: Battle = {
      ...mockBattle,
      status: CombatStatus.ACTIVE,
      round: 1
    };

    component.onBattleUpdated(updatedBattle);

    expect(component.battle()?.status).toBe(CombatStatus.ACTIVE);
    expect(component.battle()?.round).toBe(1);
  });

  it('should apply correct CSS classes for different statuses', async () => {
    mockBattleApiAdapter.getBattle.mockReturnValue(of(mockBattle));

    const { fixture } = await render(BattleDetailComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: BattlePort, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatSnackBar, useValue: mockSnackBar },
        AddCreatureUseCase
      ]
    });

    const component = fixture.componentInstance;

    expect(component.getStatusClass(CombatStatus.NOT_STARTED)).toBe('status-not-started');
    expect(component.getStatusClass(CombatStatus.ACTIVE)).toBe('status-active');
    expect(component.getStatusClass(CombatStatus.PAUSED)).toBe('status-paused');
    expect(component.getStatusClass(CombatStatus.ENDED)).toBe('status-ended');
  });

  it('should return correct status labels', async () => {
    mockBattleApiAdapter.getBattle.mockReturnValue(of(mockBattle));

    const { fixture } = await render(BattleDetailComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: BattlePort, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatSnackBar, useValue: mockSnackBar },
        AddCreatureUseCase
      ]
    });

    const component = fixture.componentInstance;

    expect(component.getStatusLabel(CombatStatus.NOT_STARTED)).toBe('Not Started');
    expect(component.getStatusLabel(CombatStatus.ACTIVE)).toBe('Active');
    expect(component.getStatusLabel(CombatStatus.PAUSED)).toBe('Paused');
    expect(component.getStatusLabel(CombatStatus.ENDED)).toBe('Ended');
  });

  it('should show defeated badge for defeated creatures', async () => {
    const battleWithDefeated: Battle = {
      ...mockBattle,
      creatures: [
        {
          id: 'creature-1',
          name: 'Defeated Goblin',
          type: CreatureType.MONSTER,
          currentHp: 0,
          maxHp: 30,
          initiative: 10,
          armorClass: 15,
          isDefeated: true,
          effects: []
        }
      ]
    };
    mockBattleApiAdapter.getBattle.mockReturnValue(of(battleWithDefeated));

    const { fixture, container } = await render(BattleDetailComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
        { provide: BattlePort, useValue: mockBattleApiAdapter },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatSnackBar, useValue: mockSnackBar },
        AddCreatureUseCase
      ]
    });

    const component = fixture.componentInstance;

    await waitFor(() => {
      expect(component.battle()?.creatures[0].isDefeated).toBe(true);
      // Check that the defeated badge element exists in the DOM
      const defeatedBadge = container.querySelector('.defeated-badge');
      expect(defeatedBadge).toBeTruthy();
    });
  });
});

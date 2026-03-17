import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { of } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { CombatPrepareComponent } from './combat-prepare.component';
import { BattleApiAdapter } from '../../../../adapters/api/battle-api.adapter';
import { Battle, CombatStatus, CreatureType } from '../../../../core/domain/models/battle.model';
import { BattlePort } from '../../../../core/ports/battle.port';

describe('CombatPrepareComponent', () => {
  const monster = {
    id: 'm1', name: 'Goblin', type: CreatureType.MONSTER,
    currentHp: 20, maxHp: 20, initiative: 0, armorClass: 13,
    isDefeated: false, effects: []
  };
  const player = {
    id: 'p1', name: 'Aragorn', type: CreatureType.PLAYER,
    currentHp: 40, maxHp: 60, initiative: 0, armorClass: 16,
    isDefeated: false, effects: []
  };

  const mockBattle: Battle = {
    id: 'battle-42',
    name: 'The Last Stand',
    status: CombatStatus.NOT_STARTED,
    creatures: [monster, player],
    currentTurn: 0,
    round: 0,
    createdAt: '2026-01-01T00:00:00Z',
    lastModified: '2026-01-01T00:00:00Z'
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
    removeCreature: vi.fn(),
    advanceTurn: vi.fn(),
    applyDamage: vi.fn(),
    applyHealing: vi.fn(),
    applyStatusEffect: vi.fn(),
    getCombatLog: vi.fn()
  };

  const mockRouter = { navigate: vi.fn() };

  const mockActivatedRoute = {
    snapshot: { paramMap: { get: vi.fn() } }
  };

  const defaultProviders = [
    { provide: BattleApiAdapter, useValue: mockBattleApiAdapter },
    { provide: BattlePort, useValue: mockBattleApiAdapter },
    { provide: Router, useValue: mockRouter },
    { provide: ActivatedRoute, useValue: mockActivatedRoute }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('battle-42');
  });

  it('loads battle on init', async () => {
    mockBattleApiAdapter.getBattle.mockReturnValue(of(mockBattle));
    await render(CombatPrepareComponent, { providers: defaultProviders });
    expect(mockBattleApiAdapter.getBattle).toHaveBeenCalledWith('battle-42');
  });

  it('shows battle name', async () => {
    mockBattleApiAdapter.getBattle.mockReturnValue(of(mockBattle));
    await render(CombatPrepareComponent, { providers: defaultProviders });
    await waitFor(() => expect(screen.getByText('The Last Stand')).toBeTruthy());
  });

  it('shows enemy and player counts', async () => {
    mockBattleApiAdapter.getBattle.mockReturnValue(of(mockBattle));
    await render(CombatPrepareComponent, { providers: defaultProviders });
    await waitFor(() => {
      expect(screen.getByText(/enemies/i)).toBeTruthy();
      expect(screen.getByText(/players/i)).toBeTruthy();
    });
  });

  it('renders a card for each creature', async () => {
    mockBattleApiAdapter.getBattle.mockReturnValue(of(mockBattle));
    await render(CombatPrepareComponent, { providers: defaultProviders });
    await waitFor(() => {
      expect(screen.getByText('Goblin')).toBeTruthy();
      expect(screen.getByText('Aragorn')).toBeTruthy();
    });
  });

  it('disables Start Battle when creature list is empty', async () => {
    const emptyBattle = { ...mockBattle, creatures: [] };
    mockBattleApiAdapter.getBattle.mockReturnValue(of(emptyBattle));
    await render(CombatPrepareComponent, { providers: defaultProviders });
    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /start battle/i });
      expect((btn as HTMLButtonElement).disabled).toBe(true);
    });
  });

  it('navigates to initiative screen when Start Battle clicked', async () => {
    const user = userEvent.setup();
    mockBattleApiAdapter.getBattle.mockReturnValue(of(mockBattle));
    await render(CombatPrepareComponent, { providers: defaultProviders });
    await waitFor(() => screen.getByRole('button', { name: /start battle/i }));
    await user.click(screen.getByRole('button', { name: /start battle/i }));
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/battles', 'battle-42', 'initiative']);
  });

  it('redirects to active combat screen when battle is already ACTIVE', async () => {
    const activeBattle = { ...mockBattle, status: CombatStatus.ACTIVE };
    mockBattleApiAdapter.getBattle.mockReturnValue(of(activeBattle));
    await render(CombatPrepareComponent, { providers: defaultProviders });
    await waitFor(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/battles', 'battle-42', 'combat']);
    });
  });

  it('redirects to result screen when battle is ENDED', async () => {
    const endedBattle = { ...mockBattle, status: CombatStatus.ENDED };
    mockBattleApiAdapter.getBattle.mockReturnValue(of(endedBattle));
    await render(CombatPrepareComponent, { providers: defaultProviders });
    await waitFor(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/battles', 'battle-42', 'result']);
    });
  });
});

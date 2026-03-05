import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { of } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { CombatActiveComponent } from './combat-active.component';
import { BattlePort, CombatOutcome } from '../../../../core/ports/battle.port';
import { Battle, CombatStatus, CreatureType } from '../../../../core/domain/models/battle.model';
import { CombatContributionService } from '../../services/combat-contribution.service';

describe('CombatActiveComponent', () => {
  const fighter = {
    id: 'c1', name: 'Fighter', type: CreatureType.PLAYER,
    currentHp: 30, maxHp: 40, initiative: 15,
    armorClass: 16, isDefeated: false, effects: []
  };
  const dragon = {
    id: 'c2', name: 'Dragon', type: CreatureType.MONSTER,
    currentHp: 80, maxHp: 100, initiative: 8,
    armorClass: 20, isDefeated: false, effects: []
  };

  const activeBattle: Battle = {
    id: 'battle-1',
    name: 'The Dragon Lair',
    status: CombatStatus.ACTIVE,
    creatures: [dragon, fighter], // deliberately unordered
    currentTurn: 0,
    round: 2,
    createdAt: '2026-01-01T00:00:00Z',
    lastModified: '2026-01-01T00:00:00Z'
  };

  const mockBattlePort = {
    createBattle: vi.fn(),
    listBattles: vi.fn(),
    getBattle: vi.fn(),
    startCombat: vi.fn(),
    pauseCombat: vi.fn(),
    resumeCombat: vi.fn(),
    endCombat: vi.fn(),
    advanceTurn: vi.fn(),
    applyDamage: vi.fn(),
    applyHealing: vi.fn(),
    applyStatusEffect: vi.fn(),
    getCombatLog: vi.fn(),
    deleteBattle: vi.fn(),
    addCreature: vi.fn(),
    updateCreature: vi.fn(),
    removeCreature: vi.fn()
  };

  const mockContributionService = {
    startTimer: vi.fn(),
    stopTimer: vi.fn(),
    recordDamage: vi.fn(),
    recordHealing: vi.fn(),
    recordStatusApplied: vi.fn(),
    getContributions: vi.fn(() => []),
    getElapsedMs: vi.fn(() => 0),
    reset: vi.fn()
  };

  const mockRouter = { navigate: vi.fn() };
  const mockActivatedRoute = { snapshot: { paramMap: { get: vi.fn() } } };

  const defaultProviders = [
    { provide: BattlePort, useValue: mockBattlePort },
    { provide: CombatContributionService, useValue: mockContributionService },
    { provide: Router, useValue: mockRouter },
    { provide: ActivatedRoute, useValue: mockActivatedRoute }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockActivatedRoute.snapshot.paramMap.get.mockReturnValue('battle-1');
  });

  it('loads battle on init', async () => {
    mockBattlePort.getBattle.mockReturnValue(of(activeBattle));
    await render(CombatActiveComponent, { providers: defaultProviders });
    expect(mockBattlePort.getBattle).toHaveBeenCalledWith('battle-1');
  });

  it('redirects to prepare screen if battle is NOT_STARTED', async () => {
    const notStartedBattle = { ...activeBattle, status: CombatStatus.NOT_STARTED };
    mockBattlePort.getBattle.mockReturnValue(of(notStartedBattle));
    await render(CombatActiveComponent, { providers: defaultProviders });
    await waitFor(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['../'],
        expect.objectContaining({ relativeTo: mockActivatedRoute })
      );
    });
  });

  it('shows CURRENT label for the active combatant', async () => {
    mockBattlePort.getBattle.mockReturnValue(of(activeBattle));
    await render(CombatActiveComponent, { providers: defaultProviders });
    await waitFor(() => {
      expect(screen.getByText('CURRENT')).toBeTruthy();
    });
  });

  it('sorts creatures by initiative descending', async () => {
    mockBattlePort.getBattle.mockReturnValue(of(activeBattle));
    const { container } = await render(CombatActiveComponent, { providers: defaultProviders });
    await waitFor(() => screen.getByText('Fighter'));
    const names = Array.from(container.querySelectorAll('.combatant-card'))
      .map((el) => el.querySelector('.creature-name')?.textContent?.trim());
    expect(names[0]).toBe('Fighter'); // initiative 15 is first
    expect(names[1]).toBe('Dragon');  // initiative 8 is second
  });

  it('opens action manager when a non-active creature is clicked', async () => {
    const user = userEvent.setup();
    mockBattlePort.getBattle.mockReturnValue(of(activeBattle));
    const { container } = await render(CombatActiveComponent, { providers: defaultProviders });
    await waitFor(() => screen.getByText('Dragon'));

    const cards = container.querySelectorAll('.combatant-card');
    await user.click(cards[1]); // second card = Dragon (non-active)
    expect(container.querySelector('.action-manager-panel')).toBeTruthy();
  });

  it('calls advanceTurn when Next Turn is clicked', async () => {
    const user = userEvent.setup();
    mockBattlePort.getBattle.mockReturnValue(of(activeBattle));
    mockBattlePort.advanceTurn.mockReturnValue(of({ ...activeBattle, currentTurn: 1 }));
    await render(CombatActiveComponent, { providers: defaultProviders });
    await waitFor(() => screen.getByRole('button', { name: /next turn/i }));
    await user.click(screen.getByRole('button', { name: /next turn/i }));
    expect(mockBattlePort.advanceTurn).toHaveBeenCalledWith('battle-1');
  });

  it('shows end combat dialog when End Combat is clicked', async () => {
    const user = userEvent.setup();
    mockBattlePort.getBattle.mockReturnValue(of(activeBattle));
    await render(CombatActiveComponent, { providers: defaultProviders });
    await waitFor(() => screen.getByRole('button', { name: /end combat/i }));
    await user.click(screen.getByRole('button', { name: /end combat/i }));
    await waitFor(() => {
      expect(screen.getByText(/victory/i)).toBeTruthy();
    });
  });

  it('calls endCombat with PLAYERS_VICTORIOUS and navigates to result on Victory', async () => {
    const user = userEvent.setup();
    mockBattlePort.getBattle.mockReturnValue(of(activeBattle));
    mockBattlePort.endCombat.mockReturnValue(of({ ...activeBattle, status: CombatStatus.ENDED }));
    await render(CombatActiveComponent, { providers: defaultProviders });
    await waitFor(() => screen.getByRole('button', { name: /end combat/i }));
    await user.click(screen.getByRole('button', { name: /end combat/i }));
    await waitFor(() => screen.getByRole('button', { name: /victory/i }));
    await user.click(screen.getByRole('button', { name: /victory/i }));
    expect(mockBattlePort.endCombat).toHaveBeenCalledWith('battle-1', CombatOutcome.PLAYERS_VICTORIOUS);
    await waitFor(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['../result'],
        expect.objectContaining({ relativeTo: mockActivatedRoute })
      );
    });
  });
});

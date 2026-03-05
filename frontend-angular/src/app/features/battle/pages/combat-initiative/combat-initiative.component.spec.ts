import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { of } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { CombatInitiativeComponent } from './combat-initiative.component';
import { BattleApiAdapter } from '../../../../adapters/api/battle-api.adapter';
import { Battle, CombatStatus, CreatureType } from '../../../../core/domain/models/battle.model';
import { BattlePort } from '../../../../core/ports/battle.port';

describe('CombatInitiativeComponent', () => {
  const monster = {
    id: 'm1', name: 'Goblin', type: CreatureType.MONSTER,
    currentHp: 7, maxHp: 7, initiative: 0, armorClass: 13,
    isDefeated: false, effects: [], dexModifier: 1
  };
  const player = {
    id: 'p1', name: 'Aragorn', type: CreatureType.PLAYER,
    currentHp: 40, maxHp: 60, initiative: 0, armorClass: 16,
    isDefeated: false, effects: [], dexModifier: 3
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
    mockBattleApiAdapter.getBattle.mockReturnValue(of(mockBattle));
    mockBattleApiAdapter.updateCreature.mockReturnValue(of(monster));
    mockBattleApiAdapter.startCombat.mockReturnValue(of({ ...mockBattle, status: CombatStatus.ACTIVE }));
  });

  it('renders a row for each combatant', async () => {
    await render(CombatInitiativeComponent, { providers: defaultProviders });
    await waitFor(() => {
      expect(screen.getByText('Goblin')).toBeTruthy();
      expect(screen.getByText('Aragorn')).toBeTruthy();
    });
  });

  it('shows PC badge for player type', async () => {
    await render(CombatInitiativeComponent, { providers: defaultProviders });
    await waitFor(() => expect(screen.getByText('PC')).toBeTruthy());
  });

  it('shows formatted dex modifier for players', async () => {
    await render(CombatInitiativeComponent, { providers: defaultProviders });
    await waitFor(() => expect(screen.getByText('+3')).toBeTruthy());
  });

  it('disables START BATTLE when any combatant has no initiative value', async () => {
    await render(CombatInitiativeComponent, { providers: defaultProviders });
    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /start battle/i });
      expect((btn as HTMLButtonElement).disabled).toBe(true);
    });
  });

  it('enables START BATTLE when all combatants have initiative set', async () => {
    const user = userEvent.setup();
    await render(CombatInitiativeComponent, { providers: defaultProviders });
    await waitFor(() => screen.getAllByRole('spinbutton'));

    const inputs = screen.getAllByRole('spinbutton');
    for (const input of inputs) {
      await user.clear(input);
      await user.type(input, '10');
    }

    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /start battle/i });
      expect((btn as HTMLButtonElement).disabled).toBe(false);
    });
  });

  it('calls startCombat and navigates to ../combat when START BATTLE clicked', async () => {
    const user = userEvent.setup();
    await render(CombatInitiativeComponent, { providers: defaultProviders });
    await waitFor(() => screen.getAllByRole('spinbutton'));

    const inputs = screen.getAllByRole('spinbutton');
    for (const input of inputs) {
      await user.clear(input);
      await user.type(input, '15');
    }

    await user.click(screen.getByRole('button', { name: /start battle/i }));

    await waitFor(() => {
      expect(mockBattleApiAdapter.startCombat).toHaveBeenCalledWith('battle-42');
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['../combat'],
        expect.objectContaining({ relativeTo: mockActivatedRoute })
      );
    });
  });

  it('navigates back to ../ when back button clicked', async () => {
    const user = userEvent.setup();
    await render(CombatInitiativeComponent, { providers: defaultProviders });
    await waitFor(() => screen.getByRole('button', { name: /back/i }));
    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['../'],
      expect.objectContaining({ relativeTo: mockActivatedRoute })
    );
  });
});

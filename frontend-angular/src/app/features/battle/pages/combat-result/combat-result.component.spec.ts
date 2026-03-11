import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { of } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { CombatResultComponent } from './combat-result.component';
import { BattlePort, CombatOutcome } from '../../../../core/ports/battle.port';
import { Battle, CombatStatus, CreatureType } from '../../../../core/domain/models/battle.model';
import { CombatContributionService } from '../../services/combat-contribution.service';
import { CombatContribution } from '../../../../core/domain/models/combat.model';

describe('CombatResultComponent', () => {
  const endedBattle: Battle = {
    id: 'battle-1',
    name: 'Dragon Fight',
    status: CombatStatus.ENDED,
    creatures: [],
    currentTurn: 0,
    round: 5,
    createdAt: '2026-01-01T00:00:00Z',
    lastModified: '2026-01-01T00:00:00Z'
  };

  const mockContributions: CombatContribution[] = [
    {
      creatureId: 'p1',
      creatureName: 'Paladin',
      creatureType: CreatureType.PLAYER,
      totalDamage: 50,
      totalHealing: 20,
      criticalHits: 2,
      buffsApplied: 3
    },
    {
      creatureId: 'p2',
      creatureName: 'Rogue',
      creatureType: CreatureType.PLAYER,
      totalDamage: 80,
      totalHealing: 0,
      criticalHits: 4,
      buffsApplied: 1
    }
  ];

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
    getContributions: vi.fn(() => mockContributions),
    getElapsedMs: vi.fn(() => 185000),
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
    mockBattlePort.getBattle.mockReturnValue(of(endedBattle));
  });

  it('shows VICTORY when outcome is PLAYERS_VICTORIOUS', async () => {
    window.history.replaceState({ outcome: CombatOutcome.PLAYERS_VICTORIOUS }, '');
    await render(CombatResultComponent, { providers: defaultProviders });
    await waitFor(() => expect(screen.getByText('VICTORY')).toBeTruthy());
  });

  it('shows DEFEAT when outcome is PLAYERS_DEFEATED', async () => {
    window.history.replaceState({ outcome: CombatOutcome.PLAYERS_DEFEATED }, '');
    await render(CombatResultComponent, { providers: defaultProviders });
    await waitFor(() => expect(screen.getByText('DEFEAT')).toBeTruthy());
  });

  it('shows total rounds from battle', async () => {
    window.history.replaceState({ outcome: CombatOutcome.PLAYERS_VICTORIOUS }, '');
    await render(CombatResultComponent, { providers: defaultProviders });
    await waitFor(() => expect(screen.getByText('5')).toBeTruthy());
  });

  it('shows player contributions sorted by total damage descending', async () => {
    window.history.replaceState({ outcome: CombatOutcome.PLAYERS_VICTORIOUS }, '');
    await render(CombatResultComponent, { providers: defaultProviders });
    await waitFor(() => {
      expect(screen.getByText('Rogue')).toBeTruthy();    // 80 dmg — first
      expect(screen.getByText('Paladin')).toBeTruthy();  // 50 dmg — second
    });
    // Rogue (higher damage) should appear before Paladin in DOM
    const names = Array.from(screen.getAllByText(/Rogue|Paladin/)).map(el => el.textContent);
    expect(names[0]).toBe('Rogue');
  });

  it('shows formatted elapsed time', async () => {
    window.history.replaceState({ outcome: CombatOutcome.PLAYERS_VICTORIOUS }, '');
    await render(CombatResultComponent, { providers: defaultProviders });
    await waitFor(() => expect(screen.getByText('3m 5s')).toBeTruthy());
  });

  it('navigates to /home on End Encounter click', async () => {
    const user = userEvent.setup();
    window.history.replaceState({ outcome: CombatOutcome.PLAYERS_VICTORIOUS }, '');
    await render(CombatResultComponent, { providers: defaultProviders });
    await user.click(screen.getByRole('button', { name: /end encounter/i }));
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('calls reset() on End Encounter', async () => {
    const user = userEvent.setup();
    window.history.replaceState({ outcome: CombatOutcome.PLAYERS_VICTORIOUS }, '');
    await render(CombatResultComponent, { providers: defaultProviders });
    await user.click(screen.getByRole('button', { name: /end encounter/i }));
    expect(mockContributionService.reset).toHaveBeenCalled();
  });
});

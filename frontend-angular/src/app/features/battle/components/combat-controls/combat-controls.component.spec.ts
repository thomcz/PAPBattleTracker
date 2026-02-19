import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { CombatControlsComponent } from './combat-controls.component';
import { BattleApiAdapter } from '../../../../adapters/api/battle-api.adapter';
import { Battle, CombatStatus, CreatureType } from '../../../../core/domain/models/battle.model';
import { CombatOutcome } from '../../../../core/ports/battle.port';

describe('CombatControlsComponent', () => {
  const createMockBattle = (status: CombatStatus, hasCreatures = true): Battle => ({
    id: 'battle-123',
    name: 'Test Battle',
    status,
    creatures: hasCreatures ? [
      {
        id: 'creature-1',
        name: 'Dragon',
        type: CreatureType.MONSTER,
        currentHp: 100,
        maxHp: 100,
        initiative: 15,
        armorClass: 20,
        isDefeated: false,
        effects: []
      }
    ] : [],
    currentTurn: 0,
    round: 0,
    createdAt: '2024-01-01T10:00:00Z',
    lastModified: '2024-01-01T11:00:00Z'
  });

  const mockBattleApiAdapter = {
    createBattle: vi.fn(),
    listBattles: vi.fn(),
    getBattle: vi.fn(),
    startCombat: vi.fn(),
    pauseCombat: vi.fn(),
    resumeCombat: vi.fn(),
    endCombat: vi.fn(),
    advanceTurn: vi.fn(),
    deleteBattle: vi.fn(),
    applyDamage: vi.fn(),
    getCombatLog: vi.fn(),
    updateCreature: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render combat controls', async () => {
    const battle = createMockBattle(CombatStatus.NOT_STARTED);

    await render(CombatControlsComponent, {
      componentInputs: { battle },
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
      ]
    });

    expect(screen.getByText('Combat Controls')).toBeTruthy();
    expect(screen.getByRole('button', { name: /start combat/i })).toBeTruthy();
  });

  describe('Start Combat Button', () => {
    it('should be enabled when battle is NOT_STARTED and has creatures', async () => {
      const battle = createMockBattle(CombatStatus.NOT_STARTED);

      await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const startButton = screen.getByRole('button', { name: /start combat/i });
      expect(startButton.hasAttribute('disabled')).toBe(false);
    });

    it('should be disabled when battle has no creatures', async () => {
      const battle = createMockBattle(CombatStatus.NOT_STARTED, false);

      await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const startButton = screen.getByRole('button', { name: /start combat/i });
      expect(startButton.hasAttribute('disabled')).toBe(true);
    });

    it('should show tooltip when no creatures exist', async () => {
      const battle = createMockBattle(CombatStatus.NOT_STARTED, false);

      await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const startButton = screen.getByRole('button', { name: /start combat/i });
      expect(startButton.getAttribute('title')).toBe('Add at least one creature to start combat');
    });

    it('should open initiative dialog when clicked', async () => {
      const user = userEvent.setup();
      const battle = createMockBattle(CombatStatus.NOT_STARTED);

      const { fixture } = await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const component = fixture.componentInstance;
      expect(component.showInitiativeDialog()).toBe(false);

      const startButton = screen.getByRole('button', { name: /start combat/i });
      await user.click(startButton);

      expect(component.showInitiativeDialog()).toBe(true);
      await waitFor(() => {
        expect(screen.getByText(/roll initiative/i)).toBeTruthy();
      });
    });
  });

  describe('Pause Combat Button', () => {
    it('should be enabled when battle is ACTIVE', async () => {
      const battle = createMockBattle(CombatStatus.ACTIVE);

      await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const pauseButton = screen.getByRole('button', { name: /pause combat/i });
      expect(pauseButton.hasAttribute('disabled')).toBe(false);
    });

    it('should be disabled when battle is NOT_STARTED', async () => {
      const battle = createMockBattle(CombatStatus.NOT_STARTED);

      await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const pauseButton = screen.getByRole('button', { name: /pause combat/i });
      expect(pauseButton.hasAttribute('disabled')).toBe(true);
    });

    it('should pause combat when clicked', async () => {
      const user = userEvent.setup();
      const battle = createMockBattle(CombatStatus.ACTIVE);
      const updatedBattle = { ...battle, status: CombatStatus.PAUSED };
      mockBattleApiAdapter.pauseCombat.mockReturnValue(of(updatedBattle));

      const { fixture } = await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const component = fixture.componentInstance;
      const battleUpdatedSpy = vi.fn();
      component.battleUpdated.subscribe(battleUpdatedSpy);

      const pauseButton = screen.getByRole('button', { name: /pause combat/i });
      await user.click(pauseButton);

      await waitFor(() => {
        expect(mockBattleApiAdapter.pauseCombat).toHaveBeenCalledWith('battle-123');
        expect(battleUpdatedSpy).toHaveBeenCalledWith(updatedBattle);
      });
    });

    it('should show error when pausing combat fails', async () => {
      const user = userEvent.setup();
      const battle = createMockBattle(CombatStatus.ACTIVE);
      mockBattleApiAdapter.pauseCombat.mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const pauseButton = screen.getByRole('button', { name: /pause combat/i });
      await user.click(pauseButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to pause combat/i)).toBeTruthy();
      });
    });
  });

  describe('Resume Combat Button', () => {
    it('should be enabled when battle is PAUSED', async () => {
      const battle = createMockBattle(CombatStatus.PAUSED);

      await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const resumeButton = screen.getByRole('button', { name: /resume combat/i });
      expect(resumeButton.hasAttribute('disabled')).toBe(false);
    });

    it('should be disabled when battle is ACTIVE', async () => {
      const battle = createMockBattle(CombatStatus.ACTIVE);

      await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const resumeButton = screen.getByRole('button', { name: /resume combat/i });
      expect(resumeButton.hasAttribute('disabled')).toBe(true);
    });

    it('should resume combat when clicked', async () => {
      const user = userEvent.setup();
      const battle = createMockBattle(CombatStatus.PAUSED);
      const updatedBattle = { ...battle, status: CombatStatus.ACTIVE };
      mockBattleApiAdapter.resumeCombat.mockReturnValue(of(updatedBattle));

      const { fixture } = await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const component = fixture.componentInstance;
      const battleUpdatedSpy = vi.fn();
      component.battleUpdated.subscribe(battleUpdatedSpy);

      const resumeButton = screen.getByRole('button', { name: /resume combat/i });
      await user.click(resumeButton);

      await waitFor(() => {
        expect(mockBattleApiAdapter.resumeCombat).toHaveBeenCalledWith('battle-123');
        expect(battleUpdatedSpy).toHaveBeenCalledWith(updatedBattle);
      });
    });

    it('should show error when resuming combat fails', async () => {
      const user = userEvent.setup();
      const battle = createMockBattle(CombatStatus.PAUSED);
      mockBattleApiAdapter.resumeCombat.mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const resumeButton = screen.getByRole('button', { name: /resume combat/i });
      await user.click(resumeButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to resume combat/i)).toBeTruthy();
      });
    });
  });

  describe('End Combat Button and Dialog', () => {
    it('should be enabled when battle is ACTIVE', async () => {
      const battle = createMockBattle(CombatStatus.ACTIVE);

      await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const endButton = screen.getByRole('button', { name: /end combat/i });
      expect(endButton.hasAttribute('disabled')).toBe(false);
    });

    it('should be enabled when battle is PAUSED', async () => {
      const battle = createMockBattle(CombatStatus.PAUSED);

      await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const endButton = screen.getByRole('button', { name: /end combat/i });
      expect(endButton.hasAttribute('disabled')).toBe(false);
    });

    it('should be disabled when battle is NOT_STARTED', async () => {
      const battle = createMockBattle(CombatStatus.NOT_STARTED);

      await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const endButton = screen.getByRole('button', { name: /end combat/i });
      expect(endButton.hasAttribute('disabled')).toBe(true);
    });

    it('should open end dialog when clicked', async () => {
      const user = userEvent.setup();
      const battle = createMockBattle(CombatStatus.ACTIVE);

      const { fixture } = await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const component = fixture.componentInstance;
      expect(component.showEndDialog()).toBe(false);

      const endButton = screen.getByRole('button', { name: /end combat/i });
      await user.click(endButton);

      expect(component.showEndDialog()).toBe(true);
      await waitFor(() => {
        expect(screen.getByText(/how did the combat end/i)).toBeTruthy();
      });
    });

    it('should close end dialog when cancel is clicked', async () => {
      const user = userEvent.setup();
      const battle = createMockBattle(CombatStatus.ACTIVE);

      const { fixture } = await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const component = fixture.componentInstance;
      component.openEndDialog();
      fixture.detectChanges();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeTruthy();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(component.showEndDialog()).toBe(false);
    });

    it('should close end dialog when close button is clicked', async () => {
      const user = userEvent.setup();
      const battle = createMockBattle(CombatStatus.ACTIVE);

      const { fixture } = await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const component = fixture.componentInstance;
      component.openEndDialog();
      fixture.detectChanges();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /close dialog/i })).toBeTruthy();
      });

      const closeButton = screen.getByRole('button', { name: /close dialog/i });
      await user.click(closeButton);

      expect(component.showEndDialog()).toBe(false);
    });

    it('should end combat with victory outcome', async () => {
      const user = userEvent.setup();
      const battle = createMockBattle(CombatStatus.ACTIVE);
      const updatedBattle = { ...battle, status: CombatStatus.ENDED };
      mockBattleApiAdapter.endCombat.mockReturnValue(of(updatedBattle));

      const { fixture } = await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const component = fixture.componentInstance;
      const battleUpdatedSpy = vi.fn();
      component.battleUpdated.subscribe(battleUpdatedSpy);

      component.openEndDialog();
      fixture.detectChanges();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /players victory/i })).toBeTruthy();
      });

      const victoryButton = screen.getByRole('button', { name: /players victory/i });
      await user.click(victoryButton);

      await waitFor(() => {
        expect(mockBattleApiAdapter.endCombat).toHaveBeenCalledWith('battle-123', CombatOutcome.PLAYERS_VICTORIOUS);
        expect(battleUpdatedSpy).toHaveBeenCalledWith(updatedBattle);
        expect(component.showEndDialog()).toBe(false);
      });
    });

    it('should show error when ending combat fails', async () => {
      const user = userEvent.setup();
      const battle = createMockBattle(CombatStatus.ACTIVE);
      mockBattleApiAdapter.endCombat.mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      const { fixture } = await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const component = fixture.componentInstance;
      component.openEndDialog();
      fixture.detectChanges();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /players victory/i })).toBeTruthy();
      });

      const victoryButton = screen.getByRole('button', { name: /players victory/i });
      await user.click(victoryButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to end combat/i)).toBeTruthy();
      });
    });
  });

  describe('Status Display', () => {
    it('should display current battle status', async () => {
      const battle = createMockBattle(CombatStatus.ACTIVE);

      await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      expect(screen.getByText(/status:/i)).toBeTruthy();
      expect(screen.getByText('ACTIVE')).toBeTruthy();
    });

    it('should display round and current turn for active battles', async () => {
      const battle = {
        ...createMockBattle(CombatStatus.ACTIVE),
        round: 3,
        currentTurn: 0
      };

      await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      expect(screen.getByText(/round:/i)).toBeTruthy();
      expect(screen.getByText('3')).toBeTruthy();
      expect(screen.getByText(/current turn:/i)).toBeTruthy();
      expect(screen.getAllByText('Dragon').length).toBeGreaterThanOrEqual(1);
    });

    it('should not display round for not started battles', async () => {
      const battle = createMockBattle(CombatStatus.NOT_STARTED);

      const { container } = await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      expect(screen.queryByText(/round:/i)).toBeNull();
    });
  });

  describe('Next Turn Button', () => {
    it('should be enabled when battle is ACTIVE', async () => {
      const battle = createMockBattle(CombatStatus.ACTIVE);

      await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const nextTurnButton = screen.getByRole('button', { name: /next turn/i });
      expect(nextTurnButton.hasAttribute('disabled')).toBe(false);
    });

    it('should be disabled when battle is NOT_STARTED', async () => {
      const battle = createMockBattle(CombatStatus.NOT_STARTED);

      await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const nextTurnButton = screen.getByRole('button', { name: /next turn/i });
      expect(nextTurnButton.hasAttribute('disabled')).toBe(true);
    });

    it('should advance turn when clicked', async () => {
      const user = userEvent.setup();
      const battle = createMockBattle(CombatStatus.ACTIVE);
      const updatedBattle = { ...battle, currentTurn: 1 };
      mockBattleApiAdapter.advanceTurn.mockReturnValue(of(updatedBattle));

      const { fixture } = await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const component = fixture.componentInstance;
      const battleUpdatedSpy = vi.fn();
      component.battleUpdated.subscribe(battleUpdatedSpy);

      const nextTurnButton = screen.getByRole('button', { name: /next turn/i });
      await user.click(nextTurnButton);

      await waitFor(() => {
        expect(mockBattleApiAdapter.advanceTurn).toHaveBeenCalledWith('battle-123');
        expect(battleUpdatedSpy).toHaveBeenCalledWith(updatedBattle);
      });
    });

    it('should show error when advance turn fails', async () => {
      const user = userEvent.setup();
      const battle = createMockBattle(CombatStatus.ACTIVE);
      mockBattleApiAdapter.advanceTurn.mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const nextTurnButton = screen.getByRole('button', { name: /next turn/i });
      await user.click(nextTurnButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to advance turn/i)).toBeTruthy();
      });
    });
  });

  describe('Damage Dialog', () => {
    it('should show damage targets for active battles', async () => {
      const battle = createMockBattle(CombatStatus.ACTIVE);

      await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      expect(screen.getByText(/apply damage/i)).toBeTruthy();
    });

    it('should not show damage targets for non-active battles', async () => {
      const battle = createMockBattle(CombatStatus.NOT_STARTED);

      await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      expect(screen.queryByText(/apply damage/i)).toBeNull();
    });

    it('should open damage dialog when creature target is clicked', async () => {
      const user = userEvent.setup();
      const battle = createMockBattle(CombatStatus.ACTIVE);

      const { fixture } = await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const component = fixture.componentInstance;
      expect(component.showDamageDialog()).toBe(false);

      // Click the target button for the creature
      const targetButtons = screen.getAllByRole('button', { name: /dragon/i });
      await user.click(targetButtons[0]);

      expect(component.showDamageDialog()).toBe(true);
      await waitFor(() => {
        expect(screen.getByLabelText(/damage amount/i)).toBeTruthy();
      });
    });

    it('should apply damage when form is submitted', async () => {
      const user = userEvent.setup();
      const battle = createMockBattle(CombatStatus.ACTIVE);
      const updatedBattle = { ...battle };
      mockBattleApiAdapter.applyDamage.mockReturnValue(of(updatedBattle));

      const { fixture } = await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const component = fixture.componentInstance;
      const battleUpdatedSpy = vi.fn();
      component.battleUpdated.subscribe(battleUpdatedSpy);

      // Open damage dialog
      component.openDamageDialog(battle.creatures[0]);
      fixture.detectChanges();

      await waitFor(() => {
        expect(screen.getByLabelText(/damage amount/i)).toBeTruthy();
      });

      // Click apply damage button
      const applyButton = screen.getByRole('button', { name: /apply damage/i });
      await user.click(applyButton);

      await waitFor(() => {
        expect(mockBattleApiAdapter.applyDamage).toHaveBeenCalledWith(
          'battle-123', 'creature-1', 1, undefined
        );
        expect(battleUpdatedSpy).toHaveBeenCalledWith(updatedBattle);
      });
    });

    it('should show error when damage application fails', async () => {
      const user = userEvent.setup();
      const battle = createMockBattle(CombatStatus.ACTIVE);
      mockBattleApiAdapter.applyDamage.mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      const { fixture } = await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const component = fixture.componentInstance;
      component.openDamageDialog(battle.creatures[0]);
      fixture.detectChanges();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /apply damage/i })).toBeTruthy();
      });

      const applyButton = screen.getByRole('button', { name: /apply damage/i });
      await user.click(applyButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to apply damage/i)).toBeTruthy();
      });
    });

    it('should close damage dialog when cancel is clicked', async () => {
      const user = userEvent.setup();
      const battle = createMockBattle(CombatStatus.ACTIVE);

      const { fixture } = await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const component = fixture.componentInstance;
      component.openDamageDialog(battle.creatures[0]);
      fixture.detectChanges();

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: /cancel/i }).length).toBeGreaterThanOrEqual(1);
      });

      const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
      await user.click(cancelButtons[cancelButtons.length - 1]);

      expect(component.showDamageDialog()).toBe(false);
    });

    it('should not show defeated creatures as damage targets', async () => {
      const battle = {
        ...createMockBattle(CombatStatus.ACTIVE),
        creatures: [
          {
            id: 'creature-1',
            name: 'Alive Dragon',
            type: CreatureType.MONSTER,
            currentHp: 100,
            maxHp: 100,
            initiative: 15,
            armorClass: 20,
            isDefeated: false,
            effects: []
          },
          {
            id: 'creature-2',
            name: 'Dead Goblin',
            type: CreatureType.MONSTER,
            currentHp: 0,
            maxHp: 30,
            initiative: 10,
            armorClass: 12,
            isDefeated: true,
            effects: []
          }
        ]
      };

      await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      // Only alive creature should appear as damage target
      expect(screen.getAllByText('Alive Dragon').length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByText('Dead Goblin')).toBeNull();
    });
  });

  describe('Initiative Dialog', () => {
    const createBattleWithMultipleCreatures = () => ({
      ...createMockBattle(CombatStatus.NOT_STARTED),
      creatures: [
        {
          id: 'creature-1',
          name: 'Dragon',
          type: CreatureType.MONSTER,
          currentHp: 100,
          maxHp: 100,
          initiative: 15,
          armorClass: 20,
          isDefeated: false,
          effects: []
        },
        {
          id: 'creature-2',
          name: 'Fighter',
          type: CreatureType.PLAYER,
          currentHp: 50,
          maxHp: 50,
          initiative: 10,
          armorClass: 18,
          isDefeated: false,
          effects: []
        }
      ]
    });

    it('should open initiative dialog when Start Combat is clicked', async () => {
      const user = userEvent.setup();
      const battle = createBattleWithMultipleCreatures();

      const { fixture } = await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const component = fixture.componentInstance;
      const startButton = screen.getByRole('button', { name: /start combat/i });
      await user.click(startButton);

      expect(component.showInitiativeDialog()).toBe(true);
      await waitFor(() => {
        expect(screen.getByText(/roll initiative/i)).toBeTruthy();
        expect(screen.getByText('Dragon')).toBeTruthy();
        expect(screen.getByText('Fighter')).toBeTruthy();
      });
    });

    it('should pre-populate initiative values from creatures', async () => {
      const user = userEvent.setup();
      const battle = createBattleWithMultipleCreatures();

      await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const startButton = screen.getByRole('button', { name: /start combat/i });
      await user.click(startButton);

      await waitFor(() => {
        const dragonInput = screen.getByLabelText('Initiative for Dragon') as HTMLInputElement;
        const fighterInput = screen.getByLabelText('Initiative for Fighter') as HTMLInputElement;
        expect(dragonInput.value).toBe('15');
        expect(fighterInput.value).toBe('10');
      });
    });

    it('should close initiative dialog when cancel is clicked', async () => {
      const user = userEvent.setup();
      const battle = createBattleWithMultipleCreatures();

      const { fixture } = await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const component = fixture.componentInstance;
      component.openInitiativeDialog();
      fixture.detectChanges();

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: /cancel/i }).length).toBeGreaterThanOrEqual(1);
      });

      const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
      await user.click(cancelButtons[cancelButtons.length - 1]);

      expect(component.showInitiativeDialog()).toBe(false);
    });

    it('should close initiative dialog when close button is clicked', async () => {
      const user = userEvent.setup();
      const battle = createBattleWithMultipleCreatures();

      const { fixture } = await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const component = fixture.componentInstance;
      component.openInitiativeDialog();
      fixture.detectChanges();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /close dialog/i })).toBeTruthy();
      });

      const closeButton = screen.getByRole('button', { name: /close dialog/i });
      await user.click(closeButton);

      expect(component.showInitiativeDialog()).toBe(false);
    });

    it('should update creatures with changed initiative then start combat', async () => {
      const battle = createBattleWithMultipleCreatures();
      const updatedBattle = { ...battle, status: CombatStatus.ACTIVE };
      mockBattleApiAdapter.updateCreature.mockReturnValue(of(battle.creatures[0]));
      mockBattleApiAdapter.startCombat.mockReturnValue(of(updatedBattle));

      const { fixture } = await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const component = fixture.componentInstance;
      const battleUpdatedSpy = vi.fn();
      component.battleUpdated.subscribe(battleUpdatedSpy);

      // Open dialog and change Dragon's initiative
      component.openInitiativeDialog();
      component.updateInitiativeEntry(0, 20);
      fixture.detectChanges();

      // Confirm
      component.confirmInitiativeAndStartCombat();

      await waitFor(() => {
        // Only Dragon's initiative changed (15 -> 20), Fighter stays at 10
        expect(mockBattleApiAdapter.updateCreature).toHaveBeenCalledTimes(1);
        expect(mockBattleApiAdapter.updateCreature).toHaveBeenCalledWith(
          'battle-123', 'creature-1', 'Dragon', 100, 100, 20, 20
        );
        expect(mockBattleApiAdapter.startCombat).toHaveBeenCalledWith('battle-123');
        expect(battleUpdatedSpy).toHaveBeenCalledWith(updatedBattle);
        expect(component.showInitiativeDialog()).toBe(false);
      });
    });

    it('should skip updateCreature calls when no initiatives changed', async () => {
      const battle = createBattleWithMultipleCreatures();
      const updatedBattle = { ...battle, status: CombatStatus.ACTIVE };
      mockBattleApiAdapter.startCombat.mockReturnValue(of(updatedBattle));

      const { fixture } = await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const component = fixture.componentInstance;
      component.openInitiativeDialog();
      fixture.detectChanges();

      // Confirm without changing any values
      component.confirmInitiativeAndStartCombat();

      await waitFor(() => {
        expect(mockBattleApiAdapter.updateCreature).not.toHaveBeenCalled();
        expect(mockBattleApiAdapter.startCombat).toHaveBeenCalledWith('battle-123');
      });
    });

    it('should show error when confirm fails', async () => {
      const battle = createBattleWithMultipleCreatures();
      mockBattleApiAdapter.startCombat.mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      const { fixture } = await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const component = fixture.componentInstance;
      component.openInitiativeDialog();
      fixture.detectChanges();

      component.confirmInitiativeAndStartCombat();

      await waitFor(() => {
        expect(screen.getByText(/failed to start combat/i)).toBeTruthy();
      });
    });
  });
});

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
        currentHP: 100,
        maxHP: 100,
        initiative: 15,
        armorClass: 20,
        isDefeated: false,
        effects: []
      }
    ] : [],
    currentTurn: 0,
    round: 0,
    combatLog: [],
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
    deleteBattle: vi.fn()
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

    it('should start combat when clicked', async () => {
      const user = userEvent.setup();
      const battle = createMockBattle(CombatStatus.NOT_STARTED);
      const updatedBattle = { ...battle, status: CombatStatus.ACTIVE };
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

      const startButton = screen.getByRole('button', { name: /start combat/i });
      await user.click(startButton);

      await waitFor(() => {
        expect(mockBattleApiAdapter.startCombat).toHaveBeenCalledWith('battle-123');
        expect(battleUpdatedSpy).toHaveBeenCalledWith(updatedBattle);
      });
    });

    it('should show error when starting combat fails', async () => {
      const user = userEvent.setup();
      const battle = createMockBattle(CombatStatus.NOT_STARTED);
      mockBattleApiAdapter.startCombat.mockReturnValue(
        throwError(() => new Error('Network error'))
      );

      await render(CombatControlsComponent, {
        componentInputs: { battle },
        providers: [
          { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
        ]
      });

      const startButton = screen.getByRole('button', { name: /start combat/i });
      await user.click(startButton);

      await waitFor(() => {
        expect(screen.getByText(/failed to start combat/i)).toBeTruthy();
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
      expect(screen.getByText('Dragon')).toBeTruthy();
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
});

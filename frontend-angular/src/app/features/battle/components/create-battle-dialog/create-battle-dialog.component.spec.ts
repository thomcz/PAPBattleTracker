import { render, screen, fireEvent, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { of, throwError, Observable } from 'rxjs';
import { CreateBattleDialogComponent } from './create-battle-dialog.component';
import { BattleApiAdapter } from '../../../../adapters/api/battle-api.adapter';
import { Battle, BattleSummary, CombatStatus } from '../../../../core/domain/models/battle.model';

describe('CreateBattleDialogComponent', () => {
  const mockBattle: Battle = {
    id: 'battle-123',
    name: 'Dragon\'s Lair',
    status: CombatStatus.NOT_STARTED,
    creatures: [],
    currentTurn: 0,
    round: 0,
    combatLog: [],
    createdAt: '2024-01-01T12:00:00Z',
    lastModified: '2024-01-01T12:00:00Z'
  };

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

  it('should render the dialog with form elements', async () => {
    await render(CreateBattleDialogComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
      ]
    });

    expect(screen.getByRole('heading', { name: /create new battle/i })).toBeTruthy();
    expect(screen.getByLabelText(/battle name/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /create battle/i })).toBeTruthy();
  });

  it('should show validation error when name is empty and form is touched', async () => {
    const user = userEvent.setup();

    await render(CreateBattleDialogComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
      ]
    });

    const input = screen.getByLabelText(/battle name/i);

    // Focus and blur without entering text
    await user.click(input);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/battle name is required/i)).toBeTruthy();
    });
  });

  it('should show validation error when name is too short', async () => {
    const user = userEvent.setup();

    await render(CreateBattleDialogComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
      ]
    });

    const input = screen.getByLabelText(/battle name/i);

    await user.type(input, 'AB');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/battle name must be at least 3 characters/i)).toBeTruthy();
    });
  });

  it('should disable submit button when form is invalid', async () => {
    await render(CreateBattleDialogComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
      ]
    });

    const submitButton = screen.getByRole('button', { name: /create battle/i });
    expect(submitButton).toBeTruthy();
    expect(submitButton.hasAttribute('disabled')).toBe(true);
  });

  it('should enable submit button when form is valid', async () => {
    const user = userEvent.setup();

    await render(CreateBattleDialogComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
      ]
    });

    const input = screen.getByLabelText(/battle name/i);
    await user.type(input, 'Dragon\'s Lair');

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /create battle/i });
      expect(submitButton.hasAttribute('disabled')).toBe(false);
    });
  });

  it('should create battle and emit event on successful submission', async () => {
    const user = userEvent.setup();
    mockBattleApiAdapter.createBattle.mockReturnValue(of(mockBattle));

    const { fixture } = await render(CreateBattleDialogComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
      ]
    });

    const component = fixture.componentInstance;
    const battleCreatedSpy = vi.fn();
    component.battleCreated.subscribe(battleCreatedSpy);

    const input = screen.getByLabelText(/battle name/i);
    await user.type(input, 'Dragon\'s Lair');

    const submitButton = screen.getByRole('button', { name: /create battle/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockBattleApiAdapter.createBattle).toHaveBeenCalledWith('Dragon\'s Lair');
      expect(battleCreatedSpy).toHaveBeenCalledWith({
        id: 'battle-123',
        name: 'Dragon\'s Lair',
        status: CombatStatus.NOT_STARTED,
        createdAt: '2024-01-01T12:00:00Z',
        lastModified: '2024-01-01T12:00:00Z'
      });
    });
  });

  it('should show loading state during battle creation', async () => {
    const user = userEvent.setup();
    // Create a promise that we can control
    let resolveCreate: (value: Battle) => void;
    const createPromise = new Promise<Battle>((resolve) => {
      resolveCreate = resolve;
    });
    mockBattleApiAdapter.createBattle.mockReturnValue(of(mockBattle).pipe(
      // Delay the response
      (source) => new Observable(subscriber => {
        createPromise.then(battle => {
          subscriber.next(battle);
          subscriber.complete();
        });
      })
    ));

    await render(CreateBattleDialogComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
      ]
    });

    const input = screen.getByLabelText(/battle name/i);
    await user.type(input, 'Dragon\'s Lair');

    const submitButton = screen.getByRole('button', { name: /create battle/i });
    await user.click(submitButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/creating.../i)).toBeTruthy();
    });
  });

  it('should show error message when battle creation fails', async () => {
    const user = userEvent.setup();
    mockBattleApiAdapter.createBattle.mockReturnValue(
      throwError(() => new Error('Network error'))
    );

    await render(CreateBattleDialogComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
      ]
    });

    const input = screen.getByLabelText(/battle name/i);
    await user.type(input, 'Dragon\'s Lair');

    const submitButton = screen.getByRole('button', { name: /create battle/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to create battle/i)).toBeTruthy();
    });
  });

  it('should reset form and emit dialogClosed event when cancel is clicked', async () => {
    const user = userEvent.setup();

    const { fixture } = await render(CreateBattleDialogComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
      ]
    });

    const component = fixture.componentInstance;
    const dialogClosedSpy = vi.fn();
    component.dialogClosed.subscribe(dialogClosedSpy);

    const input = screen.getByLabelText(/battle name/i);
    await user.type(input, 'Dragon\'s Lair');

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(dialogClosedSpy).toHaveBeenCalled();
      expect(component.battleForm.value.name).toBeNull();
    });
  });

  it('should emit dialogClosed event when close button is clicked', async () => {
    const user = userEvent.setup();

    const { fixture } = await render(CreateBattleDialogComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
      ]
    });

    const component = fixture.componentInstance;
    const dialogClosedSpy = vi.fn();
    component.dialogClosed.subscribe(dialogClosedSpy);

    const closeButton = screen.getByRole('button', { name: /close dialog/i });
    await user.click(closeButton);

    expect(dialogClosedSpy).toHaveBeenCalled();
  });

  it('should reset form after successful battle creation', async () => {
    const user = userEvent.setup();
    mockBattleApiAdapter.createBattle.mockReturnValue(of(mockBattle));

    const { fixture } = await render(CreateBattleDialogComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
      ]
    });

    const component = fixture.componentInstance;

    const input = screen.getByLabelText(/battle name/i);
    await user.type(input, 'Dragon\'s Lair');

    const submitButton = screen.getByRole('button', { name: /create battle/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(component.battleForm.value.name).toBeNull();
    });
  });

  it('should clear error message when cancel is clicked', async () => {
    const user = userEvent.setup();
    mockBattleApiAdapter.createBattle.mockReturnValue(
      throwError(() => new Error('Network error'))
    );

    const { fixture } = await render(CreateBattleDialogComponent, {
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
      ]
    });

    const component = fixture.componentInstance;

    const input = screen.getByLabelText(/battle name/i);
    await user.type(input, 'Dragon\'s Lair');

    const submitButton = screen.getByRole('button', { name: /create battle/i });
    await user.click(submitButton);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/failed to create battle/i)).toBeTruthy();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(component.error()).toBeNull();
  });
});

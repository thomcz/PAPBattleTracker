import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { CombatLogComponent } from './combat-log.component';
import { BattleApiAdapter } from '../../../../adapters/api/battle-api.adapter';

describe('CombatLogComponent', () => {
  const mockBattleApiAdapter = {
    getCombatLog: vi.fn()
  };

  const mockLogResponse = {
    entries: [
      { type: 'ROUND_START', message: 'Round 1 begins', timestamp: '2024-01-01T12:00:00Z' },
      { type: 'DAMAGE', message: 'Dragon takes 15 damage', timestamp: '2024-01-01T12:01:00Z' },
      { type: 'DEFEAT', message: 'Goblin is defeated!', timestamp: '2024-01-01T12:02:00Z' }
    ],
    total: 3,
    limit: 50,
    offset: 0
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display log entries with messages', async () => {
    mockBattleApiAdapter.getCombatLog.mockReturnValue(of(mockLogResponse));

    await render(CombatLogComponent, {
      componentInputs: { battleId: 'battle-123' },
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
      ]
    });

    await waitFor(() => {
      expect(screen.getByText('Round 1 begins')).toBeTruthy();
      expect(screen.getByText('Dragon takes 15 damage')).toBeTruthy();
      expect(screen.getByText('Goblin is defeated!')).toBeTruthy();
    });
  });

  it('should display entry count in header', async () => {
    mockBattleApiAdapter.getCombatLog.mockReturnValue(of(mockLogResponse));

    await render(CombatLogComponent, {
      componentInputs: { battleId: 'battle-123' },
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
      ]
    });

    await waitFor(() => {
      expect(screen.getByText(/3 entries/i)).toBeTruthy();
    });
  });

  it('should display type badges for each entry', async () => {
    mockBattleApiAdapter.getCombatLog.mockReturnValue(of(mockLogResponse));

    await render(CombatLogComponent, {
      componentInputs: { battleId: 'battle-123' },
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
      ]
    });

    await waitFor(() => {
      expect(screen.getByText('ROUND_START')).toBeTruthy();
      expect(screen.getByText('DAMAGE')).toBeTruthy();
      expect(screen.getByText('DEFEAT')).toBeTruthy();
    });
  });

  it('should show empty state when no entries exist', async () => {
    mockBattleApiAdapter.getCombatLog.mockReturnValue(of({
      entries: [], total: 0, limit: 50, offset: 0
    }));

    await render(CombatLogComponent, {
      componentInputs: { battleId: 'battle-123' },
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
      ]
    });

    await waitFor(() => {
      expect(screen.getByText(/no combat events yet/i)).toBeTruthy();
    });
  });

  it('should show error message when fetch fails', async () => {
    mockBattleApiAdapter.getCombatLog.mockReturnValue(
      throwError(() => new Error('Network error'))
    );

    await render(CombatLogComponent, {
      componentInputs: { battleId: 'battle-123' },
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
      ]
    });

    await waitFor(() => {
      expect(screen.getByText(/failed to load combat log/i)).toBeTruthy();
    });
  });

  it('should call getCombatLog with the correct battleId', async () => {
    mockBattleApiAdapter.getCombatLog.mockReturnValue(of({
      entries: [], total: 0, limit: 50, offset: 0
    }));

    await render(CombatLogComponent, {
      componentInputs: { battleId: 'battle-456' },
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
      ]
    });

    expect(mockBattleApiAdapter.getCombatLog).toHaveBeenCalledWith('battle-456');
  });

  it('should reload log when refresh button is clicked', async () => {
    const user = userEvent.setup();
    mockBattleApiAdapter.getCombatLog.mockReturnValue(of({
      entries: [], total: 0, limit: 50, offset: 0
    }));

    await render(CombatLogComponent, {
      componentInputs: { battleId: 'battle-123' },
      providers: [
        { provide: BattleApiAdapter, useValue: mockBattleApiAdapter }
      ]
    });

    // First call from ngOnChanges
    expect(mockBattleApiAdapter.getCombatLog).toHaveBeenCalledTimes(1);

    const refreshButton = screen.getByTitle('Refresh log');
    await user.click(refreshButton);

    expect(mockBattleApiAdapter.getCombatLog).toHaveBeenCalledTimes(2);
  });
});

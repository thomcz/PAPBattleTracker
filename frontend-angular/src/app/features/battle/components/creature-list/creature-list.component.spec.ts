import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { CreatureListComponent } from './creature-list.component';
import { MatDialog } from '@angular/material/dialog';
import { Creature, CreatureType } from '../../../../core/domain/models/battle.model';
import { of, Subject } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('CreatureListComponent', () => {
  const mockCreatures: Creature[] = [
    {
      id: 'creature-1',
      name: 'Dragon',
      type: CreatureType.MONSTER,
      currentHp: 80,
      maxHp: 100,
      initiative: 15,
      armorClass: 20,
      isDefeated: false,
      effects: ['Flying', 'Fire Resistance']
    },
    {
      id: 'creature-2',
      name: 'Fighter',
      type: CreatureType.PLAYER,
      currentHp: 45,
      maxHp: 60,
      initiative: 12,
      armorClass: 18,
      isDefeated: false,
      effects: []
    },
    {
      id: 'creature-3',
      name: 'Injured Goblin',
      type: CreatureType.MONSTER,
      currentHp: 5,
      maxHp: 20,
      initiative: 8,
      armorClass: 13,
      isDefeated: false,
      effects: []
    }
  ];

  let mockDialog: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create proper MatDialog mock with Subjects
    const afterAllClosed = new Subject();
    const afterOpened = new Subject();

    mockDialog = {
      open: vi.fn(),
      openDialogs: [],
      afterAllClosed: afterAllClosed,
      afterOpened: afterOpened,
      _getAfterAllClosed: () => afterAllClosed,
      _afterAllClosed: afterAllClosed,
      _afterOpened: afterOpened,
      _openDialogs: [],
      _parentDialog: null,
      _closeAllStreams: new Subject()
    };
  });

  describe('Empty State', () => {
    it('should display empty state when no creatures', async () => {
      await render(CreatureListComponent, {
        componentInputs: {
          creatures: [],
          battleId: 'battle-123'
        },
        providers: [
          { provide: MatDialog, useValue: mockDialog }
        ]
      });

      expect(screen.getByText(/no creatures yet/i)).toBeTruthy();
      expect(screen.getByText(/add one to get started/i)).toBeTruthy();
    });

    it('should show creature count as 0 when empty', async () => {
      await render(CreatureListComponent, {
        componentInputs: {
          creatures: [],
          battleId: 'battle-123'
        },
        providers: [
          { provide: MatDialog, useValue: mockDialog }
        ]
      });

      expect(screen.getByText(/creatures \(0\)/i)).toBeTruthy();
    });
  });

  describe('Creature List Display', () => {
    it('should display all creatures', async () => {
      await render(CreatureListComponent, {
        componentInputs: {
          creatures: mockCreatures,
          battleId: 'battle-123'
        },
        providers: [
          { provide: MatDialog, useValue: mockDialog }
        ]
      });

      expect(screen.getByText('Dragon')).toBeTruthy();
      expect(screen.getByText('Fighter')).toBeTruthy();
      expect(screen.getByText('Injured Goblin')).toBeTruthy();
    });

    it('should show creature count', async () => {
      await render(CreatureListComponent, {
        componentInputs: {
          creatures: mockCreatures,
          battleId: 'battle-123'
        },
        providers: [
          { provide: MatDialog, useValue: mockDialog }
        ]
      });

      expect(screen.getByText(/creatures \(3\)/i)).toBeTruthy();
    });

    it('should display creature type badges', async () => {
      await render(CreatureListComponent, {
        componentInputs: {
          creatures: mockCreatures,
          battleId: 'battle-123'
        },
        providers: [
          { provide: MatDialog, useValue: mockDialog }
        ]
      });

      const monsterBadges = screen.getAllByText('MONSTER');
      expect(monsterBadges).toHaveLength(2);

      const playerBadges = screen.getAllByText('PLAYER');
      expect(playerBadges).toHaveLength(1);
    });

    it('should display HP information', async () => {
      await render(CreatureListComponent, {
        componentInputs: {
          creatures: mockCreatures,
          battleId: 'battle-123'
        },
        providers: [
          { provide: MatDialog, useValue: mockDialog }
        ]
      });

      expect(screen.getByText('80 / 100 HP')).toBeTruthy();
      expect(screen.getByText('45 / 60 HP')).toBeTruthy();
      expect(screen.getByText('5 / 20 HP')).toBeTruthy();
    });

    it('should display initiative and armor class', async () => {
      await render(CreatureListComponent, {
        componentInputs: {
          creatures: mockCreatures,
          battleId: 'battle-123'
        },
        providers: [
          { provide: MatDialog, useValue: mockDialog }
        ]
      });

      expect(screen.getByText('15')).toBeTruthy(); // Dragon initiative
      expect(screen.getByText('20')).toBeTruthy(); // Dragon AC
      expect(screen.getByText('12')).toBeTruthy(); // Fighter initiative
      expect(screen.getByText('18')).toBeTruthy(); // Fighter AC
    });

    it('should display effects when present', async () => {
      await render(CreatureListComponent, {
        componentInputs: {
          creatures: mockCreatures,
          battleId: 'battle-123'
        },
        providers: [
          { provide: MatDialog, useValue: mockDialog }
        ]
      });

      expect(screen.getByText('Flying')).toBeTruthy();
      expect(screen.getByText('Fire Resistance')).toBeTruthy();
    });

    it('should not display effects section when creature has no effects', async () => {
      const { container } = await render(CreatureListComponent, {
        componentInputs: {
          creatures: [mockCreatures[1]], // Fighter has no effects
          battleId: 'battle-123'
        },
        providers: [
          { provide: MatDialog, useValue: mockDialog }
        ]
      });

      const effectsSections = container.querySelectorAll('.effects');
      expect(effectsSections.length).toBe(0);
    });
  });

  describe('HP Bar Visualization', () => {
    it('should apply healthy class when HP > 50%', async () => {
      const { fixture } = await render(CreatureListComponent, {
        componentInputs: {
          creatures: [mockCreatures[0]], // Dragon: 80/100 HP
          battleId: 'battle-123'
        },
        providers: [
          { provide: MatDialog, useValue: mockDialog }
        ]
      });

      const component = fixture.componentInstance;
      const hpClass = component.getHpClass(80);
      expect(hpClass).toBe('hp-healthy');
    });

    it('should apply wounded class when 25% < HP <= 50%', async () => {
      const { fixture } = await render(CreatureListComponent, {
        componentInputs: {
          creatures: [mockCreatures[1]], // Fighter: 45/60 HP (75%)
          battleId: 'battle-123'
        },
        providers: [
          { provide: MatDialog, useValue: mockDialog }
        ]
      });

      const component = fixture.componentInstance;
      const hpClass = component.getHpClass(40); // 40%
      expect(hpClass).toBe('hp-wounded');
    });

    it('should apply critical class when HP <= 25%', async () => {
      const { fixture } = await render(CreatureListComponent, {
        componentInputs: {
          creatures: [mockCreatures[2]], // Goblin: 5/20 HP (25%)
          battleId: 'battle-123'
        },
        providers: [
          { provide: MatDialog, useValue: mockDialog }
        ]
      });

      const component = fixture.componentInstance;
      const hpClass = component.getHpClass(25);
      expect(hpClass).toBe('hp-critical');
    });

    it('should calculate HP percentage correctly', async () => {
      const { fixture } = await render(CreatureListComponent, {
        componentInputs: {
          creatures: mockCreatures,
          battleId: 'battle-123'
        },
        providers: [
          { provide: MatDialog, useValue: mockDialog }
        ]
      });

      const component = fixture.componentInstance;
      expect(component.getHpPercentage(mockCreatures[0])).toBe(80); // 80/100
      expect(component.getHpPercentage(mockCreatures[1])).toBe(75); // 45/60
      expect(component.getHpPercentage(mockCreatures[2])).toBe(25); // 5/20
    });
  });

  describe('Add Creature Button', () => {
    it('should display add creature button', async () => {
      await render(CreatureListComponent, {
        componentInputs: {
          creatures: [],
          battleId: 'battle-123'
        },
        providers: [
          { provide: MatDialog, useValue: mockDialog }
        ]
      });

      expect(screen.getByRole('button', { name: /add creature/i })).toBeTruthy();
    });

    it('should not emit event when dialog is cancelled', async () => {
      const user = userEvent.setup();
      const dialogRefMock = {
        afterClosed: vi.fn().mockReturnValue(of(null))
      };
      mockDialog.open.mockReturnValue(dialogRefMock);

      const { fixture } = await render(CreatureListComponent, {
        componentInputs: {
          creatures: [],
          battleId: 'battle-123'
        },
        providers: [
          { provide: MatDialog, useValue: mockDialog }
        ]
      });

      const component = fixture.componentInstance;
      const addCreatureSpy = vi.fn();
      component.addCreature.subscribe(addCreatureSpy);

      const addButton = screen.getByRole('button', { name: /add creature/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(addCreatureSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('Edit Creature Button', () => {
    it('should display edit buttons for each creature', async () => {
      await render(CreatureListComponent, {
        componentInputs: {
          creatures: mockCreatures,
          battleId: 'battle-123'
        },
        providers: [
          { provide: MatDialog, useValue: mockDialog }
        ]
      });

      const editButtons = screen.getAllByRole('button', { name: /edit/i });
      expect(editButtons).toHaveLength(3);
    });

  });

  describe('Remove Creature Button', () => {
    it('should display remove buttons for each creature', async () => {
      await render(CreatureListComponent, {
        componentInputs: {
          creatures: mockCreatures,
          battleId: 'battle-123'
        },
        providers: [
          { provide: MatDialog, useValue: mockDialog }
        ]
      });

      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      expect(removeButtons).toHaveLength(3);
    });

    it('should show confirmation dialog when remove is clicked', async () => {
      const user = userEvent.setup();
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      await render(CreatureListComponent, {
        componentInputs: {
          creatures: [mockCreatures[0]],
          battleId: 'battle-123'
        },
        providers: [
          { provide: MatDialog, useValue: mockDialog }
        ]
      });

      const removeButton = screen.getByRole('button', { name: /remove/i });
      await user.click(removeButton);

      expect(confirmSpy).toHaveBeenCalledWith('Are you sure you want to remove this creature?');
    });

    it('should emit removeCreature event when confirmed', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      const { fixture } = await render(CreatureListComponent, {
        componentInputs: {
          creatures: [mockCreatures[0]],
          battleId: 'battle-123'
        },
        providers: [
          { provide: MatDialog, useValue: mockDialog }
        ]
      });

      const component = fixture.componentInstance;
      const removeCreatureSpy = vi.fn();
      component.removeCreature.subscribe(removeCreatureSpy);

      const removeButton = screen.getByRole('button', { name: /remove/i });
      await user.click(removeButton);

      await waitFor(() => {
        expect(removeCreatureSpy).toHaveBeenCalledWith('creature-1');
      });
    });

    it('should not emit event when cancelled', async () => {
      const user = userEvent.setup();
      vi.spyOn(window, 'confirm').mockReturnValue(false);

      const { fixture } = await render(CreatureListComponent, {
        componentInputs: {
          creatures: [mockCreatures[0]],
          battleId: 'battle-123'
        },
        providers: [
          { provide: MatDialog, useValue: mockDialog }
        ]
      });

      const component = fixture.componentInstance;
      const removeCreatureSpy = vi.fn();
      component.removeCreature.subscribe(removeCreatureSpy);

      const removeButton = screen.getByRole('button', { name: /remove/i });
      await user.click(removeButton);

      await waitFor(() => {
        expect(removeCreatureSpy).not.toHaveBeenCalled();
      });
    });
  });
});

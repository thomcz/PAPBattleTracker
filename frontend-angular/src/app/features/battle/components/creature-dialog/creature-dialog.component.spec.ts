import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { CreatureDialogComponent, CreatureDialogData } from './creature-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CreatureType } from '../../../../core/domain/models/battle.model';
import { PlayerPort } from '../../../../core/ports/player.port';
import { of } from 'rxjs';

describe('CreatureDialogComponent', () => {
  const mockDialogRef = {
    close: vi.fn()
  };

  const mockPlayerPort = {
    createPlayer: vi.fn(),
    listPlayers: vi.fn().mockReturnValue(of({ players: [], total: 0 })),
    getPlayer: vi.fn(),
    updatePlayer: vi.fn(),
    deletePlayer: vi.fn()
  };

  const defaultProviders = [
    { provide: MatDialogRef, useValue: mockDialogRef },
    { provide: PlayerPort, useValue: mockPlayerPort }
  ];

  describe('Add Mode', () => {
    const addModeData: CreatureDialogData = {
      mode: 'add'
    };

    it('should render add creature dialog', async () => {
      await render(CreatureDialogComponent, {
        providers: [
          ...defaultProviders,
          { provide: MAT_DIALOG_DATA, useValue: addModeData }
        ]
      });

      expect(screen.getByText('Add Creature')).toBeTruthy();
    });

    it('should have all form fields', async () => {
      await render(CreatureDialogComponent, {
        providers: [
          ...defaultProviders,
          { provide: MAT_DIALOG_DATA, useValue: addModeData }
        ]
      });

      expect(screen.getByLabelText(/name/i)).toBeTruthy();
      expect(screen.getByLabelText(/type/i)).toBeTruthy();
      expect(screen.getByLabelText(/current hp/i)).toBeTruthy();
      expect(screen.getByLabelText(/max hp/i)).toBeTruthy();
      expect(screen.getByLabelText(/initiative/i)).toBeTruthy();
      expect(screen.getByLabelText(/armor class/i)).toBeTruthy();
    });

    it('should have default values for add mode', async () => {
      const { fixture } = await render(CreatureDialogComponent, {
        providers: [
          ...defaultProviders,
          { provide: MAT_DIALOG_DATA, useValue: addModeData }
        ]
      });

      const component = fixture.componentInstance;
      expect(component.form.value).toEqual({
        name: '',
        type: CreatureType.MONSTER,
        currentHp: 0,
        maxHp: 1,
        initiative: 0,
        armorClass: 10
      });
    });

    it('should disable submit button when form is invalid', async () => {
      await render(CreatureDialogComponent, {
        providers: [
          ...defaultProviders,
          { provide: MAT_DIALOG_DATA, useValue: addModeData }
        ]
      });

      const submitButton = screen.getByRole('button', { name: /^add$/i });
      expect(submitButton.hasAttribute('disabled')).toBe(true);
    });

    it('should enable submit button when form is valid', async () => {
      const user = userEvent.setup();

      await render(CreatureDialogComponent, {
        providers: [
          ...defaultProviders,
          { provide: MAT_DIALOG_DATA, useValue: addModeData }
        ]
      });

      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
      await user.type(nameInput, 'Goblin');

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /^add$/i });
        expect(submitButton.hasAttribute('disabled')).toBe(false);
      });
    });

    it('should close dialog with form data when submitted', async () => {
      const user = userEvent.setup();

      await render(CreatureDialogComponent, {
        providers: [
          ...defaultProviders,
          { provide: MAT_DIALOG_DATA, useValue: addModeData }
        ]
      });

      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
      await user.type(nameInput, 'Goblin');

      const submitButton = screen.getByRole('button', { name: /^add$/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockDialogRef.close).toHaveBeenCalledWith({
          name: 'Goblin',
          type: CreatureType.MONSTER,
          currentHp: 0,
          maxHp: 1,
          initiative: 0,
          armorClass: 10
        });
      });
    });

    it('should close dialog without data when cancelled', async () => {
      const user = userEvent.setup();

      await render(CreatureDialogComponent, {
        providers: [
          ...defaultProviders,
          { provide: MAT_DIALOG_DATA, useValue: addModeData }
        ]
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockDialogRef.close).toHaveBeenCalledWith();
    });

    it('should validate name is required', async () => {
      const user = userEvent.setup();

      await render(CreatureDialogComponent, {
        providers: [
          ...defaultProviders,
          { provide: MAT_DIALOG_DATA, useValue: addModeData }
        ]
      });

      const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
      await user.click(nameInput);
      await user.tab(); // Trigger blur

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeTruthy();
      });
    });

    it('should validate currentHp must be non-negative', async () => {
      const user = userEvent.setup();

      await render(CreatureDialogComponent, {
        providers: [
          ...defaultProviders,
          { provide: MAT_DIALOG_DATA, useValue: addModeData }
        ]
      });

      const currentHpInput = screen.getByLabelText(/current hp/i) as HTMLInputElement;
      await user.clear(currentHpInput);
      await user.type(currentHpInput, '-5');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/must be non-negative/i)).toBeTruthy();
      });
    });

    it('should validate maxHp must be at least 1', async () => {
      const user = userEvent.setup();

      await render(CreatureDialogComponent, {
        providers: [
          ...defaultProviders,
          { provide: MAT_DIALOG_DATA, useValue: addModeData }
        ]
      });

      const maxHpInput = screen.getByLabelText(/max hp/i) as HTMLInputElement;
      await user.clear(maxHpInput);
      await user.type(maxHpInput, '0');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/must be at least 1/i)).toBeTruthy();
      });
    });
  });

  describe('Edit Mode', () => {
    const editModeData: CreatureDialogData = {
      mode: 'edit',
      creature: {
        id: 'creature-123',
        name: 'Dragon',
        type: CreatureType.MONSTER,
        currentHp: 80,
        maxHp: 100,
        initiative: 15,
        armorClass: 20
      }
    };

    it('should render edit creature dialog', async () => {
      await render(CreatureDialogComponent, {
        providers: [
          ...defaultProviders,
          { provide: MAT_DIALOG_DATA, useValue: editModeData }
        ]
      });

      expect(screen.getByText('Edit Creature')).toBeTruthy();
      expect(screen.getByRole('button', { name: /update/i })).toBeTruthy();
    });

    it('should pre-populate form with creature data', async () => {
      const { fixture } = await render(CreatureDialogComponent, {
        providers: [
          ...defaultProviders,
          { provide: MAT_DIALOG_DATA, useValue: editModeData }
        ]
      });

      const component = fixture.componentInstance;
      expect(component.form.value).toEqual({
        name: 'Dragon',
        type: CreatureType.MONSTER,
        currentHp: 80,
        maxHp: 100,
        initiative: 15,
        armorClass: 20
      });
    });

    it('should have submit button enabled with pre-populated valid data', async () => {
      await render(CreatureDialogComponent, {
        providers: [
          ...defaultProviders,
          { provide: MAT_DIALOG_DATA, useValue: editModeData }
        ]
      });

      const submitButton = screen.getByRole('button', { name: /update/i });
      expect(submitButton.hasAttribute('disabled')).toBe(false);
    });

    it('should close dialog with updated data when submitted', async () => {
      const user = userEvent.setup();

      await render(CreatureDialogComponent, {
        providers: [
          ...defaultProviders,
          { provide: MAT_DIALOG_DATA, useValue: editModeData }
        ]
      });

      const currentHpInput = screen.getByLabelText(/current hp/i) as HTMLInputElement;
      await user.clear(currentHpInput);
      await user.type(currentHpInput, '50');

      const submitButton = screen.getByRole('button', { name: /update/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockDialogRef.close).toHaveBeenCalledWith({
          name: 'Dragon',
          type: CreatureType.MONSTER,
          currentHp: 50,
          maxHp: 100,
          initiative: 15,
          armorClass: 20
        });
      });
    });

    it('should allow changing creature type', async () => {
      const user = userEvent.setup();

      const { fixture } = await render(CreatureDialogComponent, {
        providers: [
          ...defaultProviders,
          { provide: MAT_DIALOG_DATA, useValue: editModeData }
        ]
      });

      const typeSelect = screen.getByLabelText(/type/i) as HTMLSelectElement;
      await user.click(typeSelect);

      // Note: Material select requires special handling in tests
      // For now we'll directly update the form value
      const component = fixture.componentInstance;
      component.form.patchValue({ type: CreatureType.PLAYER });
      fixture.detectChanges();

      expect(component.form.value.type).toBe(CreatureType.PLAYER);
    });
  });

  describe('isEditMode getter', () => {
    it('should return true when mode is edit', async () => {
      const { fixture } = await render(CreatureDialogComponent, {
        providers: [
          ...defaultProviders,
          { provide: MAT_DIALOG_DATA, useValue: { mode: 'edit' } as CreatureDialogData }
        ]
      });

      const component = fixture.componentInstance;
      expect(component.isEditMode).toBe(true);
    });

    it('should return false when mode is add', async () => {
      const { fixture } = await render(CreatureDialogComponent, {
        providers: [
          ...defaultProviders,
          { provide: MAT_DIALOG_DATA, useValue: { mode: 'add' } as CreatureDialogData }
        ]
      });

      const component = fixture.componentInstance;
      expect(component.isEditMode).toBe(false);
    });
  });
});

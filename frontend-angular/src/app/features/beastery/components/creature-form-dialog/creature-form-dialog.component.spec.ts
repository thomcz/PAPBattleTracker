import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { CreatureFormDialogComponent } from './creature-form-dialog.component';
import { BeasteryListUseCase } from '../../../../core/domain/use-cases/beastery-list.use-case';
import { BeasteryPort } from '../../../../core/ports/beastery.port';
import { BeasteryCreature } from '../../../../core/domain/models/beastery-creature.model';

describe('CreatureFormDialogComponent', () => {
  let component: CreatureFormDialogComponent;
  let fixture: ComponentFixture<CreatureFormDialogComponent>;
  let beasteryPortMock: BeasteryPort;

  const mockCreature: BeasteryCreature = {
    creatureId: 'creature-123',
    name: 'Goblin',
    hitPoints: 7,
    armorClass: 15,
    isDeleted: false,
    createdAt: '2026-01-01T00:00:00Z',
    lastModified: '2026-01-01T00:00:00Z'
  };

  beforeEach(async () => {
    beasteryPortMock = {
      createCreature: vi.fn().mockReturnValue(of(mockCreature)),
      listCreatures: vi.fn().mockReturnValue(of({ creatures: [], total: 0 })),
      getCreature: vi.fn(),
      updateCreature: vi.fn().mockReturnValue(of(mockCreature)),
      deleteCreature: vi.fn(),
      duplicateCreature: vi.fn()
    } as unknown as BeasteryPort;

    await TestBed.configureTestingModule({
      imports: [CreatureFormDialogComponent],
      providers: [
        BeasteryListUseCase,
        { provide: BeasteryPort, useValue: beasteryPortMock }
      ]
    }).compileComponents();
  });

  function createComponent(creature: BeasteryCreature | null = null): void {
    fixture = TestBed.createComponent(CreatureFormDialogComponent);
    component = fixture.componentInstance;
    component.creature = creature;
    fixture.detectChanges();
  }

  describe('Create Mode', () => {
    beforeEach(() => {
      createComponent();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should not be in editing mode', () => {
      expect(component.isEditing).toBe(false);
    });

    it('should have empty form fields', () => {
      expect(component.creatureForm.value.name).toBe('');
      expect(component.creatureForm.value.hitPoints).toBe(10);
      expect(component.creatureForm.value.armorClass).toBe(10);
    });

    it('should show create title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Create Creature');
    });

    it('should not submit when form is invalid', () => {
      component.creatureForm.patchValue({ name: '' });
      component.onSubmit();
      expect(beasteryPortMock.createCreature).not.toHaveBeenCalled();
    });

    it('should call createCreature on valid submit', () => {
      component.creatureForm.patchValue({
        name: 'Goblin',
        hitPoints: 7,
        armorClass: 15
      });

      component.onSubmit();

      expect(beasteryPortMock.createCreature).toHaveBeenCalledWith({
        name: 'Goblin',
        hitPoints: 7,
        armorClass: 15
      });
    });

    it('should emit creatureSaved on successful create', () => {
      const savedSpy = vi.fn();
      component.creatureSaved.subscribe(savedSpy);

      component.creatureForm.patchValue({
        name: 'Goblin',
        hitPoints: 7,
        armorClass: 15
      });

      component.onSubmit();

      expect(savedSpy).toHaveBeenCalled();
      expect(component.loading()).toBe(false);
    });

    it('should set error on failed create', () => {
      (beasteryPortMock.createCreature as any).mockReturnValue(
        throwError(() => new Error('Create failed'))
      );

      component.creatureForm.patchValue({
        name: 'Goblin',
        hitPoints: 7,
        armorClass: 15
      });

      component.onSubmit();

      expect(component.error()).toContain('Failed to create creature');
      expect(component.loading()).toBe(false);
    });

    it('should emit dialogClosed on close', () => {
      const closedSpy = vi.fn();
      component.dialogClosed.subscribe(closedSpy);

      component.close();

      expect(closedSpy).toHaveBeenCalled();
    });
  });

  describe('Edit Mode', () => {
    beforeEach(() => {
      createComponent(mockCreature);
    });

    it('should be in editing mode', () => {
      expect(component.isEditing).toBe(true);
    });

    it('should populate form with creature data', () => {
      expect(component.creatureForm.value.name).toBe('Goblin');
      expect(component.creatureForm.value.hitPoints).toBe(7);
      expect(component.creatureForm.value.armorClass).toBe(15);
    });

    it('should show edit title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Edit Creature');
    });

    it('should call updateCreature on valid submit', () => {
      component.creatureForm.patchValue({
        name: 'Hobgoblin',
        hitPoints: 11,
        armorClass: 18
      });

      component.onSubmit();

      expect(beasteryPortMock.updateCreature).toHaveBeenCalledWith(
        'creature-123',
        { name: 'Hobgoblin', hitPoints: 11, armorClass: 18 }
      );
    });

    it('should set error on failed update', () => {
      (beasteryPortMock.updateCreature as any).mockReturnValue(
        throwError(() => new Error('Update failed'))
      );

      component.creatureForm.patchValue({
        name: 'Hobgoblin',
        hitPoints: 11,
        armorClass: 18
      });

      component.onSubmit();

      expect(component.error()).toContain('Failed to update creature');
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      createComponent();
    });

    it('should require name', () => {
      component.creatureForm.patchValue({ name: '' });
      component.creatureForm.get('name')!.markAsTouched();
      expect(component.getFieldError('name')).toBeTruthy();
    });

    it('should reject name longer than 100 characters', () => {
      component.creatureForm.patchValue({ name: 'A'.repeat(101) });
      component.creatureForm.get('name')!.markAsTouched();
      expect(component.getFieldError('name')).toBeTruthy();
    });

    it('should reject hitPoints below 1', () => {
      component.creatureForm.patchValue({ hitPoints: 0 });
      component.creatureForm.get('hitPoints')!.markAsTouched();
      expect(component.getFieldError('hitPoints')).toBeTruthy();
    });

    it('should reject hitPoints above 999', () => {
      component.creatureForm.patchValue({ hitPoints: 1000 });
      component.creatureForm.get('hitPoints')!.markAsTouched();
      expect(component.getFieldError('hitPoints')).toBeTruthy();
    });

    it('should reject armorClass below 0', () => {
      component.creatureForm.patchValue({ armorClass: -1 });
      component.creatureForm.get('armorClass')!.markAsTouched();
      expect(component.getFieldError('armorClass')).toBeTruthy();
    });

    it('should reject armorClass above 30', () => {
      component.creatureForm.patchValue({ armorClass: 31 });
      component.creatureForm.get('armorClass')!.markAsTouched();
      expect(component.getFieldError('armorClass')).toBeTruthy();
    });

    it('should return null for untouched fields', () => {
      expect(component.getFieldError('name')).toBeNull();
    });
  });
});

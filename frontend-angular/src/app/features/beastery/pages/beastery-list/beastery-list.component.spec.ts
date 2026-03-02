import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of, Subject } from 'rxjs';
import { BeasteryListComponent } from './beastery-list.component';
import { BeasteryListUseCase } from '../../../../core/domain/use-cases/beastery-list.use-case';
import { BeasteryPort } from '../../../../core/ports/beastery.port';
import { BeasteryCreature } from '../../../../core/domain/models/beastery-creature.model';

describe('BeasteryListComponent', () => {
  let component: BeasteryListComponent;
  let fixture: ComponentFixture<BeasteryListComponent>;
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
      createCreature: vi.fn(),
      listCreatures: vi.fn().mockReturnValue(of({ creatures: [], total: 0 })),
      getCreature: vi.fn(),
      updateCreature: vi.fn(),
      deleteCreature: vi.fn().mockReturnValue(of(undefined)),
      duplicateCreature: vi.fn().mockReturnValue(of({ ...mockCreature, creatureId: 'creature-456', name: 'Goblin Copy' }))
    } as unknown as BeasteryPort;

    await TestBed.configureTestingModule({
      imports: [BeasteryListComponent],
      providers: [
        BeasteryListUseCase,
        { provide: BeasteryPort, useValue: beasteryPortMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BeasteryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load creatures on init', () => {
    expect(beasteryPortMock.listCreatures).toHaveBeenCalled();
  });

  it('should show empty state when no creatures', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state')).toBeTruthy();
  });

  it('should display creature cards when creatures exist', () => {
    (beasteryPortMock.listCreatures as any).mockReturnValue(of({ creatures: [mockCreature], total: 1 }));

    component.ngOnInit();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.creature-card')).toBeTruthy();
    expect(compiled.textContent).toContain('Goblin');
  });

  it('should open create dialog', () => {
    component.openCreateDialog();
    expect(component.showFormDialog()).toBe(true);
    expect(component.editingCreature()).toBeNull();
  });

  it('should open edit dialog with creature data', () => {
    component.openEditDialog(mockCreature);
    expect(component.showFormDialog()).toBe(true);
    expect(component.editingCreature()).toEqual(mockCreature);
  });

  it('should close form dialog', () => {
    component.openCreateDialog();
    component.closeFormDialog();
    expect(component.showFormDialog()).toBe(false);
    expect(component.editingCreature()).toBeNull();
  });

  it('should close dialog on creature saved', () => {
    component.openCreateDialog();
    component.onCreatureSaved();
    expect(component.showFormDialog()).toBe(false);
  });

  it('should confirm delete', () => {
    component.confirmDelete(mockCreature);
    expect(component.deleteConfirmCreature()).toEqual(mockCreature);
  });

  it('should cancel delete', () => {
    component.confirmDelete(mockCreature);
    component.cancelDelete();
    expect(component.deleteConfirmCreature()).toBeNull();
  });

  it('should execute delete and clear confirm state', () => {
    component.confirmDelete(mockCreature);
    component.executeDelete();
    expect(beasteryPortMock.deleteCreature).toHaveBeenCalledWith('creature-123');
    expect(component.deleteConfirmCreature()).toBeNull();
  });

  it('should duplicate creature', () => {
    component.duplicateCreature(mockCreature);
    expect(beasteryPortMock.duplicateCreature).toHaveBeenCalledWith('creature-123', undefined);
  });

  // Dark theme structural tests
  it('should render dark theme dashboard container', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.dashboard')).toBeTruthy();
  });

  it('should render section title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.section-title')).toBeTruthy();
  });

  it('should render creature list container when creatures exist', () => {
    (beasteryPortMock.listCreatures as any).mockReturnValue(of({ creatures: [mockCreature], total: 1 }));
    component.ngOnInit();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.creature-list')).toBeTruthy();
  });

  it('should render loading state with dark theme class', () => {
    const subject = new Subject<any>();
    (beasteryPortMock.listCreatures as any).mockReturnValue(subject.asObservable());
    component.ngOnInit();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.loading-state')).toBeTruthy();
  });

  it('should show delete confirmation dialog with dark theme classes', () => {
    component.confirmDelete(mockCreature);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.dialog-overlay')).toBeTruthy();
    expect(compiled.querySelector('.confirm-dialog')).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { of } from 'rxjs';
import { PlayerListComponent } from './player-list.component';
import { PlayerListUseCase } from '../../../../core/domain/use-cases/player-list.use-case';
import { PlayerPort } from '../../../../core/ports/player.port';

describe('PlayerListComponent', () => {
  let component: PlayerListComponent;
  let fixture: ComponentFixture<PlayerListComponent>;
  let playerPortMock: PlayerPort;

  beforeEach(async () => {
    playerPortMock = {
      createPlayer: vi.fn(),
      listPlayers: vi.fn().mockReturnValue(of({ players: [], total: 0 })),
      getPlayer: vi.fn(),
      updatePlayer: vi.fn(),
      deletePlayer: vi.fn()
    } as unknown as PlayerPort;

    await TestBed.configureTestingModule({
      imports: [PlayerListComponent],
      providers: [
        PlayerListUseCase,
        { provide: PlayerPort, useValue: playerPortMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load players on init', () => {
    expect(playerPortMock.listPlayers).toHaveBeenCalled();
  });

  it('should show empty state when no players', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state')).toBeTruthy();
  });

  it('should open create dialog', () => {
    component.openCreateDialog();
    expect(component.showFormDialog()).toBe(true);
    expect(component.editingPlayer()).toBeNull();
  });

  it('should open edit dialog with player data', () => {
    const player = {
      playerId: '123',
      name: 'Thorin',
      characterClass: 'Fighter',
      level: 5,
      maxHp: 45,
      isDeleted: false,
      createdAt: '',
      lastModified: ''
    };

    component.openEditDialog(player);
    expect(component.showFormDialog()).toBe(true);
    expect(component.editingPlayer()).toEqual(player);
  });

  it('should close form dialog', () => {
    component.openCreateDialog();
    component.closeFormDialog();
    expect(component.showFormDialog()).toBe(false);
    expect(component.editingPlayer()).toBeNull();
  });

  it('should confirm delete', () => {
    const player = {
      playerId: '123',
      name: 'Thorin',
      characterClass: 'Fighter',
      level: 5,
      maxHp: 45,
      isDeleted: false,
      createdAt: '',
      lastModified: ''
    };

    component.confirmDelete(player);
    expect(component.deleteConfirmPlayer()).toEqual(player);
  });

  it('should cancel delete', () => {
    component.confirmDelete({
      playerId: '123',
      name: 'Thorin',
      characterClass: 'Fighter',
      level: 5,
      maxHp: 45,
      isDeleted: false,
      createdAt: '',
      lastModified: ''
    });
    component.cancelDelete();
    expect(component.deleteConfirmPlayer()).toBeNull();
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

  it('should render player list container when players exist', () => {
    const player = {
      playerId: '123',
      name: 'Thorin',
      characterClass: 'Fighter',
      level: 5,
      maxHp: 45,
      isDeleted: false,
      createdAt: '',
      lastModified: ''
    };
    (playerPortMock.listPlayers as any).mockReturnValue(of({ players: [player], total: 1 }));
    component.ngOnInit();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.player-list')).toBeTruthy();
  });

  it('should render class badge on player card', () => {
    const player = {
      playerId: '123',
      name: 'Thorin',
      characterClass: 'Fighter',
      level: 5,
      maxHp: 45,
      isDeleted: false,
      createdAt: '',
      lastModified: ''
    };
    (playerPortMock.listPlayers as any).mockReturnValue(of({ players: [player], total: 1 }));
    component.ngOnInit();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.class-badge')).toBeTruthy();
    expect(compiled.querySelector('.class-badge')?.textContent).toContain('Fighter');
  });

  it('should show delete confirmation dialog with dark theme classes', () => {
    const player = {
      playerId: '123',
      name: 'Thorin',
      characterClass: 'Fighter',
      level: 5,
      maxHp: 45,
      isDeleted: false,
      createdAt: '',
      lastModified: ''
    };
    component.confirmDelete(player);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.dialog-overlay')).toBeTruthy();
    expect(compiled.querySelector('.confirm-dialog')).toBeTruthy();
  });
});

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
});

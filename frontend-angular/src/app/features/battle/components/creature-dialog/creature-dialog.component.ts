import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { CreatureType } from '../../../../core/domain/models/battle.model';
import { Player } from '../../../../core/domain/models/player.model';
import { PlayerListUseCase } from '../../../../core/domain/use-cases/player-list.use-case';

export interface CreatureDialogData {
  creature?: {
    id: string;
    name: string;
    type: CreatureType;
    currentHp: number;
    maxHp: number;
    initiative: number;
    armorClass: number;
  };
  mode: 'add' | 'edit';
}

/**
 * Dialog component for adding or editing creatures.
 * User Stories 1 & 2: Add/Edit Creatures
 *
 * In 'add' mode, provides two tabs:
 * - "New Creature": Manual form to create a new creature from scratch
 * - "From Player": Select an existing player character to add to the battle
 */
@Component({
  selector: 'app-creature-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTabsModule
  ],
  templateUrl: './creature-dialog.component.html',
  styleUrls: ['./creature-dialog.component.css']
})
export class CreatureDialogComponent implements OnInit {
  form: FormGroup;
  CreatureType = CreatureType;
  selectedPlayer = signal<Player | null>(null);
  players = signal<Player[]>([]);
  playersLoading = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreatureDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CreatureDialogData,
    private playerListUseCase: PlayerListUseCase
  ) {
    this.form = this.fb.group({
      name: [data.creature?.name || '', [Validators.required, Validators.minLength(1)]],
      type: [data.creature?.type || CreatureType.MONSTER, Validators.required],
      currentHp: [data.creature?.currentHp || 0, [Validators.required, Validators.min(0)]],
      maxHp: [data.creature?.maxHp || 1, [Validators.required, Validators.min(1)]],
      initiative: [data.creature?.initiative || 0, Validators.required],
      armorClass: [data.creature?.armorClass || 10, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    if (!this.isEditMode) {
      this.loadPlayers();
    }
  }

  private loadPlayers(): void {
    this.playersLoading.set(true);
    this.playerListUseCase.loadPlayers().subscribe({
      next: (response) => {
        this.players.set(response.players);
        this.playersLoading.set(false);
      },
      error: () => {
        this.playersLoading.set(false);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  selectPlayer(player: Player): void {
    this.selectedPlayer.set(player);
  }

  onAddSelectedPlayer(): void {
    const player = this.selectedPlayer();
    if (!player) return;

    this.dialogRef.close({
      name: player.name,
      type: CreatureType.PLAYER,
      currentHp: player.maxHp,
      maxHp: player.maxHp,
      initiative: 0,
      armorClass: 10
    });
  }

  get isEditMode(): boolean {
    return this.data.mode === 'edit';
  }
}

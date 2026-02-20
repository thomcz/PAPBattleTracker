import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PlayerListUseCase } from '../../../../core/domain/use-cases/player-list.use-case';
import { Player } from '../../../../core/domain/models/player.model';
import { PlayerFormDialogComponent } from '../../components/player-form-dialog/player-form-dialog.component';

@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [CommonModule, PlayerFormDialogComponent],
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.css']
})
export class PlayerListComponent implements OnInit {
  showFormDialog = signal<boolean>(false);
  editingPlayer = signal<Player | null>(null);
  deleteConfirmPlayer = signal<Player | null>(null);

  constructor(
    public playerList: PlayerListUseCase,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.playerList.loadPlayers().subscribe();
  }

  openCreateDialog(): void {
    this.editingPlayer.set(null);
    this.showFormDialog.set(true);
  }

  openEditDialog(player: Player): void {
    this.editingPlayer.set(player);
    this.showFormDialog.set(true);
  }

  closeFormDialog(): void {
    this.showFormDialog.set(false);
    this.editingPlayer.set(null);
  }

  onPlayerSaved(): void {
    this.closeFormDialog();
  }

  confirmDelete(player: Player): void {
    this.deleteConfirmPlayer.set(player);
  }

  cancelDelete(): void {
    this.deleteConfirmPlayer.set(null);
  }

  executeDelete(): void {
    const player = this.deleteConfirmPlayer();
    if (!player) return;

    this.playerList.deletePlayer(player.playerId).subscribe({
      next: () => this.deleteConfirmPlayer.set(null),
      error: () => this.deleteConfirmPlayer.set(null)
    });
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}

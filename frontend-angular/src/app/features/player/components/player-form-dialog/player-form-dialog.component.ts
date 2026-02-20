import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Player } from '../../../../core/domain/models/player.model';
import { PlayerListUseCase } from '../../../../core/domain/use-cases/player-list.use-case';

@Component({
  selector: 'app-player-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './player-form-dialog.component.html',
  styleUrls: ['./player-form-dialog.component.css']
})
export class PlayerFormDialogComponent implements OnInit {
  @Input() player: Player | null = null;
  @Output() playerSaved = new EventEmitter<void>();
  @Output() dialogClosed = new EventEmitter<void>();

  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  playerForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]),
    characterClass: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]),
    level: new FormControl(1, [Validators.required, Validators.min(1), Validators.max(20)]),
    maxHp: new FormControl(10, [Validators.required, Validators.min(1), Validators.max(999)])
  });

  get isEditing(): boolean {
    return this.player !== null;
  }

  constructor(private playerListUseCase: PlayerListUseCase) {}

  ngOnInit(): void {
    if (this.player) {
      this.playerForm.patchValue({
        name: this.player.name,
        characterClass: this.player.characterClass,
        level: this.player.level,
        maxHp: this.player.maxHp
      });
    }
  }

  onSubmit(): void {
    if (this.playerForm.invalid) {
      this.playerForm.markAllAsTouched();
      return;
    }

    const request = {
      name: this.playerForm.value.name!,
      characterClass: this.playerForm.value.characterClass!,
      level: this.playerForm.value.level!,
      maxHp: this.playerForm.value.maxHp!
    };

    this.loading.set(true);
    this.error.set(null);

    const operation$ = this.isEditing
      ? this.playerListUseCase.updatePlayer(this.player!.playerId, request)
      : this.playerListUseCase.createPlayer(request);

    operation$.subscribe({
      next: () => {
        this.loading.set(false);
        this.playerSaved.emit();
      },
      error: () => {
        this.loading.set(false);
        this.error.set(this.isEditing ? 'Failed to update player.' : 'Failed to create player.');
      }
    });
  }

  close(): void {
    this.dialogClosed.emit();
  }

  getFieldError(fieldName: string): string | null {
    const control = this.playerForm.get(fieldName);
    if (!control?.touched) return null;

    if (control.hasError('required')) return `${fieldName === 'characterClass' ? 'Class' : fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    if (control.hasError('minlength')) return 'Too short';
    if (control.hasError('maxlength')) return 'Too long';
    if (control.hasError('min')) return 'Value too low';
    if (control.hasError('max')) return 'Value too high';
    return null;
  }
}

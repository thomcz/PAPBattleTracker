import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BattleApiAdapter } from '../../../../adapters/api/battle-api.adapter';
import { BattleSummary } from '../../../../core/domain/models/battle.model';

/**
 * Create Battle Dialog Component
 *
 * Modal dialog for creating a new battle session.
 * Validates input and communicates with backend via BattleApiAdapter.
 */
@Component({
  selector: 'app-create-battle-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-battle-dialog.component.html',
  styleUrls: ['./create-battle-dialog.component.css']
})
export class CreateBattleDialogComponent {
  @Output() battleCreated = new EventEmitter<BattleSummary>();
  @Output() dialogClosed = new EventEmitter<void>();

  // Signal-based state
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  // Reactive form
  battleForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100)
    ])
  });

  constructor(private battleApi: BattleApiAdapter) {}

  onSubmit(): void {
    if (this.battleForm.invalid) {
      this.battleForm.markAllAsTouched();
      return;
    }

    const name = this.battleForm.value.name!;
    this.loading.set(true);
    this.error.set(null);

    this.battleApi.createBattle(name).subscribe({
      next: (battle) => {
        this.loading.set(false);
        // Emit the battle as a summary (extract necessary fields)
        const summary: BattleSummary = {
          id: battle.id,
          name: battle.name,
          status: battle.status,
          createdAt: battle.createdAt,
          lastModified: battle.lastModified
        };
        this.battleCreated.emit(summary);
        this.battleForm.reset();
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to create battle. Please try again.');
      }
    });
  }

  onCancel(): void {
    this.battleForm.reset();
    this.error.set(null);
    this.dialogClosed.emit();
  }

  closeDialog(): void {
    this.dialogClosed.emit();
  }

  get nameControl(): FormControl {
    return this.battleForm.get('name') as FormControl;
  }

  get nameErrors(): string | null {
    const control = this.nameControl;
    if (!control.touched) return null;

    if (control.hasError('required')) {
      return 'Battle name is required';
    }
    if (control.hasError('minlength')) {
      return 'Battle name must be at least 3 characters';
    }
    if (control.hasError('maxlength')) {
      return 'Battle name must be at most 100 characters';
    }
    return null;
  }
}

import { Component, EventEmitter, Input, Optional, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { map } from 'rxjs';
import { BattleApiAdapter } from '../../../../adapters/api/battle-api.adapter';
import { BattleSummary } from '../../../../core/domain/models/battle.model';
import { SessionPort } from '../../../../core/ports/session.port';

/**
 * Create Battle Dialog Component
 *
 * Modal dialog for creating a new battle session.
 * When sessionId is provided, creates a battle within that session.
 * Otherwise creates a standalone battle.
 */
@Component({
  selector: 'app-create-battle-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-battle-dialog.component.html',
  styleUrls: ['./create-battle-dialog.component.css']
})
export class CreateBattleDialogComponent {
  @Input() sessionId: string | null = null;
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

  constructor(
    private battleApi: BattleApiAdapter,
    @Optional() private sessionPort: SessionPort | null
  ) {}

  onSubmit(): void {
    if (this.battleForm.invalid) {
      this.battleForm.markAllAsTouched();
      return;
    }

    const name = this.battleForm.value.name!;
    this.loading.set(true);
    this.error.set(null);

    const createObs = this.sessionId && this.sessionPort
      ? this.sessionPort.createBattleInSession(this.sessionId, {name})
      : this.battleApi.createBattle(name).pipe(
          map(battle => ({
            id: battle.id,
            name: battle.name,
            status: battle.status,
            createdAt: battle.createdAt,
            lastModified: battle.lastModified
          } as BattleSummary))
        );

    createObs.subscribe({
      next: (battle) => {
        this.loading.set(false);
        this.battleCreated.emit(battle);
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

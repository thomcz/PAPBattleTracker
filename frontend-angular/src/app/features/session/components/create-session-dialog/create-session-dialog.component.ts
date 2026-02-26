import {Component, EventEmitter, Output, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {SessionListUseCase} from '../../../../core/domain/use-cases/session-list.use-case';
import {SessionResponse} from '../../../../core/domain/models/session.model';

@Component({
  selector: 'app-create-session-dialog',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-session-dialog.component.html',
  styleUrls: ['./create-session-dialog.component.css']
})
export class CreateSessionDialogComponent {
  @Output() sessionCreated = new EventEmitter<SessionResponse>();
  @Output() dialogClosed = new EventEmitter<void>();

  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  sessionForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100)
    ])
  });

  constructor(private sessionListUseCase: SessionListUseCase) {}

  onSubmit(): void {
    if (this.sessionForm.invalid) {
      this.sessionForm.markAllAsTouched();
      return;
    }

    const name = this.sessionForm.value.name!;
    this.loading.set(true);
    this.error.set(null);

    this.sessionListUseCase.createSession({name}).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.sessionCreated.emit(response);
        this.sessionForm.reset();
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to create session. Please try again.');
      }
    });
  }

  onCancel(): void {
    this.sessionForm.reset();
    this.error.set(null);
    this.dialogClosed.emit();
  }

  closeDialog(): void {
    this.dialogClosed.emit();
  }

  get nameControl(): FormControl {
    return this.sessionForm.get('name') as FormControl;
  }

  get nameErrors(): string | null {
    const control = this.nameControl;
    if (!control.touched) return null;

    if (control.hasError('required')) {
      return 'Session name is required';
    }
    if (control.hasError('minlength')) {
      return 'Session name must be at least 3 characters';
    }
    if (control.hasError('maxlength')) {
      return 'Session name must be at most 100 characters';
    }
    return null;
  }
}

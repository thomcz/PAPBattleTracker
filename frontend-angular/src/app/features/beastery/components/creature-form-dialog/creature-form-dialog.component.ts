import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BeasteryCreature } from '../../../../core/domain/models/beastery-creature.model';
import { BeasteryListUseCase } from '../../../../core/domain/use-cases/beastery-list.use-case';

@Component({
  selector: 'app-creature-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './creature-form-dialog.component.html',
  styleUrls: ['./creature-form-dialog.component.css']
})
export class CreatureFormDialogComponent implements OnInit {
  @Input() creature: BeasteryCreature | null = null;
  @Output() creatureSaved = new EventEmitter<void>();
  @Output() dialogClosed = new EventEmitter<void>();

  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  creatureForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]),
    hitPoints: new FormControl(10, [Validators.required, Validators.min(1), Validators.max(999)]),
    armorClass: new FormControl(10, [Validators.required, Validators.min(0), Validators.max(30)])
  });

  get isEditing(): boolean {
    return this.creature !== null;
  }

  constructor(private beasteryListUseCase: BeasteryListUseCase) {}

  ngOnInit(): void {
    if (this.creature) {
      this.creatureForm.patchValue({
        name: this.creature.name,
        hitPoints: this.creature.hitPoints,
        armorClass: this.creature.armorClass
      });
    }
  }

  onSubmit(): void {
    if (this.creatureForm.invalid) {
      this.creatureForm.markAllAsTouched();
      return;
    }

    const request = {
      name: this.creatureForm.value.name!,
      hitPoints: this.creatureForm.value.hitPoints!,
      armorClass: this.creatureForm.value.armorClass!
    };

    this.loading.set(true);
    this.error.set(null);

    const operation$ = this.isEditing
      ? this.beasteryListUseCase.updateCreature(this.creature!.creatureId, request)
      : this.beasteryListUseCase.createCreature(request);

    operation$.subscribe({
      next: () => {
        this.loading.set(false);
        this.creatureSaved.emit();
      },
      error: () => {
        this.loading.set(false);
        this.error.set(this.isEditing ? 'Failed to update creature.' : 'Failed to create creature.');
      }
    });
  }

  close(): void {
    this.dialogClosed.emit();
  }

  getFieldError(fieldName: string): string | null {
    const control = this.creatureForm.get(fieldName);
    if (!control?.touched) return null;

    if (control.hasError('required')) return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    if (control.hasError('minlength')) return 'Too short';
    if (control.hasError('maxlength')) return 'Too long';
    if (control.hasError('min')) return 'Value too low';
    if (control.hasError('max')) return 'Value too high';
    return null;
  }
}

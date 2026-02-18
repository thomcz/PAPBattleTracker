import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CreatureType } from '../../../../core/domain/models/battle.model';

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
    MatButtonModule
  ],
  templateUrl: './creature-dialog.component.html',
  styleUrls: ['./creature-dialog.component.css']
})
export class CreatureDialogComponent {
  form: FormGroup;
  CreatureType = CreatureType;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreatureDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CreatureDialogData
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

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  get isEditMode(): boolean {
    return this.data.mode === 'edit';
  }
}

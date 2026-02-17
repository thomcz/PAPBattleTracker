import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Creature, CreatureType } from '../../../../core/domain/models/battle.model';
import { CreatureDialogComponent, CreatureDialogData } from '../creature-dialog/creature-dialog.component';

/**
 * Component for displaying the list of creatures in a battle.
 * User Stories 1-3: Add/Edit/Remove Creatures
 */
@Component({
  selector: 'app-creature-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './creature-list.component.html',
  styleUrls: ['./creature-list.component.css']
})
export class CreatureListComponent {
  @Input() creatures: Creature[] = [];
  @Input() battleId!: string;
  @Output() addCreature = new EventEmitter<any>();
  @Output() updateCreature = new EventEmitter<{ creatureId: string; data: any }>();
  @Output() removeCreature = new EventEmitter<string>();

  CreatureType = CreatureType;

  constructor(private dialog: MatDialog) {}

  onAddCreature(): void {
    const dialogRef = this.dialog.open(CreatureDialogComponent, {
      width: '500px',
      data: { mode: 'add' } as CreatureDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addCreature.emit(result);
      }
    });
  }

  onEditCreature(creature: Creature): void {
    const dialogRef = this.dialog.open(CreatureDialogComponent, {
      width: '500px',
      data: {
        mode: 'edit',
        creature: {
          id: creature.id,
          name: creature.name,
          type: creature.type,
          currentHp: creature.currentHP,
          maxHp: creature.maxHP,
          initiative: creature.initiative,
          armorClass: creature.armorClass
        }
      } as CreatureDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updateCreature.emit({
          creatureId: creature.id,
          data: result
        });
      }
    });
  }

  onRemoveCreature(creatureId: string): void {
    if (confirm('Are you sure you want to remove this creature?')) {
      this.removeCreature.emit(creatureId);
    }
  }

  getHpPercentage(creature: Creature): number {
    return (creature.currentHP / creature.maxHP) * 100;
  }

  getHpClass(percentage: number): string {
    if (percentage > 50) return 'hp-healthy';
    if (percentage > 25) return 'hp-wounded';
    return 'hp-critical';
  }
}

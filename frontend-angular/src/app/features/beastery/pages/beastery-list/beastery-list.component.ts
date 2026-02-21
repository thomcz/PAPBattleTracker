import {Component, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {BeasteryListUseCase} from '../../../../core/domain/use-cases/beastery-list.use-case';
import {BeasteryCreature} from '../../../../core/domain/models/beastery-creature.model';
import {CreatureFormDialogComponent} from '../../components/creature-form-dialog/creature-form-dialog.component';

@Component({
  selector: 'app-beastery-list',
  standalone: true,
  imports: [CommonModule, CreatureFormDialogComponent],
  templateUrl: './beastery-list.component.html',
  styleUrls: ['./beastery-list.component.css']
})
export class BeasteryListComponent implements OnInit {
  showFormDialog = signal<boolean>(false);
  editingCreature = signal<BeasteryCreature | null>(null);
  deleteConfirmCreature = signal<BeasteryCreature | null>(null);

  constructor(
    public beasteryList: BeasteryListUseCase,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.beasteryList.loadCreatures().subscribe();
  }

  openCreateDialog(): void {
    this.editingCreature.set(null);
    this.showFormDialog.set(true);
  }

  openEditDialog(creature: BeasteryCreature): void {
    this.editingCreature.set(creature);
    this.showFormDialog.set(true);
  }

  closeFormDialog(): void {
    this.showFormDialog.set(false);
    this.editingCreature.set(null);
  }

  onCreatureSaved(): void {
    this.closeFormDialog();
  }

  confirmDelete(creature: BeasteryCreature): void {
    this.deleteConfirmCreature.set(creature);
  }

  cancelDelete(): void {
    this.deleteConfirmCreature.set(null);
  }

  executeDelete(): void {
    const creature = this.deleteConfirmCreature();
    if (!creature) return;

    this.beasteryList.deleteCreature(creature.creatureId).subscribe({
      next: () => this.deleteConfirmCreature.set(null),
      error: () => this.deleteConfirmCreature.set(null)
    });
  }

  duplicateCreature(creature: BeasteryCreature): void {
    this.beasteryList.duplicateCreature(creature.creatureId).subscribe();
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}

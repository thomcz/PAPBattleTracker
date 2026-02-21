import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { BeasteryPort } from '../../ports/beastery.port';
import {
  BeasteryCreature,
  BeasteryCreatureListResponse,
  CreateBeasteryCreatureRequest,
  UpdateBeasteryCreatureRequest
} from '../models/beastery-creature.model';

@Injectable({ providedIn: 'root' })
export class BeasteryListUseCase {
  private readonly creaturesSignal = signal<BeasteryCreature[]>([]);
  public readonly creatures = this.creaturesSignal.asReadonly();

  private readonly isLoadingSignal = signal<boolean>(false);
  public readonly isLoading = this.isLoadingSignal.asReadonly();

  private readonly errorSignal = signal<string | null>(null);
  public readonly error = this.errorSignal.asReadonly();

  constructor(private readonly beasteryPort: BeasteryPort) {}

  loadCreatures(): Observable<BeasteryCreatureListResponse> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return this.beasteryPort.listCreatures(false).pipe(
      tap({
        next: (response) => {
          this.creaturesSignal.set(response.creatures);
          this.isLoadingSignal.set(false);
        },
        error: (err) => {
          this.isLoadingSignal.set(false);
          this.errorSignal.set(err.message || 'Failed to load creatures');
        }
      })
    );
  }

  createCreature(request: CreateBeasteryCreatureRequest): Observable<BeasteryCreature> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return this.beasteryPort.createCreature(request).pipe(
      tap({
        next: (creature) => {
          this.creaturesSignal.update(creatures => [...creatures, creature]);
          this.isLoadingSignal.set(false);
        },
        error: (err) => {
          this.isLoadingSignal.set(false);
          this.errorSignal.set(err.message || 'Failed to create creature');
        }
      })
    );
  }

  updateCreature(creatureId: string, request: UpdateBeasteryCreatureRequest): Observable<BeasteryCreature> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return this.beasteryPort.updateCreature(creatureId, request).pipe(
      tap({
        next: (updated) => {
          this.creaturesSignal.update(creatures =>
            creatures.map(c => c.creatureId === creatureId ? updated : c)
          );
          this.isLoadingSignal.set(false);
        },
        error: (err) => {
          this.isLoadingSignal.set(false);
          this.errorSignal.set(err.message || 'Failed to update creature');
        }
      })
    );
  }

  deleteCreature(creatureId: string): Observable<void> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    return this.beasteryPort.deleteCreature(creatureId).pipe(
      tap({
        next: () => {
          this.creaturesSignal.update(creatures =>
            creatures.filter(c => c.creatureId !== creatureId)
          );
          this.isLoadingSignal.set(false);
        },
        error: (err) => {
          this.isLoadingSignal.set(false);
          this.errorSignal.set(err.message || 'Failed to delete creature');
        }
      })
    );
  }

  duplicateCreature(creatureId: string, customName?: string): Observable<BeasteryCreature> {
    this.isLoadingSignal.set(true);
    this.errorSignal.set(null);

    const request = customName ? { name: customName } : undefined;
    return this.beasteryPort.duplicateCreature(creatureId, request).pipe(
      tap({
        next: (creature) => {
          this.creaturesSignal.update(creatures => [...creatures, creature]);
          this.isLoadingSignal.set(false);
        },
        error: (err) => {
          this.isLoadingSignal.set(false);
          this.errorSignal.set(err.message || 'Failed to duplicate creature');
        }
      })
    );
  }

  clearError(): void {
    this.errorSignal.set(null);
  }
}

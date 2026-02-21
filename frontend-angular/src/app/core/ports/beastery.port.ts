import { Observable } from 'rxjs';
import {
  BeasteryCreature,
  BeasteryCreatureListResponse,
  CreateBeasteryCreatureRequest,
  DuplicateBeasteryCreatureRequest,
  UpdateBeasteryCreatureRequest
} from '../domain/models/beastery-creature.model';

export abstract class BeasteryPort {
  abstract createCreature(request: CreateBeasteryCreatureRequest): Observable<BeasteryCreature>;
  abstract listCreatures(includeDeleted?: boolean): Observable<BeasteryCreatureListResponse>;
  abstract getCreature(creatureId: string): Observable<BeasteryCreature>;
  abstract updateCreature(creatureId: string, request: UpdateBeasteryCreatureRequest): Observable<BeasteryCreature>;
  abstract deleteCreature(creatureId: string): Observable<void>;
  abstract duplicateCreature(creatureId: string, request?: DuplicateBeasteryCreatureRequest): Observable<BeasteryCreature>;
}

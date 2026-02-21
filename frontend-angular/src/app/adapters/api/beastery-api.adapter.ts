import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BeasteryPort } from '../../core/ports/beastery.port';
import {
  BeasteryCreature,
  BeasteryCreatureListResponse,
  CreateBeasteryCreatureRequest,
  DuplicateBeasteryCreatureRequest,
  UpdateBeasteryCreatureRequest
} from '../../core/domain/models/beastery-creature.model';
import { environment } from '../../../environments/environment';
import { HttpClientPort } from '../../core/ports/http-client.port';

@Injectable()
export class BeasteryApiAdapter extends BeasteryPort {
  private readonly apiUrl = `${environment.apiUrl}/beastery/creatures`;

  constructor(private http: HttpClientPort) {
    super();
  }

  createCreature(request: CreateBeasteryCreatureRequest): Observable<BeasteryCreature> {
    return this.http.post<BeasteryCreature>(this.apiUrl, request);
  }

  listCreatures(includeDeleted = false): Observable<BeasteryCreatureListResponse> {
    const url = includeDeleted ? `${this.apiUrl}?includeDeleted=true` : this.apiUrl;
    return this.http.get<BeasteryCreatureListResponse>(url);
  }

  getCreature(creatureId: string): Observable<BeasteryCreature> {
    return this.http.get<BeasteryCreature>(`${this.apiUrl}/${creatureId}`);
  }

  updateCreature(creatureId: string, request: UpdateBeasteryCreatureRequest): Observable<BeasteryCreature> {
    return this.http.put<BeasteryCreature>(`${this.apiUrl}/${creatureId}`, request);
  }

  deleteCreature(creatureId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${creatureId}`);
  }

  duplicateCreature(creatureId: string, request?: DuplicateBeasteryCreatureRequest): Observable<BeasteryCreature> {
    return this.http.post<BeasteryCreature>(`${this.apiUrl}/${creatureId}/duplicate`, request || {});
  }
}

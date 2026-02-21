import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

@Injectable({ providedIn: 'root' })
export class BeasteryApiAdapter extends BeasteryPort {
  private readonly apiUrl = `${environment.apiUrl}/beastery/creatures`;

  constructor(private http: HttpClient) {
    super();
  }

  createCreature(request: CreateBeasteryCreatureRequest): Observable<BeasteryCreature> {
    return this.http.post<BeasteryCreature>(this.apiUrl, request);
  }

  listCreatures(includeDeleted = false): Observable<BeasteryCreatureListResponse> {
    let params = new HttpParams();
    if (includeDeleted) {
      params = params.set('includeDeleted', 'true');
    }
    return this.http.get<BeasteryCreatureListResponse>(this.apiUrl, { params });
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

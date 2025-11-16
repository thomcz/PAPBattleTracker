import {Injectable} from '@angular/core';
import {AuthPort} from '../../ports/auth.port';
import {StoragePort} from '../../ports/storage.port';
import {Observable, tap} from 'rxjs';
import {AuthResponse} from '../models/auth-response.model';
import {RegisterRequest} from '../models/auth-request.model';
import {User} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class RegisterUseCase {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  constructor(
    private readonly authPort: AuthPort,
    private readonly storage: StoragePort,
  ) {
  }

  execute(request: RegisterRequest): Observable<AuthResponse> {
    return this.authPort.register(request).pipe(
      tap(response => this.handleSuccess(response))
    );
  }

  private handleSuccess(response: AuthResponse): void {
    this.storage.setItem(this.TOKEN_KEY, response.token);

    const user: User = {
      userName: response.userName,
      email: response.email
    };
    this.storage.setItem(this.USER_KEY, JSON.stringify(user));

  }
}

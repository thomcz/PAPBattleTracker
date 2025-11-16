import {computed, Injectable, signal} from '@angular/core';
import {User} from '../models/user.model';
import {AuthPort} from '../../ports/auth.port';
import {StoragePort} from '../../ports/storage.port';
import {LoginRequest} from '../models/auth-request.model';
import {Observable, tap} from 'rxjs';
import {AuthResponse} from '../models/auth-response.model';

@Injectable({
  providedIn: 'root',
})
export class LoginUseCase {

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  private readonly currentUserSignal = signal<User | null>(null);
  public currentUser = this.currentUserSignal.asReadonly();
  public isAuthenticated = computed(() => this.currentUserSignal() !== null);

  constructor(
    private readonly authPort: AuthPort,
    private readonly storage: StoragePort
  ) {
    const user = this.authPort.getCurrentUser();
    if (user) {
      this.currentUserSignal.set(user);
    }
  }

  execute(request: LoginRequest): Observable<AuthResponse> {
    return this.authPort.login(request).pipe(
      tap(response => this.handleSuccess(response))
    );
  }

  getToken(): string | null {
    return this.storage.getItem(this.TOKEN_KEY);
  }

  clearAuthState(): void {
    this.currentUserSignal.set(null);
  }

  private handleSuccess(response: AuthResponse): void {
    this.storage.setItem(this.TOKEN_KEY, response.token);

    const user: User = {
      userName: response.userName,
      email: response.email
    };
    this.storage.setItem(this.USER_KEY, JSON.stringify(user));

    this.currentUserSignal.set(user);
  }
}

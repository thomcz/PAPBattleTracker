import {User} from '../domain/models/user.model';
import {Observable} from 'rxjs';
import {AuthResponse} from '../domain/models/auth-response.model';
import {LoginRequest, RegisterRequest} from '../domain/models/auth-request.model';

export abstract class AuthPort {
  abstract login(request: LoginRequest): Observable<AuthResponse>;

  abstract register(request: RegisterRequest): Observable<AuthResponse>;

  abstract getCurrentUser(): User | null;

  abstract isAuthenticated(): boolean;
}

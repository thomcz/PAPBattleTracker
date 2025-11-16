import {Injectable} from '@angular/core';
import {LoginRequest, RegisterRequest} from '../../core/domain/models/auth-request.model';
import {catchError, Observable, throwError} from 'rxjs';
import {AuthResponse} from '../../core/domain/models/auth-response.model';
import {environment} from '../../../environments/environment';
import {HttpErrorResponse} from '@angular/common/http';
import {AuthPort} from '../../core/ports/auth.port';
import {HttpClientPort} from '../../core/ports/http-client.port';
import {StoragePort} from '../../core/ports/storage.port';
import {User} from '../../core/domain/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class Authentication extends AuthPort {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';


  constructor(private readonly http: HttpClientPort,
              private readonly storage: StoragePort) {
    super();
  }


  override register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  override login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, request)
      .pipe(
        catchError(this.handleError)
      );
  }


  getToken(): string | null {
    return this.storage.getItem(this.TOKEN_KEY);
  }

  override isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  override getCurrentUser(): User | null {
    return this.storage.getItem(this.USER_KEY) ? JSON.parse(this.storage.getItem(this.USER_KEY) as string) : null;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend error
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Server returned code ${error.status}: ${error.message}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }

}

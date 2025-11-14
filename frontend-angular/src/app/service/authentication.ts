import {computed, Injectable, signal} from '@angular/core';
import {LoginRequest, RegisterRequest} from '../models/auth-request.model';
import {catchError, Observable, tap, throwError} from 'rxjs';
import {AuthResponse} from '../models/auth-response.model';
import {environment} from '../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {User} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class Authentication {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  // Using Angular signals for reactive state management
  private readonly currentUserSignal = signal<User | null>(this.getUserFromStorage());
  // Public read-only access to signals
  currentUser = this.currentUserSignal.asReadonly();
  private readonly isAuthenticatedSignal = computed(() => this.currentUserSignal() !== null);
  isAuthenticated = this.isAuthenticatedSignal;

  constructor(private readonly http: HttpClient) {
  }


  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, request)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(this.handleError)
      );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, request)
      .pipe(
        tap(response => this.handleAuthSuccess(response)),
        catchError(this.handleError)
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    const user: User = {
      userName: response.userName,
      email: response.email
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  /**
   * Get user from localStorage on app initialization
   */
  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Centralized error handling
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend error
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Server returned code ${error.status}: ${error.message}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }

}

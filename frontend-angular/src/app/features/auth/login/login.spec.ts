import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { of, throwError, Observable } from 'rxjs';
import { provideRouter } from '@angular/router';
import { Login } from './login';
import { LoginUseCase } from '../../../core/domain/use-cases/login.use-case';
import { NavigationPort } from '../../../core/ports/navigation.port';
import { AuthResponse } from '../../../core/domain/models/auth-response.model';

describe('Login', () => {
  const mockAuthResponse: AuthResponse = {
    token: 'jwt-token-123',
    userName: 'testuser',
    email: 'test@example.com'
  };

  const mockLoginUseCase = {
    execute: vi.fn(),
    currentUser: vi.fn(),
    isAuthenticated: vi.fn(),
    getToken: vi.fn()
  };

  const mockNavigationPort = {
    navigate: vi.fn(),
    navigateByUrl: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the login form with all elements', async () => {
    await render(Login, {
      providers: [
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    expect(screen.getByRole('heading', { name: /login to pap battle tracker/i })).toBeTruthy();
    expect(screen.getByLabelText(/username/i)).toBeTruthy();
    expect(screen.getByLabelText(/password/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /login/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /register here/i })).toBeTruthy();
  });

  it('should show validation error when username is empty and form is touched', async () => {
    const user = userEvent.setup();

    await render(Login, {
      providers: [
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const usernameInput = screen.getByLabelText(/username/i);

    // Focus and blur without entering text
    await user.click(usernameInput);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeTruthy();
    });
  });

  it('should show validation error when username is too short', async () => {
    const user = userEvent.setup();

    await render(Login, {
      providers: [
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const usernameInput = screen.getByLabelText(/username/i);

    await user.type(usernameInput, 'ab');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/username must be at least 3 characters/i)).toBeTruthy();
    });
  });

  it('should show validation error when password is empty and form is touched', async () => {
    const user = userEvent.setup();

    await render(Login, {
      providers: [
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const passwordInput = screen.getByLabelText(/password/i);

    // Focus and blur without entering text
    await user.click(passwordInput);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeTruthy();
    });
  });

  it('should show validation error when password is too short', async () => {
    const user = userEvent.setup();

    await render(Login, {
      providers: [
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(passwordInput, '12345');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeTruthy();
    });
  });

  it('should not submit form when fields are invalid', async () => {
    const user = userEvent.setup();

    await render(Login, {
      providers: [
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    // Use case should not be called with invalid form
    expect(mockLoginUseCase.execute).not.toHaveBeenCalled();

    // Validation errors should appear
    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeTruthy();
      expect(screen.getByText(/password is required/i)).toBeTruthy();
    });
  });

  it('should successfully login when form is valid', async () => {
    const user = userEvent.setup();
    mockLoginUseCase.execute.mockReturnValue(of(mockAuthResponse));

    await render(Login, {
      providers: [
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLoginUseCase.execute).toHaveBeenCalledWith({
        userName: 'testuser',
        password: 'password123'
      });
      expect(mockNavigationPort.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  it('should show loading state during login', async () => {
    const user = userEvent.setup();

    // Create an Observable that doesn't immediately complete
    mockLoginUseCase.execute.mockReturnValue(
      new Observable(subscriber => {
        // Don't complete immediately - this simulates a pending request
        setTimeout(() => {
          subscriber.next(mockAuthResponse);
          subscriber.complete();
        }, 1000);
      })
    );

    await render(Login, {
      providers: [
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/logging in.../i)).toBeTruthy();
    });

    // Submit button should be disabled during loading
    expect(submitButton.hasAttribute('disabled')).toBe(true);
  });

  it('should show error message when login fails', async () => {
    const user = userEvent.setup();
    mockLoginUseCase.execute.mockReturnValue(
      throwError(() => new Error('Invalid credentials'))
    );

    await render(Login, {
      providers: [
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(usernameInput, 'wronguser');
    await user.type(passwordInput, 'wrongpass');

    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeTruthy();
    });

    // Should not navigate on error
    expect(mockNavigationPort.navigate).not.toHaveBeenCalled();
  });

  it('should show generic error message when error has no message', async () => {
    const user = userEvent.setup();
    mockLoginUseCase.execute.mockReturnValue(
      throwError(() => ({}))
    );

    await render(Login, {
      providers: [
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/login failed\. please try again\./i)).toBeTruthy();
    });
  });

  it('should clear error message on successful login after previous error', async () => {
    const user = userEvent.setup();

    // First attempt fails
    mockLoginUseCase.execute.mockReturnValueOnce(
      throwError(() => new Error('Invalid credentials'))
    );

    const { fixture } = await render(Login, {
      providers: [
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort }
      ]
    });

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });

    // First failed login
    await user.type(usernameInput, 'wronguser');
    await user.type(passwordInput, 'wrongpass');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeTruthy();
    });

    // Second attempt succeeds
    mockLoginUseCase.execute.mockReturnValueOnce(of(mockAuthResponse));

    await user.clear(usernameInput);
    await user.clear(passwordInput);
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Error message should be cleared
    await waitFor(() => {
      expect(screen.queryByText(/invalid credentials/i)).toBeFalsy();
    });
  });

  it('should navigate to register page when clicking register link', async () => {
    const user = userEvent.setup();

    await render(Login, {
      providers: [
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const registerLink = screen.getByRole('link', { name: /register here/i });
    expect(registerLink.getAttribute('href')).toBe('/register');
  });

  it('should not display error message initially', async () => {
    await render(Login, {
      providers: [
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const errorAlert = screen.queryByRole('alert');
    expect(errorAlert).toBeFalsy();
  });

  it('should allow typing in username field', async () => {
    const user = userEvent.setup();

    await render(Login, {
      providers: [
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const usernameInput = screen.getByLabelText(/username/i) as HTMLInputElement;
    await user.type(usernameInput, 'myusername');

    expect(usernameInput.value).toBe('myusername');
  });

  it('should allow typing in password field', async () => {
    const user = userEvent.setup();

    await render(Login, {
      providers: [
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    await user.type(passwordInput, 'mypassword');

    expect(passwordInput.value).toBe('mypassword');
    expect(passwordInput.type).toBe('password');
  });
});

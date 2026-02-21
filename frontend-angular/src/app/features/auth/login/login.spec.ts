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

  it('should render the login form with all themed elements', async () => {
    await render(Login, {
      providers: [
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    expect(screen.getByRole('heading', { name: /dungeon master/i })).toBeTruthy();
    expect(screen.getByText(/campaign management suite/i)).toBeTruthy();
    expect(screen.getByLabelText(/grandmaster id/i)).toBeTruthy();
    expect(screen.getByLabelText(/secret sigil/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /enter the sanctum/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /create new campaign/i })).toBeTruthy();
  });

  it('should display OR JOIN THE GUILD divider', async () => {
    await render(Login, {
      providers: [
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    expect(screen.getByText(/or join the guild/i)).toBeTruthy();
  });

  it('should display FORGOTTEN? link', async () => {
    await render(Login, {
      providers: [
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    expect(screen.getByText(/forgotten\?/i)).toBeTruthy();
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

    const usernameInput = screen.getByLabelText(/grandmaster id/i);

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

    const usernameInput = screen.getByLabelText(/grandmaster id/i);

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

    const passwordInput = screen.getByLabelText(/secret sigil/i);

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

    const passwordInput = screen.getByLabelText(/secret sigil/i);

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

    const submitButton = screen.getByRole('button', { name: /enter the sanctum/i });
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

    const usernameInput = screen.getByLabelText(/grandmaster id/i);
    const passwordInput = screen.getByLabelText(/secret sigil/i);

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /enter the sanctum/i });
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

    const usernameInput = screen.getByLabelText(/grandmaster id/i);
    const passwordInput = screen.getByLabelText(/secret sigil/i);

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /enter the sanctum/i });
    await user.click(submitButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/entering the sanctum.../i)).toBeTruthy();
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

    const usernameInput = screen.getByLabelText(/grandmaster id/i);
    const passwordInput = screen.getByLabelText(/secret sigil/i);

    await user.type(usernameInput, 'wronguser');
    await user.type(passwordInput, 'wrongpass');

    const submitButton = screen.getByRole('button', { name: /enter the sanctum/i });
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

    const usernameInput = screen.getByLabelText(/grandmaster id/i);
    const passwordInput = screen.getByLabelText(/secret sigil/i);

    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /enter the sanctum/i });
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

    const usernameInput = screen.getByLabelText(/grandmaster id/i);
    const passwordInput = screen.getByLabelText(/secret sigil/i);
    const submitButton = screen.getByRole('button', { name: /enter the sanctum/i });

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

  it('should navigate to register page when clicking Create New Campaign link', async () => {
    await render(Login, {
      providers: [
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const registerLink = screen.getByRole('link', { name: /create new campaign/i });
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

    const usernameInput = screen.getByLabelText(/grandmaster id/i) as HTMLInputElement;
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

    const passwordInput = screen.getByLabelText(/secret sigil/i) as HTMLInputElement;
    await user.type(passwordInput, 'mypassword');

    expect(passwordInput.value).toBe('mypassword');
    expect(passwordInput.type).toBe('password');
  });

  // === Password Visibility Toggle Tests ===

  it('should toggle password visibility when eye icon is clicked', async () => {
    const user = userEvent.setup();

    await render(Login, {
      providers: [
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const passwordInput = screen.getByLabelText(/secret sigil/i) as HTMLInputElement;
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

    // Initially password type
    expect(passwordInput.type).toBe('password');

    // Click to show password
    await user.click(toggleButton);
    expect(passwordInput.type).toBe('text');

    // Click again to hide password
    await user.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  it('should render the password visibility toggle button', async () => {
    await render(Login, {
      providers: [
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });
    expect(toggleButton).toBeTruthy();
  });

  it('should be keyboard accessible for password toggle', async () => {
    const user = userEvent.setup();

    await render(Login, {
      providers: [
        { provide: LoginUseCase, useValue: mockLoginUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const passwordInput = screen.getByLabelText(/secret sigil/i) as HTMLInputElement;
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

    // Tab to the toggle button and activate with Enter/Space
    toggleButton.focus();
    await user.keyboard('{Enter}');

    expect(passwordInput.type).toBe('text');
  });
});

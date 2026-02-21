import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { of, throwError, Observable } from 'rxjs';
import { provideRouter } from '@angular/router';
import { Register } from './register';
import { RegisterUseCase } from '../../../core/domain/use-cases/register.use-case';
import { NavigationPort } from '../../../core/ports/navigation.port';
import { AuthResponse } from '../../../core/domain/models/auth-response.model';

describe('Register', () => {
  const mockAuthResponse: AuthResponse = {
    token: 'jwt-token-123',
    userName: 'newuser',
    email: 'newuser@example.com'
  };

  const mockRegisterUseCase = {
    execute: vi.fn()
  };

  const mockNavigationPort = {
    navigate: vi.fn(),
    navigateByUrl: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the registration form with all themed elements', async () => {
    await render(Register, {
      providers: [
        { provide: RegisterUseCase, useValue: mockRegisterUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    expect(screen.getByRole('heading', { name: /join the guild/i })).toBeTruthy();
    expect(screen.getByText(/create your campaign/i)).toBeTruthy();
    expect(screen.getByLabelText(/^username$/i)).toBeTruthy();
    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByLabelText(/^password$/i)).toBeTruthy();
    expect(screen.getByLabelText(/confirm password/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /join the guild/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: /return to sanctum/i })).toBeTruthy();
  });

  it('should show validation error when username is empty and form is touched', async () => {
    const user = userEvent.setup();

    await render(Register, {
      providers: [
        { provide: RegisterUseCase, useValue: mockRegisterUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const usernameInput = screen.getByLabelText(/^username$/i);

    // Focus and blur without entering text
    await user.click(usernameInput);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeTruthy();
    });
  });

  it('should show validation error when username is too short', async () => {
    const user = userEvent.setup();

    await render(Register, {
      providers: [
        { provide: RegisterUseCase, useValue: mockRegisterUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const usernameInput = screen.getByLabelText(/^username$/i);

    await user.type(usernameInput, 'ab');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/username must be at least 3 characters/i)).toBeTruthy();
    });
  });

  it('should show validation error when email is empty and form is touched', async () => {
    const user = userEvent.setup();

    await render(Register, {
      providers: [
        { provide: RegisterUseCase, useValue: mockRegisterUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const emailInput = screen.getByLabelText(/email/i);

    // Focus and blur without entering text
    await user.click(emailInput);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeTruthy();
    });
  });

  it('should show validation error when email format is invalid', async () => {
    const user = userEvent.setup();

    await render(Register, {
      providers: [
        { provide: RegisterUseCase, useValue: mockRegisterUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const emailInput = screen.getByLabelText(/email/i);

    await user.type(emailInput, 'invalid-email');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeTruthy();
    });
  });

  it('should show validation error when password is empty and form is touched', async () => {
    const user = userEvent.setup();

    await render(Register, {
      providers: [
        { provide: RegisterUseCase, useValue: mockRegisterUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const passwordInput = screen.getByLabelText(/^password$/i);

    // Focus and blur without entering text
    await user.click(passwordInput);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeTruthy();
    });
  });

  it('should show validation error when password is too short', async () => {
    const user = userEvent.setup();

    await render(Register, {
      providers: [
        { provide: RegisterUseCase, useValue: mockRegisterUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const passwordInput = screen.getByLabelText(/^password$/i);

    await user.type(passwordInput, '12345');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeTruthy();
    });
  });

  it('should show validation error when confirm password is empty and form is touched', async () => {
    const user = userEvent.setup();

    await render(Register, {
      providers: [
        { provide: RegisterUseCase, useValue: mockRegisterUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    // Focus and blur without entering text
    await user.click(confirmPasswordInput);
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/please confirm your password/i)).toBeTruthy();
    });
  });

  it('should show validation error when passwords do not match', async () => {
    const user = userEvent.setup();

    await render(Register, {
      providers: [
        { provide: RegisterUseCase, useValue: mockRegisterUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password456');
    await user.tab();

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeTruthy();
    });
  });

  it('should not show password mismatch error when passwords match', async () => {
    const user = userEvent.setup();

    await render(Register, {
      providers: [
        { provide: RegisterUseCase, useValue: mockRegisterUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.tab();

    // Should not show mismatch error
    expect(screen.queryByText(/passwords do not match/i)).toBeFalsy();
  });

  it('should not submit form when fields are invalid', async () => {
    const user = userEvent.setup();

    await render(Register, {
      providers: [
        { provide: RegisterUseCase, useValue: mockRegisterUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const submitButton = screen.getByRole('button', { name: /join the guild/i });
    await user.click(submitButton);

    // Use case should not be called with invalid form
    expect(mockRegisterUseCase.execute).not.toHaveBeenCalled();

    // Validation errors should appear
    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeTruthy();
      expect(screen.getByText(/email is required/i)).toBeTruthy();
      expect(screen.getByText(/password is required/i)).toBeTruthy();
      expect(screen.getByText(/please confirm your password/i)).toBeTruthy();
    });
  });

  it('should not submit form when passwords do not match', async () => {
    const user = userEvent.setup();

    await render(Register, {
      providers: [
        { provide: RegisterUseCase, useValue: mockRegisterUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const usernameInput = screen.getByLabelText(/^username$/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(usernameInput, 'testuser');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password456');

    const submitButton = screen.getByRole('button', { name: /join the guild/i });
    await user.click(submitButton);

    // Use case should not be called
    expect(mockRegisterUseCase.execute).not.toHaveBeenCalled();

    // Password mismatch error should appear
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeTruthy();
    });
  });

  it('should successfully register when form is valid', async () => {
    const user = userEvent.setup();
    mockRegisterUseCase.execute.mockReturnValue(of(mockAuthResponse));

    await render(Register, {
      providers: [
        { provide: RegisterUseCase, useValue: mockRegisterUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const usernameInput = screen.getByLabelText(/^username$/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(usernameInput, 'newuser');
    await user.type(emailInput, 'newuser@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /join the guild/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRegisterUseCase.execute).toHaveBeenCalledWith({
        userName: 'newuser',
        email: 'newuser@example.com',
        password: 'password123'
      });
      expect(mockNavigationPort.navigate).toHaveBeenCalledWith(['/']);
    });
  });

  it('should show loading state during registration', async () => {
    const user = userEvent.setup();

    // Create an Observable that doesn't immediately complete
    mockRegisterUseCase.execute.mockReturnValue(
      new Observable(subscriber => {
        // Don't complete immediately - this simulates a pending request
        setTimeout(() => {
          subscriber.next(mockAuthResponse);
          subscriber.complete();
        }, 1000);
      })
    );

    await render(Register, {
      providers: [
        { provide: RegisterUseCase, useValue: mockRegisterUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const usernameInput = screen.getByLabelText(/^username$/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(usernameInput, 'newuser');
    await user.type(emailInput, 'newuser@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /join the guild/i });
    await user.click(submitButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText(/forging your identity.../i)).toBeTruthy();
    });

    // Submit button should be disabled during loading
    expect(submitButton.hasAttribute('disabled')).toBe(true);
  });

  it('should show error message when registration fails', async () => {
    const user = userEvent.setup();
    mockRegisterUseCase.execute.mockReturnValue(
      throwError(() => new Error('Username already exists'))
    );

    await render(Register, {
      providers: [
        { provide: RegisterUseCase, useValue: mockRegisterUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const usernameInput = screen.getByLabelText(/^username$/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(usernameInput, 'existinguser');
    await user.type(emailInput, 'existing@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /join the guild/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/username already exists/i)).toBeTruthy();
    });

    // Should not navigate on error
    expect(mockNavigationPort.navigate).not.toHaveBeenCalled();
  });

  it('should show generic error message when error has no message', async () => {
    const user = userEvent.setup();
    mockRegisterUseCase.execute.mockReturnValue(
      throwError(() => ({}))
    );

    await render(Register, {
      providers: [
        { provide: RegisterUseCase, useValue: mockRegisterUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const usernameInput = screen.getByLabelText(/^username$/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(usernameInput, 'newuser');
    await user.type(emailInput, 'newuser@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /join the guild/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/registration failed\. please try again\./i)).toBeTruthy();
    });
  });

  it('should clear error message on successful registration after previous error', async () => {
    const user = userEvent.setup();

    // First attempt fails
    mockRegisterUseCase.execute.mockReturnValueOnce(
      throwError(() => new Error('Username already exists'))
    );

    await render(Register, {
      providers: [
        { provide: RegisterUseCase, useValue: mockRegisterUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const usernameInput = screen.getByLabelText(/^username$/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /join the guild/i });

    // First failed registration
    await user.type(usernameInput, 'existinguser');
    await user.type(emailInput, 'existing@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/username already exists/i)).toBeTruthy();
    });

    // Second attempt succeeds
    mockRegisterUseCase.execute.mockReturnValueOnce(of(mockAuthResponse));

    await user.clear(usernameInput);
    await user.clear(emailInput);
    await user.clear(passwordInput);
    await user.clear(confirmPasswordInput);
    await user.type(usernameInput, 'newuser');
    await user.type(emailInput, 'newuser@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    // Error message should be cleared
    await waitFor(() => {
      expect(screen.queryByText(/username already exists/i)).toBeFalsy();
    });
  });

  it('should navigate to login page when clicking login link', async () => {
    await render(Register, {
      providers: [
        { provide: RegisterUseCase, useValue: mockRegisterUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const loginLink = screen.getByRole('link', { name: /return to sanctum/i });
    expect(loginLink.getAttribute('href')).toBe('/login');
  });

  it('should not display error message initially', async () => {
    await render(Register, {
      providers: [
        { provide: RegisterUseCase, useValue: mockRegisterUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const errorAlert = screen.queryByRole('alert');
    expect(errorAlert).toBeFalsy();
  });

  it('should allow typing in all form fields', async () => {
    const user = userEvent.setup();

    await render(Register, {
      providers: [
        { provide: RegisterUseCase, useValue: mockRegisterUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const usernameInput = screen.getByLabelText(/^username$/i) as HTMLInputElement;
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/^password$/i) as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i) as HTMLInputElement;

    await user.type(usernameInput, 'myusername');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'mypassword');
    await user.type(confirmPasswordInput, 'mypassword');

    expect(usernameInput.value).toBe('myusername');
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('mypassword');
    expect(confirmPasswordInput.value).toBe('mypassword');
    expect(passwordInput.type).toBe('password');
    expect(confirmPasswordInput.type).toBe('password');
  });

  it('should accept valid email formats', async () => {
    const user = userEvent.setup();

    await render(Register, {
      providers: [
        { provide: RegisterUseCase, useValue: mockRegisterUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const emailInput = screen.getByLabelText(/email/i);

    await user.type(emailInput, 'valid.email+tag@example.co.uk');
    await user.tab();

    // Should not show email validation error
    expect(screen.queryByText(/please enter a valid email/i)).toBeFalsy();
  });

  it('should reject invalid email formats', async () => {
    const user = userEvent.setup();

    await render(Register, {
      providers: [
        { provide: RegisterUseCase, useValue: mockRegisterUseCase },
        { provide: NavigationPort, useValue: mockNavigationPort },
        provideRouter([])
      ]
    });

    const emailInput = screen.getByLabelText(/email/i);

    const invalidEmails = ['invalid', 'invalid@', '@example.com', 'invalid@.com'];

    for (const invalidEmail of invalidEmails) {
      await user.clear(emailInput);
      await user.type(emailInput, invalidEmail);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email/i)).toBeTruthy();
      });
    }
  });
});

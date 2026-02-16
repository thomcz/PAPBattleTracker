import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { vi } from 'vitest';
import { authInterceptor } from './auth.interceptor';
import { LogoutUseCase } from '../../core/domain/use-cases/logout.use-case';
import { LoginUseCase } from '../../core/domain/use-cases/login.use-case';
import { NavigationPort } from '../../core/ports/navigation.port';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let loginUseCase: LoginUseCase;
  let logoutUseCase: LogoutUseCase;
  let navigationPort: NavigationPort;

  beforeEach(() => {
    const loginUseCaseMock = {
      getToken: vi.fn()
    };

    const logoutUseCaseMock = {
      execute: vi.fn()
    };

    const navigationPortMock = {
      navigate: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: LoginUseCase, useValue: loginUseCaseMock },
        { provide: LogoutUseCase, useValue: logoutUseCaseMock },
        { provide: NavigationPort, useValue: navigationPortMock }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    loginUseCase = TestBed.inject(LoginUseCase);
    logoutUseCase = TestBed.inject(LogoutUseCase);
    navigationPort = TestBed.inject(NavigationPort);
  });

  afterEach(() => {
    // Verify that no unexpected requests are outstanding
    httpTestingController.verify();
  });

  describe('Adding Authorization Header', () => {
    it('should add Authorization header when token exists', () => {
      const testToken = 'test-jwt-token';
      (loginUseCase.getToken as ReturnType<typeof vi.fn>).mockReturnValue(testToken);

      httpClient.get('/api/test').subscribe();

      const req = httpTestingController.expectOne('/api/test');
      expect(req.request.headers.has('Authorization')).toBe(true);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${testToken}`);

      req.flush({});
    });

    it('should not add Authorization header when token is null', () => {
      (loginUseCase.getToken as ReturnType<typeof vi.fn>).mockReturnValue(null);

      httpClient.get('/api/test').subscribe();

      const req = httpTestingController.expectOne('/api/test');
      expect(req.request.headers.has('Authorization')).toBe(false);

      req.flush({});
    });

    it('should not add Authorization header when token is empty string', () => {
      (loginUseCase.getToken as ReturnType<typeof vi.fn>).mockReturnValue('');

      httpClient.get('/api/test').subscribe();

      const req = httpTestingController.expectOne('/api/test');
      expect(req.request.headers.has('Authorization')).toBe(false);

      req.flush({});
    });

    it('should add Bearer token for POST requests', () => {
      const testToken = 'test-jwt-token';
      (loginUseCase.getToken as ReturnType<typeof vi.fn>).mockReturnValue(testToken);

      httpClient.post('/api/test', { data: 'test' }).subscribe();

      const req = httpTestingController.expectOne('/api/test');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${testToken}`);

      req.flush({});
    });
  });

  describe('Handling 401 Unauthorized', () => {
    it('should logout and redirect when receiving 401 error', () => {
      (loginUseCase.getToken as ReturnType<typeof vi.fn>).mockReturnValue('expired-token');

      httpClient.get('/api/test').subscribe({
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpTestingController.expectOne('/api/test');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      expect(logoutUseCase.execute).toHaveBeenCalled();
      expect(navigationPort.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('should call logout before navigating on 401', () => {
      (loginUseCase.getToken as ReturnType<typeof vi.fn>).mockReturnValue('expired-token');
      const callOrder: string[] = [];

      (logoutUseCase.execute as ReturnType<typeof vi.fn>).mockImplementation(() => {
        callOrder.push('logout');
      });

      (navigationPort.navigate as ReturnType<typeof vi.fn>).mockImplementation(() => {
        callOrder.push('navigate');
      });

      httpClient.get('/api/test').subscribe({
        error: () => {
          // Error handled
        }
      });

      const req = httpTestingController.expectOne('/api/test');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      expect(callOrder).toEqual(['logout', 'navigate']);
    });

    it('should still propagate 401 error after handling', () => {
      (loginUseCase.getToken as ReturnType<typeof vi.fn>).mockReturnValue('expired-token');
      let errorReceived = false;

      httpClient.get('/api/test').subscribe({
        error: (error: HttpErrorResponse) => {
          errorReceived = true;
          expect(error.status).toBe(401);
        }
      });

      const req = httpTestingController.expectOne('/api/test');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      expect(errorReceived).toBe(true);
    });
  });

  describe('Handling Other Errors', () => {
    it('should not interfere with 404 errors', () => {
      (loginUseCase.getToken as ReturnType<typeof vi.fn>).mockReturnValue('valid-token');
      let error404Received = false;

      httpClient.get('/api/test').subscribe({
        error: (error: HttpErrorResponse) => {
          error404Received = true;
          expect(error.status).toBe(404);
        }
      });

      const req = httpTestingController.expectOne('/api/test');
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });

      expect(error404Received).toBe(true);
      expect(logoutUseCase.execute).not.toHaveBeenCalled();
      expect(navigationPort.navigate).not.toHaveBeenCalled();
    });

    it('should not interfere with 500 errors', () => {
      (loginUseCase.getToken as ReturnType<typeof vi.fn>).mockReturnValue('valid-token');
      let error500Received = false;

      httpClient.get('/api/test').subscribe({
        error: (error: HttpErrorResponse) => {
          error500Received = true;
          expect(error.status).toBe(500);
        }
      });

      const req = httpTestingController.expectOne('/api/test');
      req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });

      expect(error500Received).toBe(true);
      expect(logoutUseCase.execute).not.toHaveBeenCalled();
      expect(navigationPort.navigate).not.toHaveBeenCalled();
    });

    it('should not interfere with 403 Forbidden errors', () => {
      (loginUseCase.getToken as ReturnType<typeof vi.fn>).mockReturnValue('valid-token');
      let error403Received = false;

      httpClient.get('/api/test').subscribe({
        error: (error: HttpErrorResponse) => {
          error403Received = true;
          expect(error.status).toBe(403);
        }
      });

      const req = httpTestingController.expectOne('/api/test');
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

      expect(error403Received).toBe(true);
      expect(logoutUseCase.execute).not.toHaveBeenCalled();
      expect(navigationPort.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Successful Responses', () => {
    it('should pass through successful responses without modification', () => {
      (loginUseCase.getToken as ReturnType<typeof vi.fn>).mockReturnValue('valid-token');
      const testData = { message: 'success', data: [1, 2, 3] };
      let responseReceived = false;

      httpClient.get('/api/test').subscribe((response) => {
        responseReceived = true;
        expect(response).toEqual(testData);
      });

      const req = httpTestingController.expectOne('/api/test');
      req.flush(testData);

      expect(responseReceived).toBe(true);
      expect(logoutUseCase.execute).not.toHaveBeenCalled();
      expect(navigationPort.navigate).not.toHaveBeenCalled();
    });

    it('should not interfere with successful POST responses', () => {
      (loginUseCase.getToken as ReturnType<typeof vi.fn>).mockReturnValue('valid-token');
      const testData = { id: '123', created: true };
      let responseReceived = false;

      httpClient.post('/api/test', { name: 'Test' }).subscribe((response) => {
        responseReceived = true;
        expect(response).toEqual(testData);
      });

      const req = httpTestingController.expectOne('/api/test');
      req.flush(testData);

      expect(responseReceived).toBe(true);
    });
  });
});

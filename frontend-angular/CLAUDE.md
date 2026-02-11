# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Frontend Overview

Angular 18 frontend with hexagonal architecture and signal-based state management. Currently implements user authentication; battle tracker features planned.

## Development Commands

```bash
# Development
npm start                            # Start dev server at http://localhost:4200
npm run build                        # Build production bundle
npm test                             # Run tests with Vitest
npm run lint                         # Run ESLint
```

## Architecture

### Hexagonal (Ports and Adapters) Structure

```typescript
src/app/
├── core/
│   ├── domain/
│   │   ├── models/          // Domain entities (User, AuthRequest, AuthResponse)
│   │   └── use-cases/       // Business logic (LoginUseCase, RegisterUseCase)
│   ├── ports/               // Interfaces for adapters
│   │   ├── auth.port.ts
│   │   ├── storage.port.ts
│   │   ├── http-client.port.ts
│   │   └── navigation.port.ts
│   └── guards/              // Route guards (authenticationGuard)
│
├── adapters/                // Implementations of ports
│   ├── api/
│   │   ├── authentication.ts          // Implements AuthPort
│   │   └── angular-http.adapter.ts    // Implements HttpClientPort
│   ├── storage/
│   │   └── local-storage.adapter.ts   // Implements StoragePort
│   ├── navigation/
│   │   └── angular-router.adapter.ts  // Implements NavigationPort
│   └── interceptors/
│       └── auth.interceptor.ts        // Adds JWT to requests
│
└── features/                // Feature modules
    └── auth/
        ├── login/
        └── register/
```

**Key Principle**: Dependencies flow inward. Domain (use cases, models) has NO dependencies on adapters or Angular framework. Adapters depend on ports. Features depend on use cases.

### Technology Stack

- **Framework**: Angular 18 (standalone components)
- **Language**: TypeScript
- **State Management**: RxJS + Angular Signals
- **HTTP**: HttpClient with interceptors
- **Routing**: Angular Router with guards
- **Testing**: Vitest + jsdom

### State Management Pattern

Use cases manage state with Angular signals:

```typescript
@Injectable({ providedIn: 'root' })
export class LoginUseCase {
  private readonly currentUserSignal = signal<User | null>(null);
  public currentUser = this.currentUserSignal.asReadonly();
  public isAuthenticated = computed(() => this.currentUserSignal() !== null);

  execute(request: LoginRequest): Observable<AuthResponse> {
    return this.authPort.login(request).pipe(
      tap(response => this.handleSuccess(response))
    );
  }
}
```

**Pattern:**
- Use cases expose readonly signals for reactive state
- Components inject use cases and read signals
- All state mutations go through use case methods
- Use `computed()` for derived state

### Authentication Flow

1. User submits login form in `login` component
2. Component calls `LoginUseCase.execute()`
3. Use case calls `AuthPort.login()` (implemented by `AuthenticationAdapter`)
4. Adapter makes HTTP call to backend: `POST /api/auth/login`
5. Backend returns JWT token + user info
6. Use case stores token in localStorage via `StoragePort`
7. Use case updates `currentUserSignal`
8. Components reactively update via signal subscription
9. Subsequent requests include JWT via `AuthInterceptor`

### Current Features

- User authentication (login, register, logout)
- Protected routes with `authenticationGuard`
- JWT token storage and automatic inclusion in API calls
- Reactive state with signals
- **Battle features**: NOT YET IMPLEMENTED

## Testing Conventions

### Test Structure

- Test files co-located with source files (e.g., `login.spec.ts` next to `login.ts`)
- Use TestBed for dependency injection in tests
- Use Vitest's `vi` for mocking and spies (compatible with Jasmine syntax)

### Example Test Pattern

```typescript
describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let authPort: jasmine.SpyObj<AuthPort>;
  let storagePort: jasmine.SpyObj<StoragePort>;

  beforeEach(() => {
    const authPortSpy = jasmine.createSpyObj('AuthPort', ['login', 'getCurrentUser']);
    const storagePortSpy = jasmine.createSpyObj('StoragePort', ['getItem', 'setItem']);

    TestBed.configureTestingModule({
      providers: [
        LoginUseCase,
        { provide: AuthPort, useValue: authPortSpy },
        { provide: StoragePort, useValue: storagePortSpy }
      ]
    });

    useCase = TestBed.inject(LoginUseCase);
    authPort = TestBed.inject(AuthPort) as jasmine.SpyObj<AuthPort>;
    storagePort = TestBed.inject(StoragePort) as jasmine.SpyObj<StoragePort>;
  });

  it('should authenticate user and update signal', (done) => {
    const response: AuthResponse = {
      token: 'jwt-token',
      userName: 'john',
      email: 'john@example.com'
    };

    authPort.login.and.returnValue(of(response));

    useCase.execute({ userName: 'john', password: 'pass' }).subscribe(() => {
      expect(useCase.currentUser()?.userName).toBe('john');
      expect(useCase.isAuthenticated()).toBe(true);
      done();
    });
  });
});
```

### Running Tests

```bash
npm test                             # Run all tests with Vitest
ng test                              # Alternative command
ng test --coverage                   # Run tests with coverage report
```

## Adding a New Feature

Follow hexagonal architecture pattern:

1. **Define domain models** in `core/domain/models/`
   ```typescript
   export interface Battle {
     id: string;
     userId: string;
     name: string;
     creatures: Creature[];
   }
   ```

2. **Define port interface** in `core/ports/`
   ```typescript
   export abstract class BattlePort {
     abstract createBattle(name: string): Observable<Battle>;
     abstract listBattles(): Observable<Battle[]>;
     abstract getBattle(id: string): Observable<Battle>;
   }
   ```

3. **Create adapter** implementing port in `adapters/api/`
   ```typescript
   @Injectable()
   export class BattleHttpAdapter implements BattlePort {
     constructor(private http: HttpClientPort) {}

     createBattle(name: string): Observable<Battle> {
       return this.http.post<Battle>('/api/battles', { name });
     }
   }
   ```

4. **Create use case** in `core/domain/use-cases/`
   ```typescript
   @Injectable({ providedIn: 'root' })
   export class CreateBattleUseCase {
     private battlesSignal = signal<Battle[]>([]);
     public battles = this.battlesSignal.asReadonly();

     constructor(private battlePort: BattlePort) {}

     execute(name: string): Observable<Battle> {
       return this.battlePort.createBattle(name).pipe(
         tap(battle => {
           this.battlesSignal.update(battles => [...battles, battle]);
         })
       );
     }
   }
   ```

5. **Create component** in `features/battle/`
   ```typescript
   @Component({
     standalone: true,
     selector: 'app-battle-list',
     template: `
       @for (battle of createBattle.battles(); track battle.id) {
         <div>{{ battle.name }}</div>
       }
     `
   })
   export class BattleListComponent {
     constructor(public createBattle: CreateBattleUseCase) {}
   }
   ```

6. **Add route** in `app.routes.ts`
   ```typescript
   export const routes: Routes = [
     {
       path: 'battles',
       component: BattleListComponent,
       canActivate: [authenticationGuard]
     }
   ];
   ```

7. **Register providers** in `app.config.ts` or feature-specific providers file
   ```typescript
   export const battleProviders: Provider[] = [
     { provide: BattlePort, useClass: BattleHttpAdapter }
   ];
   ```

## Component Patterns

### Standalone Components

All components use standalone mode (no NgModules):

```typescript
@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-login',
  templateUrl: './login.html'
})
export class LoginComponent {
  constructor(private loginUseCase: LoginUseCase) {}
}
```

### Reactive Forms

Use reactive forms for user input:

```typescript
export class LoginComponent {
  form = new FormGroup({
    userName: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required])
  });

  onSubmit() {
    if (this.form.valid) {
      this.loginUseCase.execute(this.form.value).subscribe();
    }
  }
}
```

### Signal-Based Templates

Use new Angular control flow syntax:

```typescript
@Component({
  template: `
    @if (loginUseCase.isAuthenticated()) {
      <p>Welcome {{ loginUseCase.currentUser()?.userName }}</p>
    } @else {
      <app-login-form />
    }

    @for (battle of battles(); track battle.id) {
      <app-battle-card [battle]="battle" />
    }
  `
})
```

## HTTP Interceptors

The `AuthInterceptor` automatically adds JWT token to requests:

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(LoginUseCase).getToken();

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req);
};
```

## Route Guards

The `authenticationGuard` protects routes requiring authentication:

```typescript
export const authenticationGuard: CanActivateFn = () => {
  const loginUseCase = inject(LoginUseCase);
  const navigation = inject(NavigationPort);

  if (loginUseCase.isAuthenticated()) {
    return true;
  }

  navigation.navigate(['/login']);
  return false;
};
```

## Migration from Next.js

The Angular frontend will replicate features from the Next.js reference implementation (`/frontend-next-js`):

**Next.js Features to Migrate:**
- Creature management (add, remove, edit HP/initiative/AC)
- Turn-based combat system with round tracking
- Attack dialog with status effects
- Combat log display
- Import/export battle state as JSON

**Migration Strategy:**
- Implement backend API first (event sourcing)
- Create Angular components matching Next.js functionality
- Use signals instead of React state
- Use RxJS instead of React hooks
- Keep same UX/UI patterns

See `/IMPLEMENTATION_PLAN.md` for detailed migration roadmap.

## Current Implementation Status

✅ **Completed:**
- User authentication (login, register, logout)
- Hexagonal architecture setup
- Signal-based state management
- Protected routes with guards
- JWT interceptor

❌ **Not Started:**
- Battle feature module
- Battle list and detail components
- Creature management UI
- Combat controls
- Attack dialog
- Combat log

See `/IMPLEMENTATION_PLAN.md` for full roadmap.
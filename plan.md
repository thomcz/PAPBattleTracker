# Authentication System Implementation Plan

## Overview
Implement a complete login/signup system for Spring Boot backend and Angular frontend with JWT-based authentication.

## Backend (Spring Boot + Kotlin)

### 1. Dependencies & Configuration
- Add Spring Security dependency
- Add JWT library (io.jsonwebtoken:jjwt-api, jjwt-impl, jjwt-jackson)
- Add Spring Data JPA for database
- Add H2 database dependency (for development)
- Configure CORS to allow Angular frontend

### 2. Database Layer
- Create User entity
  - id (Long, primary key, auto-generated)
  - username (String, unique)
  - email (String, unique)
  - password (String, hashed)
  - roles (Set<String> or enum)
  - createdAt, updatedAt timestamps
- Create UserRepository interface (extends JpaRepository)
- Set up database schema (auto-generated with JPA)

### 3. Security Configuration
- Create JWT token utility class
  - generateToken(username) -> String
  - validateToken(token) -> Boolean
  - getUsernameFromToken(token) -> String
  - Token expiration: 24 hours
- Create JWT authentication filter
  - Extract token from Authorization header
  - Validate token
  - Set authentication in SecurityContext
- Configure Spring Security filter chain
  - Disable CSRF (for stateless JWT)
  - Define public endpoints: /api/auth/**, /error
  - Define protected endpoints: /api/** (everything else)
  - Add JWT filter before UsernamePasswordAuthenticationFilter
- Configure password encoder (BCryptPasswordEncoder)

### 4. Authentication Controllers & Services
- Create AuthController with endpoints:
  - POST /api/auth/signup
    - Request: username, email, password
    - Response: success message
  - POST /api/auth/login
    - Request: username/email, password
    - Response: JWT token, username
- Create AuthService for business logic
  - register(signupRequest) -> User
  - authenticate(loginRequest) -> String (JWT token)
- Create UserDetailsService implementation
  - loadUserByUsername(username) -> UserDetails
- Create DTOs:
  - LoginRequest (username/email, password)
  - SignupRequest (username, email, password)
  - AuthResponse (token, username, message)

### 5. Protected Endpoint
- Create DummyController
  - GET /api/dummy
  - Requires valid JWT token
  - Returns: { "message": "Welcome to the protected page!", "user": "username" }

## Frontend (Angular)

### 6. Angular Services
- Create AuthService (src/app/services/auth.service.ts)
  - login(username: string, password: string): Observable<AuthResponse>
  - signup(username: string, email: string, password: string): Observable<any>
  - logout(): void
  - getToken(): string | null
  - isAuthenticated(): boolean
  - getCurrentUser(): string | null
  - Store JWT in localStorage (key: 'auth_token')
  - Store username in localStorage (key: 'current_user')
- Create HTTP Interceptor (AuthInterceptor)
  - Intercept all HTTP requests
  - Add Authorization header: Bearer <token>
  - Handle 401 errors (redirect to login)

### 7. Authentication Components
- Create LoginComponent (src/app/components/login/)
  - Form fields: username/email, password
  - Submit button
  - Link to signup page
  - Display error messages
  - Redirect to /dummy on success
- Create SignupComponent (src/app/components/signup/)
  - Form fields: username, email, password, confirmPassword
  - Form validation:
    - All fields required
    - Valid email format
    - Password minimum length (8 characters)
    - Passwords match
  - Submit button
  - Link to login page
  - Display error messages
  - Redirect to /login on success
- Create DummyPageComponent (src/app/components/dummy/)
  - Protected page
  - Display welcome message from API
  - Display current user
  - Logout button

### 8. Routing & Guards
- Create AuthGuard (src/app/guards/auth.guard.ts)
  - Check if user is authenticated
  - Redirect to /login if not authenticated
- Configure routes in app.routes.ts:
  - / -> redirect to /login (if not authenticated) or /dummy (if authenticated)
  - /login -> LoginComponent (public)
  - /signup -> SignupComponent (public)
  - /dummy -> DummyPageComponent (protected by AuthGuard)

### 9. UI/UX Enhancements
- Create NavigationBarComponent
  - Show app title
  - Show login/signup buttons (when not authenticated)
  - Show username and logout button (when authenticated)
- Add loading indicators during API calls
- Display error messages with styling
- Add success messages (e.g., "Signup successful!")
- Use Angular Material or Bootstrap for styling (optional)

### 10. Testing & Integration
- Test signup flow:
  - Create new user
  - Validate form errors
  - Check successful registration
- Test login flow:
  - Login with valid credentials
  - Test invalid credentials error
  - Verify JWT token stored
- Test protected route access:
  - Access /dummy without token (should redirect to login)
  - Access /dummy with valid token (should display page)
- Test token expiration handling:
  - Mock expired token
  - Verify redirect to login
- Test logout functionality:
  - Clear token and user data
  - Redirect to login
  - Cannot access protected routes

## Implementation Order

1. Backend dependencies and configuration
2. Backend database layer (User entity, repository)
3. Backend JWT utilities and security configuration
4. Backend auth controller and service
5. Backend dummy controller
6. Frontend auth service
7. Frontend components (login, signup, dummy)
8. Frontend routing and guards
9. Frontend interceptor
10. Testing and bug fixes

## Key Technologies

**Backend:**
- Spring Boot 3.5.7
- Spring Security
- JWT (jjwt 0.12.x)
- Spring Data JPA
- H2 Database
- Kotlin 1.9.25

**Frontend:**
- Angular 20.3.0
- RxJS
- Angular Router
- Angular Forms (Reactive Forms)

## Security Considerations

- Passwords hashed with BCrypt (strength 10)
- JWT tokens with expiration (24 hours)
- Stateless authentication (no server-side sessions)
- CORS configured properly
- Input validation on both frontend and backend
- SQL injection prevention (JPA prepared statements)
- XSS protection (Angular sanitization)

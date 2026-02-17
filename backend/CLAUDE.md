# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Backend Overview

Spring Boot + Kotlin backend with hexagonal architecture and JWT authentication. Currently implements user authentication; battle tracker features planned using event sourcing.

## Development Commands

```bash
# Build and run
./gradlew bootRun                    # Start backend server at http://localhost:8080
./gradlew build                      # Build JAR and run all tests
./gradlew clean build                # Clean build from scratch

# Testing
./gradlew test                       # Run all tests
./gradlew test --tests ClassName     # Run specific test class
./gradlew test --tests 'ClassName.testMethod'  # Run specific test method

# Other tasks
./gradlew bootJar                    # Build executable JAR
./gradlew check                      # Run all verification tasks
```

## Definition of Done: Tests Are Required

**CRITICAL**: A feature is NOT considered complete without comprehensive tests.

### Test Requirements for Feature Completion
- ✅ **Unit tests** for all domain logic (use cases, aggregates, domain services)
- ✅ **Integration tests** for all REST endpoints (`@WebMvcTest` or `@SpringBootTest`)
- ✅ **Repository tests** for all database operations
- ✅ **Service layer tests** with mocked dependencies
- ✅ **Minimum 80% code coverage** for new features
- ✅ All tests must pass: `./gradlew test`

### Test File Organization
- Test files mirror source structure in `src/test/kotlin/`
- Use descriptive test names: `shouldAddCreatureWhenValidRequest()`
- Group related tests in nested describe blocks

### Test Categories
1. **Unit Tests**: Test single classes in isolation (use MockK)
2. **Integration Tests**: Test API endpoints with Spring context
3. **Repository Tests**: Test JPA repositories with `@DataJpaTest`

### Example Test Patterns
See existing tests for patterns:
- Domain tests: `domain/BattleTest.kt`
- Service tests: `application/services/BattleServiceTest.kt`
- Controller tests: `infrastructure/rest/BattleControllerTest.kt`
- Repository tests: `infrastructure/persistence/JpaBattleRepositoryTest.kt`

**When implementing a new feature:**
1. Write tests alongside implementation (TDD approach recommended)
2. Follow existing test patterns (JUnit 5 + MockK + Spring Test)
3. Verify all tests pass with `./gradlew test`
4. Check coverage with `./gradlew jacocoTestReport`
5. Only mark feature as complete when all tests are green ✅

## Architecture

### Hexagonal (Ports and Adapters) Structure

```
domain/              # Core business logic (entities, use cases, ports)
├── model/          # Domain entities (User, Battle, Creature)
├── port/in/        # Input ports (use case interfaces)
└── port/out/       # Output ports (repository, external service interfaces)

application/         # Use case implementations
├── service/        # Business logic services implementing input ports
└── dto/            # Command/query objects

infrastructure/      # External adapters
├── adapter/in/     # Inbound adapters (REST controllers, security)
└── adapter/out/    # Outbound adapters (JPA repositories, JWT provider)
```

**Key Principle**: Dependencies flow inward. Domain layer has NO dependencies on infrastructure. Application layer depends only on domain. Infrastructure depends on application and domain.

### Technology Stack

- **Framework**: Spring Boot 3.5.7
- **Language**: Kotlin 1.9.25 (JVM target: Java 21)
- **Security**: Spring Security with JWT (jjwt 0.12.3)
- **Database**: Spring Data JPA + H2 (in-memory)
- **Testing**: JUnit 5 + Mockito-Kotlin

### Authentication Flow

1. User registers: `POST /api/auth/register` → password hashed with BCrypt → stored in H2
2. User logs in: `POST /api/auth/login` → validates credentials → returns JWT token
3. JWT token required for all endpoints except `/api/auth/**`
4. `JwtAuthenticationFilter` intercepts requests, validates token, sets security context

**Current Endpoints:**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and receive JWT token
- `GET /api/hello` - Protected dummy endpoint (requires JWT)

### Current Domain Model

**User** (`domain/model/User.kt`)
- Properties: `id`, `userName`, `email`, `passwordHash`
- Methods: `authenticate()`, `register()` (factory method)
- Password validation logic encapsulated in domain model

**Battle features**: Not yet implemented (see `IMPLEMENTATION_PLAN.md`)

### Database Configuration

- **H2 in-memory database** (configured in application.properties)
- Data resets on server restart (development mode)
- H2 console accessible at `/h2-console` (disable in production)
- Migration to PostgreSQL planned for production

## Testing Conventions

### Test Structure

- Test files in `src/test/kotlin/` mirror `src/main/kotlin/` structure
- Use `@SpringBootTest` for integration tests
- Use Mockito-Kotlin for mocking dependencies
- Follow given-when-then structure

### Example Test Pattern

```kotlin
@ExtendWith(MockitoExtension::class)
class RegisterUserUseCaseTest {
    @Mock
    private lateinit var userRepository: UserRepository

    @Mock
    private lateinit var passwordEncoder: PasswordEncoder

    @InjectMocks
    private lateinit var registerUserService: RegisterUserService

    @Test
    fun `should register new user successfully`() {
        // given
        val command = RegisterUserCommand(...)

        // when
        val result = registerUserService.execute(command)

        // then
        assertThat(result).isNotNull()
        verify(userRepository).save(any())
    }
}
```

### Running Tests

```bash
# Run all tests
./gradlew test

# Run specific test class
./gradlew test --tests RegisterUserUseCaseTest

# Run specific test method
./gradlew test --tests 'RegisterUserUseCaseTest.should register new user successfully'
```

## Adding a New Use Case

Follow hexagonal architecture pattern:

1. **Define input port** in `domain/port/in/`
   ```kotlin
   interface CreateBattleUseCase {
       fun execute(command: CreateBattleCommand): Battle
   }
   ```

2. **Create domain model** in `domain/model/` if needed
   ```kotlin
   data class Battle(val id: Long, val userId: Long, val name: String)
   ```

3. **Define output port** in `domain/port/out/` for external dependencies
   ```kotlin
   interface BattleRepository {
       fun save(battle: Battle): Battle
   }
   ```

4. **Implement use case** in `application/service/`
   ```kotlin
   @Service
   class CreateBattleService(
       private val battleRepository: BattleRepository
   ) : CreateBattleUseCase {
       override fun execute(command: CreateBattleCommand): Battle {
           // Business logic here
       }
   }
   ```

5. **Create REST controller** in `infrastructure/adapter/in/rest/`
   ```kotlin
   @RestController
   @RequestMapping("/api/battles")
   class BattleController(
       private val createBattle: CreateBattleUseCase
   ) {
       @PostMapping
       fun create(@RequestBody request: CreateBattleRequest): BattleResponse {
           // Map request → command → execute → map to response
       }
   }
   ```

6. **Create repository adapter** in `infrastructure/adapter/out/persistence/`
   ```kotlin
   @Repository
   class BattleRepositoryAdapter(
       private val jpaRepository: JpaBattleRepository
   ) : BattleRepository {
       override fun save(battle: Battle): Battle {
           // Map domain → JPA entity → save → map back
       }
   }
   ```

7. **Wire dependencies** via Spring DI (constructor injection)

## Event Sourcing Architecture (Planned)

Battle state will be persisted using event sourcing:

### Key Concepts

1. **Events**: Immutable records of state changes
   ```kotlin
   sealed class BattleEvent {
       data class BattleCreated(val id: Long, val userId: Long) : BattleEvent()
       data class CreatureAdded(val battleId: Long, val creature: Creature) : BattleEvent()
       data class DamageTaken(val battleId: Long, val targetId: String, val amount: Int) : BattleEvent()
   }
   ```

2. **Aggregate**: `Battle` entity stores events in chronological order

3. **State Reconstruction**: `BattleState` rebuilt by replaying all events
   ```kotlin
   class BattleState {
       fun apply(event: BattleEvent): BattleState {
           return when(event) {
               is BattleCreated -> // update state
               is CreatureAdded -> // update state
               // etc.
           }
       }
   }
   ```

4. **Persistence**: Events stored as JSON in H2 via `BattleEventJpaEntity`

### Benefits

- Full audit trail of all battle actions
- Ability to replay and debug combat
- Support for undo/redo functionality
- Complete battle history for analysis

See `/IMPLEMENTATION_PLAN.md` for detailed event sourcing implementation steps.

## Security Notes

- All passwords hashed with BCrypt before storage
- JWT tokens expire (check `JwtTokenProvider` for expiration time)
- CSRF and CORS disabled in `SecurityConfig` (enable for production)
- Session management: STATELESS (no server-side sessions)
- Security filter chain in `infrastructure/adapter/in/security/SecurityConfig.kt`

## Current Implementation Status

✅ **Completed:**
- User authentication (register, login)
- JWT token generation and validation
- Hexagonal architecture setup
- H2 database integration
- Basic security configuration

❌ **Not Started:**
- Battle domain model
- Event sourcing infrastructure
- Battle API endpoints
- Combat system
- Creature management

See `/IMPLEMENTATION_PLAN.md` for full roadmap.
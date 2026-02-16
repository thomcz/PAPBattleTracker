# Quickstart: Battle Tracker Core Features

**Created**: 2026-02-11
**Purpose**: Developer onboarding guide for implementing battle tracker with event sourcing

## Prerequisites

- JDK 21 installed
- Node.js 20+ installed
- Git configured
- IDE with Kotlin and TypeScript support

## Backend Setup (Kotlin + Spring Boot)

### 1. Project Structure

```bash
cd backend/
./gradlew build  # Verify existing setup works
```

### 2. Key Dependencies (Already in build.gradle.kts)

```kotlin
dependencies {
    // Existing
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("com.h2database:h2")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")

    // Testing
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.mockito.kotlin:mockito-kotlin:5.1.0")
}
```

### 3. Directory Layout

```
backend/src/main/kotlin/de/thomcz/pap/battle/backend/
├── domain/model/events/          # Start here: Define event types
├── domain/model/Battle.kt          # Aggregate root
├── domain/port/in/                # Use case interfaces
├── domain/port/out/EventStore.kt  # Event persistence port
├── application/service/           # Use case implementations
└── infrastructure/adapter/out/    # JPA repositories, event store
```

### 4. First Implementation Step: Events

Create event types in `domain/model/events/`:

```kotlin
// BattleEvent.kt
sealed interface BattleEvent {
    val battleId: UUID
    val eventId: UUID
    val timestamp: Instant
    val userId: UUID
}

// BattleCreated.kt
data class BattleCreated(
    override val battleId: UUID,
    override val eventId: UUID,
    override val timestamp: Instant,
    override val userId: UUID,
    val name: String
) : BattleEvent
```

### 5. Testing Strategy

**Write integration tests FIRST** (TDD):

```kotlin
@SpringBootTest(webEnvironment = RANDOM_PORT)
@AutoConfigureTestDatabase(replace = REPLACE.ANY)
class BattleIntegrationTest {

    @Autowired
    lateinit var restTemplate: TestRestTemplate

    @Test
    fun `should create battle and persist events`() {
        // Given: Authenticated user
        val token = authenticateUser("testuser")

        // When: POST /api/battles
        val request = CreateBattleCommand(name = "Test Battle")
        val response = restTemplate.exchange(
            "/api/battles",
            POST,
            HttpEntity(request, headers(token)),
            BattleResponse::class.java
        )

        // Then: Battle created with BattleCreated event
        assertThat(response.statusCode).isEqualTo(CREATED)
        // Verify event persisted in H2
    }
}
```

### 6. Running Backend Tests

```bash
cd backend/
./gradlew test                    # Run all tests
./gradlew test --tests "*Battle*" # Run battle tests only
./gradlew bootRun                  # Start server
```

### 7. Event Store Implementation

Create `H2EventStore.kt` in `infrastructure/adapter/out/persistence/`:

```kotlin
@Repository
class H2EventStore(
    private val eventEntityRepository: EventEntityRepository,
    private val objectMapper: ObjectMapper
) : EventStore {

    override fun saveEvents(battleId: UUID, events: List<BattleEvent>) {
        events.forEachIndexed { index, event ->
            val entity = EventEntity(
                eventId = event.eventId,
                battleId = battleId,
                eventType = event::class.simpleName!!,
                eventData = objectMapper.writeValueAsString(event),
                sequenceNumber = index + 1,
                timestamp = event.timestamp,
                userId = event.userId
            )
            eventEntityRepository.save(entity)
        }
    }

    override fun getEvents(battleId: UUID): List<BattleEvent> {
        return eventEntityRepository
            .findByBattleIdOrderBySequenceNumber(battleId)
            .map { deserializeEvent(it.eventType, it.eventData) }
    }

    private fun deserializeEvent(type: String, data: String): BattleEvent {
        val clazz = Class.forName("de.thomcz.pap.battle.backend.domain.model.events.$type")
        return objectMapper.readValue(data, clazz) as BattleEvent
    }
}
```

---

## Frontend Setup (Angular 18)

### 1. Project Structure

```bash
cd frontend-angular/
npm install
npm start  # Verify at http://localhost:4200
```

### 2. Key Dependencies

```json
{
  "dependencies": {
    "@angular/core": "^18.0.0",
    "@angular/common": "^18.0.0",
    "@angular/material": "^18.0.0",
    "rxjs": "^7.8.0"
  },
  "devDependencies": {
    "@testing-library/angular": "^16.0.0",
    "@testing-library/user-event": "^14.5.0",
    "vitest": "^1.0.0"
  }
}
```

### 3. Directory Layout

```
frontend-angular/src/app/
├── core/domain/models/            # Start here: TypeScript types
├── core/ports/                    # Port interfaces
├── adapters/api/                  # HTTP adapters
├── features/battle/pages/         # Battle list, detail pages
└── features/battle/components/    # Creature card, combat controls
```

### 4. First Implementation Step: Models

Create models in `core/domain/models/`:

```typescript
// battle.model.ts
export interface Battle {
  id: string;
  name: string;
  status: CombatStatus;
  creatures: Creature[];
  currentTurn: number;
  round: number;
  combatLog: LogEntry[];
  createdAt: string;
  lastModified: string;
}

export enum CombatStatus {
  NOT_STARTED = 'NOT_STARTED',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ENDED = 'ENDED'
}
```

### 5. Testing with Angular Testing Library

**Write user-simulation tests FIRST**:

```typescript
import { render, screen } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';

describe('CreatureCardComponent', () => {
  it('should add creature when form submitted', async () => {
    // Setup
    const { user } = await render(CreatureCardComponent);

    // When: User fills form
    await user.type(screen.getByLabelText(/name/i), 'Goblin');
    await user.type(screen.getByLabelText(/hp/i), '10');
    await user.click(screen.getByRole('button', { name: /add/i }));

    // Then: Creature appears
    expect(screen.getByText('Goblin')).toBeInTheDocument();
  });
});
```

### 6. Signals for State Management

```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-battle-detail',
  template: `
    <div>
      <h2>{{ battle().name }}</h2>
      <div>Round: {{ battle().round }}</div>
      <div>Status: {{ battle().status }}</div>
      <button (click)="advanceTurn()" [disabled]="!canAdvanceTurn()">
        Next Turn
      </button>
    </div>
  `
})
export class BattleDetailComponent {
  // Signal: reactive state
  battle = signal<Battle>({
    id: '123',
    name: 'Dragon Fight',
    status: CombatStatus.ACTIVE,
    creatures: [],
    currentTurn: 0,
    round: 1,
    combatLog: [],
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  });

  // Computed: derived state
  canAdvanceTurn = computed(() =>
    this.battle().status === CombatStatus.ACTIVE &&
    this.battle().creatures.length > 0
  );

  advanceTurn() {
    this.battle.update(b => ({
      ...b,
      currentTurn: (b.currentTurn + 1) % b.creatures.length
    }));
  }
}
```

### 7. Running Frontend Tests

```bash
cd frontend-angular/
npm test                   # Run Vitest tests
npm run lint               # Check code quality
npm start                  # Start dev server
```

---

## Development Workflow

### 1. TDD Cycle

```bash
# Backend
1. Write integration test (RED)
2. Implement minimum code (GREEN)
3. Refactor (keep tests green)

# Frontend
1. Write Angular Testing Library test (RED)
2. Implement component (GREEN)
3. Refactor (keep tests green)
```

### 2. Running Full Stack

Terminal 1:
```bash
cd backend/
./gradlew bootRun  # Backend at :8080
```

Terminal 2:
```bash
cd frontend-angular/
npm start  # Frontend at :4200
```

Terminal 3:
```bash
# Run tests in watch mode
cd backend/ && ./gradlew test --continuous
cd frontend-angular/ && npm test
```

### 3. Creating New Use Case (Example: AddCreatureUseCase)

**Step 1**: Write integration test (backend)
```kotlin
@Test
fun `should add creature to battle`() {
    val battleId = createBattle("Test Battle")

    val request = AddCreatureCommand(
        name = "Goblin",
        type = CreatureType.MONSTER,
        maxHP = 10,
        currentHP = 10,
        initiative = 15,
        armorClass = 12
    )

    val response = post("/api/battles/$battleId/creatures", request)

    assertThat(response.statusCode).isEqualTo(CREATED)
    // Verify CreatureAdded event persisted
}
```

**Step 2**: Define port interface (domain/port/in/)
```kotlin
interface AddCreatureUseCase {
    fun addCreature(battleId: UUID, command: AddCreatureCommand): UUID
}
```

**Step 3**: Implement use case (application/service/)
```kotlin
@Service
class CreatureService(
    private val battleRepository: BattleRepository,
    private val eventStore: EventStore
) : AddCreatureUseCase {

    override fun addCreature(battleId: UUID, command: AddCreatureCommand): UUID {
        val battle = battleRepository.findById(battleId)
        val creatureId = battle.addCreature(command)
        eventStore.saveEvents(battleId, battle.getUncommittedEvents())
        return creatureId
    }
}
```

**Step 4**: Create REST controller (infrastructure/adapter/in/rest/)
```kotlin
@RestController
@RequestMapping("/api/battles/{battleId}/creatures")
class CreatureController(
    private val addCreatureUseCase: AddCreatureUseCase
) {

    @PostMapping
    fun addCreature(
        @PathVariable battleId: UUID,
        @RequestBody command: AddCreatureCommand
    ): ResponseEntity<CreatureResponse> {
        val creatureId = addCreatureUseCase.addCreature(battleId, command)
        return ResponseEntity.status(CREATED).body(...)
    }
}
```

**Step 5**: Frontend component test (Angular Testing Library)
```typescript
it('should call API when adding creature', async () => {
  const { user } = await render(CreatureFormComponent, {
    componentProperties: { battleId: 'test-123' }
  });

  await user.type(screen.getByLabelText(/name/i), 'Goblin');
  await user.click(screen.getByRole('button', { name: /add/i }));

  // Verify API called with correct payload
  expect(mockHttpClient.post).toHaveBeenCalledWith(
    '/api/battles/test-123/creatures',
    { name: 'Goblin', ... }
  );
});
```

---

## Common Pitfalls

### Backend
❌ **DON'T**: Mock the event store or repositories in integration tests
✅ **DO**: Use real H2 database and Spring Boot Test

❌ **DON'T**: Store battle state directly in database
✅ **DO**: Store events, reconstruct state from event replay

❌ **DON'T**: Modify events after creation
✅ **DO**: Treat events as immutable

### Frontend
❌ **DON'T**: Test implementation details (component.property)
✅ **DO**: Test user behavior (user.click, screen.getByRole)

❌ **DON'T**: Use observables for everything
✅ **DO**: Use signals for local state, observables for async

❌ **DON'T**: Access DOM with querySelector
✅ **DO**: Use Testing Library queries (getByRole, getByLabelText)

---

## Next Steps

1. Review constitution compliance checklist in `plan.md`
2. Implement Phase 1 (P1 user stories): Battle Session Management + Creature Management
3. Write integration tests for each endpoint
4. Implement event sourcing for Battle aggregate
5. Create Angular components with Testing Library tests
6. Run performance tests to verify <300ms p95 target

**Questions?** See `data-model.md` for entity details or `research.md` for architectural decisions.

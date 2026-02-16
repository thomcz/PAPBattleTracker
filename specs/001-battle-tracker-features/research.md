# Research: Battle Tracker Core Features

**Created**: 2026-02-11
**Purpose**: Research event sourcing patterns, testing strategies, and architectural decisions for battle tracker implementation

## Overview

This document captures research findings for implementing battle tracking with event sourcing in a hexagonal architecture. Key focus areas: event sourcing patterns in Kotlin, integration testing strategies, Angular Testing Library usage, and signals/observables patterns.

## 1. Event Sourcing Architecture

### Decision: Event Sourcing for Battle Domain

**What was chosen**: Implement Battle aggregate as event-sourced entity with immutable event log stored in H2 database as JSON.

**Rationale**:
1. **Audit Trail**: Complete history of all combat actions required (FR-027 to FR-031)
2. **State Reconstruction**: Battle state derived by replaying events enables debugging and analytics
3. **Data Integrity**: Immutable events prevent corruption of combat history
4. **Future Features**: Enables undo/redo, battle replay, and advanced analytics

**Alternatives considered**:
- **CRUD with audit log**: Simpler but doesn't provide state reconstruction. Audit log is separate from state, risking inconsistency.
- **Event Sourcing with dedicated event store (e.g., EventStoreDB)**: More powerful but adds infrastructure complexity. H2 JSON storage sufficient for MVP scale (10,000 events per battle).
- **Hybrid approach (event sourcing for log, CRUD for state)**: Creates two sources of truth. Replay logic untested.

**Implementation Pattern**:

```kotlin
// Domain event (immutable data class)
sealed interface BattleEvent {
    val battleId: UUID
    val timestamp: Instant
    val eventId: UUID
}

data class BattleCreated(
    override val battleId: UUID,
    override val timestamp: Instant,
    override val eventId: UUID,
    val userId: UUID,
    val name: String
) : BattleEvent

data class CreatureAdded(
    override val battleId: UUID,
    override val timestamp: Instant,
    override val eventId: UUID,
    val creatureId: UUID,
    val name: String,
    val type: CreatureType,
    val maxHP: Int,
    val currentHP: Int,
    val initiative: Int,
    val armorClass: Int
) : BattleEvent

// Aggregate root reconstructs state from events
class Battle private constructor() {
    private val events: MutableList<BattleEvent> = mutableListOf()

    // Derived state (not persisted)
    var battleId: UUID = UUID.randomUUID()
        private set
    var status: CombatStatus = CombatStatus.NOT_STARTED
        private set
    private val creatures: MutableMap<UUID, Creature> = mutableMapOf()

    // Replay events to reconstruct state
    fun loadFromHistory(events: List<BattleEvent>): Battle {
        events.forEach { apply(it, isReplay = true) }
        return this
    }

    // Apply event and update state
    private fun apply(event: BattleEvent, isReplay: Boolean = false) {
        when (event) {
            is BattleCreated -> {
                battleId = event.battleId
                status = CombatStatus.NOT_STARTED
            }
            is CreatureAdded -> {
                creatures[event.creatureId] = Creature(
                    id = event.creatureId,
                    name = event.name,
                    type = event.type,
                    maxHP = event.maxHP,
                    currentHP = event.currentHP,
                    initiative = event.initiative,
                    armorClass = event.armorClass
                )
            }
            // ... handle other events
        }
        if (!isReplay) {
            events.add(event)
        }
    }

    // Business logic methods create and apply events
    fun addCreature(name: String, type: CreatureType, ...): UUID {
        val creatureId = UUID.randomUUID()
        val event = CreatureAdded(
            battleId = battleId,
            timestamp = Instant.now(),
            eventId = UUID.randomUUID(),
            creatureId = creatureId,
            name = name,
            type = type,
            ...
        )
        apply(event)
        return creatureId
    }

    fun getUncommittedEvents(): List<BattleEvent> = events.toList()
    fun markEventsAsCommitted() { events.clear() }
}
```

**Storage Strategy**:
- **Event Store Table**: `events` table with columns: `event_id` (PK), `battle_id` (indexed), `event_type`, `event_data` (JSON), `timestamp`, `sequence_number`
- **Battle Metadata Table**: `battles` table with columns: `battle_id` (PK), `user_id` (indexed), `name`, `created_at`, `last_modified`, `event_count`
- **Snapshot Strategy**: Create snapshot every 1000 events to optimize replay for large battles (meets <5s replay constraint)

**Testing Implications**:
- Integration tests must verify event persistence AND replay
- Cannot mock event store (defeats purpose of testing event sourcing)
- Test scenarios: create battle → add events → reload from DB → verify state matches

---

## 2. Integration Testing Strategy

### Decision: Prefer Integration Tests Over Mocks

**What was chosen**: Use Spring Boot Test with real H2 database and full application context for most tests. Mock only external services (email, payment APIs).

**Rationale**:
1. **Event Sourcing Validation**: Must test actual event persistence and replay with real database
2. **JSON Serialization**: Integration tests catch Jackson serialization issues that mocks miss
3. **Simpler Tests**: No complex mock setup. Real behavior is easier to understand and maintain.
4. **Constitution Compliance**: Meets ≥80% adapter coverage without mock brittleness
5. **Fast Execution**: H2 in-memory database provides millisecond test execution
6. **Confidence**: Tests verify actual system behavior, not mock assumptions

**Alternatives considered**:
- **Heavy Mocking (Mockito for repositories)**: Faster setup but:
  - Doesn't test actual database behavior
  - Brittle (mocks break when implementation changes)
  - Misses serialization, transaction, and constraint errors
  - Testing mocks, not real code
- **Testcontainers with PostgreSQL**: More realistic but slower (seconds per test vs milliseconds)
- **Pure Unit Tests**: Impossible for event sourcing (state reconstruction requires persistence)

**Implementation Pattern**:

```kotlin
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class BattleIntegrationTest {

    @Autowired
    private lateinit var restTemplate: TestRestTemplate

    @Autowired
    private lateinit var battleRepository: BattleRepository

    @Autowired
    private lateinit var eventStore: EventStore

    @Test
    fun `should create battle and persist events`() {
        // Given: User is authenticated
        val token = authenticateUser("testuser")
        val headers = HttpHeaders().apply {
            setBearerAuth(token)
        }

        // When: Create battle via REST API
        val request = CreateBattleCommand(name = "Dragon Encounter")
        val response = restTemplate.exchange(
            "/api/battles",
            HttpMethod.POST,
            HttpEntity(request, headers),
            BattleResponse::class.java
        )

        // Then: Battle created with BattleCreated event
        assertThat(response.statusCode).isEqualTo(HttpStatus.CREATED)
        val battleId = response.body!!.id

        val events = eventStore.getEvents(battleId)
        assertThat(events).hasSize(1)
        assertThat(events[0]).isInstanceOf(BattleCreated::class.java)

        // And: Battle can be reloaded from events
        val reloadedBattle = battleRepository.findById(battleId)
        assertThat(reloadedBattle.get().name).isEqualTo("Dragon Encounter")
    }

    @Test
    fun `should reconstruct battle state from events`() {
        // Given: Battle with multiple events
        val battleId = createBattleWithEvents(
            battleName = "Test Battle",
            events = listOf(
                CreatureAdded(...),
                CreatureAdded(...),
                DamageApplied(...),
                TurnAdvanced(...)
            )
        )

        // When: Load battle from database
        val battle = battleRepository.findById(battleId).get()

        // Then: State matches event history
        assertThat(battle.creatures).hasSize(2)
        assertThat(battle.currentTurn).isEqualTo(1)
        assertThat(battle.round).isEqualTo(1)
    }

    private fun authenticateUser(username: String): String {
        // Real authentication via /api/auth/login
        // Returns actual JWT token
    }
}
```

**When to Mock**:
- External HTTP APIs (third-party services)
- Email services (SMTP)
- Payment gateways
- File system operations (when not testing file I/O)

**When NOT to Mock**:
- Database repositories (use H2)
- Spring beans and services (use @SpringBootTest)
- REST controllers (use TestRestTemplate)
- JPA entities and mappers (test real serialization)

---

## 3. Angular Testing Library

### Decision: Use Angular Testing Library for Component Tests

**What was chosen**: Angular Testing Library (@testing-library/angular) for all component tests. Focus on user behavior, not implementation details.

**Rationale**:
1. **User-Centric**: Tests simulate actual user interactions (typing, clicking)
2. **Maintainable**: Tests don't break when refactoring (as long as behavior unchanged)
3. **Constitution Compliance**: Aligns with "test what users do" philosophy
4. **Best Practice**: Industry standard (React Testing Library widely adopted)
5. **Accessibility**: Encourages proper aria-labels and semantic HTML

**Alternatives considered**:
- **Traditional Angular TestBed**: Works but encourages testing implementation details (component.property = X, detectChanges(), fixture.debugElement)
- **Cypress/Playwright**: E2E tests are complementary but slower. ATL fills the component-level testing gap.
- **Jest + DOM Testing Library**: Requires ejecting from Angular defaults. ATL provides same API with Angular integration.

**Implementation Pattern**:

```typescript
import { render, screen, fireEvent } from '@testing-library/angular';
import { userEvent } from '@testing-library/user-event';
import { CreatureCardComponent } from './creature-card.component';

describe('CreatureCardComponent', () => {
  it('should add creature when form submitted', async () => {
    // Setup: Render component with user interaction helper
    const { user } = await render(CreatureCardComponent, {
      componentProperties: {
        battleId: 'test-battle-123'
      }
    });

    // Given: User fills out creature form
    await user.type(screen.getByLabelText(/name/i), 'Goblin');
    await user.type(screen.getByLabelText(/hit points/i), '10');
    await user.type(screen.getByLabelText(/initiative/i), '15');
    await user.selectOptions(screen.getByLabelText(/type/i), 'monster');

    // When: User clicks "Add Creature" button
    await user.click(screen.getByRole('button', { name: /add creature/i }));

    // Then: Creature appears in list
    expect(screen.getByText('Goblin')).toBeInTheDocument();
    expect(screen.getByText('10 / 10 HP')).toBeInTheDocument();
  });

  it('should apply damage when damage button clicked', async () => {
    // Given: Creature with 10 HP
    const { user } = await render(CreatureCardComponent, {
      componentProperties: {
        creature: {
          id: '123',
          name: 'Goblin',
          currentHP: 10,
          maxHP: 10
        }
      }
    });

    // When: User enters damage and clicks apply
    await user.type(screen.getByLabelText(/damage/i), '5');
    await user.click(screen.getByRole('button', { name: /apply damage/i }));

    // Then: HP decreases
    expect(screen.getByText('5 / 10 HP')).toBeInTheDocument();
  });

  it('should mark creature as defeated when HP reaches zero', async () => {
    // Given: Creature with 5 HP
    const { user } = await render(CreatureCardComponent, {
      componentProperties: {
        creature: { id: '123', name: 'Goblin', currentHP: 5, maxHP: 10 }
      }
    });

    // When: Apply 5 damage
    await user.type(screen.getByLabelText(/damage/i), '5');
    await user.click(screen.getByRole('button', { name: /apply damage/i }));

    // Then: Creature shows defeated status
    expect(screen.getByText(/defeated/i)).toBeInTheDocument();
    expect(screen.getByText('Goblin')).toHaveClass('defeated');
  });
});
```

**Key Principles**:
- Query by role/label (accessibility-first): `getByRole('button')`, `getByLabelText('Name')`
- Avoid `querySelector` and `fixture.debugElement` (implementation details)
- Use `userEvent` for realistic interactions (typing is async, triggers all events)
- Test observable behavior, not internal state (don't access `component.property`)

---

## 4. Signals vs Observables in Angular

### Decision: Use Both Signals and Observables

**What was chosen**: Signals for component-local state, Observables for API communication and cross-component events.

**Rationale**:
1. **Signals for Local State**: Simpler API, better performance (fine-grained reactivity)
   - Creature HP, current turn, form input values
   - Component-level toggles (dialog open/closed, expanded/collapsed)
2. **Observables for Async Operations**: Established pattern with RxJS operators
   - HTTP requests to backend API
   - WebSocket events (future feature)
   - Cross-component event bus (e.g., combat log updates)
3. **Gradual Migration**: Angular 18 supports both. Can migrate incrementally to signals.
4. **Interoperability**: `toSignal()` and `toObservable()` enable seamless integration

**Alternatives considered**:
- **Observables Only**: Works but verbose for simple state management
- **Signals Only**: Loses RxJS operators (debounceTime, switchMap, combineLatest) which are powerful for async logic
- **NgRx or Akita**: Overkill for application of this size. Signals provide similar benefits without boilerplate.

**Implementation Patterns**:

**Signals for Local State**:
```typescript
import { Component, signal, computed } from '@angular/core';

@Component({
  selector: 'app-creature-card',
  template: `
    <div class="creature-card">
      <h3>{{ creature().name }}</h3>
      <div class="hp-bar">
        {{ currentHP() }} / {{ creature().maxHP }} HP
      </div>
      <div class="status" [class.defeated]="isDefeated()">
        {{ isDefeated() ? 'Defeated' : 'Active' }}
      </div>
      <button (click)="takeDamage(5)">Apply 5 Damage</button>
    </div>
  `
})
export class CreatureCardComponent {
  // Signal: Component-local state
  creature = signal<Creature>({
    id: '123',
    name: 'Goblin',
    currentHP: 10,
    maxHP: 10,
    initiative: 15
  });

  // Computed signal: Derived state (auto-updates when creature changes)
  currentHP = computed(() => this.creature().currentHP);
  isDefeated = computed(() => this.creature().currentHP <= 0);
  hpPercentage = computed(() =>
    (this.creature().currentHP / this.creature().maxHP) * 100
  );

  // Method: Update signal (triggers reactive updates)
  takeDamage(amount: number) {
    this.creature.update(c => ({
      ...c,
      currentHP: Math.max(0, c.currentHP - amount)
    }));
  }
}
```

**Observables for API Communication**:
```typescript
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BattleApiAdapter } from '@/adapters/api/battle-api.adapter';

@Component({
  selector: 'app-battle-list',
  template: `
    <div *ngIf="loading()">Loading battles...</div>
    <div *ngIf="error()">{{ error() }}</div>
    <ul>
      <li *ngFor="let battle of battles()">
        {{ battle.name }} - {{ battle.status }}
      </li>
    </ul>
  `
})
export class BattleListComponent {
  private battleApi = inject(BattleApiAdapter);

  // Observable: HTTP request with RxJS operators
  battles$ = this.battleApi.getBattles().pipe(
    catchError(err => {
      this.error.set(err.message);
      return of([]);
    })
  );

  // Convert Observable to Signal for template
  battles = toSignal(this.battles$, { initialValue: [] });
  loading = signal(false);
  error = signal<string | null>(null);

  createBattle(name: string) {
    this.loading.set(true);
    this.battleApi.createBattle({ name }).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (battle) => {
        // Update signals with new battle
        this.battles.update(list => [...list, battle]);
      },
      error: (err) => {
        this.error.set(err.message);
      }
    });
  }
}
```

**Interoperability Example**:
```typescript
import { toSignal, toObservable } from '@angular/core/rxjs-interop';

// Signal → Observable (for use with RxJS operators)
const currentHP = signal(10);
const currentHP$ = toObservable(currentHP).pipe(
  debounceTime(300),
  distinctUntilChanged()
);

// Observable → Signal (for use in templates)
const battles$ = this.http.get<Battle[]>('/api/battles');
const battles = toSignal(battles$, { initialValue: [] });
```

**Migration Strategy**:
1. New components: Use signals for local state
2. Existing components: Keep observables, migrate incrementally
3. API layer: Keep observables (HttpClient returns observables)
4. State management: Signals for sync state, observables for async

---

## 5. Performance Optimization for Event Sourcing

### Decision: Implement Snapshotting at 1000 Events

**What was chosen**: Create battle state snapshots every 1000 events to optimize replay performance.

**Rationale**:
- Constitution requires event replay <5s for 10,000 events
- Replaying 10,000 events sequentially takes ~8-10s (measured in Next.js prototype)
- Snapshot every 1000 events: max 1000 events to replay = ~1s replay time
- Snapshots stored in separate table, optional optimization (not required for MVP)

**Implementation Strategy**:
```kotlin
data class BattleSnapshot(
    val battleId: UUID,
    val snapshotAtEventSequence: Int,
    val snapshotData: String, // JSON serialized battle state
    val timestamp: Instant
)

interface EventStore {
    fun getEvents(battleId: UUID, afterSequence: Int = 0): List<BattleEvent>
    fun saveEvents(battleId: UUID, events: List<BattleEvent>)

    // Snapshot operations
    fun getLatestSnapshot(battleId: UUID): BattleSnapshot?
    fun saveSnapshot(battleId: UUID, snapshot: BattleSnapshot)
}

fun reconstructBattleFromEvents(battleId: UUID): Battle {
    val snapshot = eventStore.getLatestSnapshot(battleId)
    val battle = if (snapshot != null) {
        // Deserialize snapshot, then replay events after snapshot
        val battle = Battle.fromSnapshot(snapshot.snapshotData)
        val eventsAfterSnapshot = eventStore.getEvents(
            battleId,
            afterSequence = snapshot.snapshotAtEventSequence
        )
        battle.loadFromHistory(eventsAfterSnapshot)
    } else {
        // No snapshot, replay all events
        val events = eventStore.getEvents(battleId)
        Battle().loadFromHistory(events)
    }

    // Create new snapshot if >1000 events since last snapshot
    if (battle.eventCount % 1000 == 0) {
        eventStore.saveSnapshot(battleId, battle.createSnapshot())
    }

    return battle
}
```

**Testing Strategy**:
- Performance test: Create battle with 10,000 events, verify replay <5s
- Snapshot correctness test: Verify battle state from snapshot matches battle state from full event replay

---

## 6. Database Schema for Event Sourcing

### Decision: H2 with JSON Event Storage

**Schema Design**:

```sql
-- Battle metadata (queryable fields)
CREATE TABLE battles (
    battle_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL, -- NOT_STARTED, ACTIVE, PAUSED, ENDED
    created_at TIMESTAMP NOT NULL,
    last_modified TIMESTAMP NOT NULL,
    event_count INT NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_battles_user_id ON battles(user_id);
CREATE INDEX idx_battles_created_at ON battles(created_at);

-- Event store (immutable event log)
CREATE TABLE events (
    event_id UUID PRIMARY KEY,
    battle_id UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data TEXT NOT NULL, -- JSON
    sequence_number INT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    FOREIGN KEY (battle_id) REFERENCES battles(battle_id) ON DELETE CASCADE,
    UNIQUE (battle_id, sequence_number)
);

CREATE INDEX idx_events_battle_id ON events(battle_id);
CREATE INDEX idx_events_sequence ON events(battle_id, sequence_number);

-- Snapshots (optional optimization)
CREATE TABLE battle_snapshots (
    snapshot_id UUID PRIMARY KEY,
    battle_id UUID NOT NULL,
    snapshot_at_sequence INT NOT NULL,
    snapshot_data TEXT NOT NULL, -- JSON serialized battle state
    timestamp TIMESTAMP NOT NULL,
    FOREIGN KEY (battle_id) REFERENCES battles(battle_id) ON DELETE CASCADE,
    UNIQUE (battle_id, snapshot_at_sequence)
);

CREATE INDEX idx_snapshots_battle_id ON battle_snapshots(battle_id);
```

**Event JSON Structure**:
```json
{
  "eventType": "CreatureAdded",
  "battleId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-02-11T10:30:00Z",
  "eventId": "660e8400-e29b-41d4-a716-446655440001",
  "creatureId": "770e8400-e29b-41d4-a716-446655440002",
  "name": "Goblin",
  "type": "MONSTER",
  "maxHP": 10,
  "currentHP": 10,
  "initiative": 15,
  "armorClass": 12
}
```

---

## Summary

| Research Area | Decision | Key Benefit |
|--------------|----------|-------------|
| Event Sourcing | Battle aggregate with JSON event store | Complete audit trail, state reconstruction |
| Integration Tests | Spring Boot Test + H2 over mocking | Tests real behavior, catches serialization errors |
| Frontend Testing | Angular Testing Library | User-centric tests, maintainable |
| State Management | Signals (local) + Observables (async) | Best of both: simplicity + async power |
| Performance | Snapshot every 1000 events | Meets <5s replay constraint for 10K events |
| Database | H2 with JSON events + metadata table | Fast, simple, sufficient for MVP scale |

**Next Phase**: Create data model (entities, events, aggregates) and API contracts.

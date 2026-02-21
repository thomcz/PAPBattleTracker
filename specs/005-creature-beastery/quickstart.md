# Quick Start: Creature Beastery Development

**Target Audience**: Developers implementing creature beastery features

## One-Minute Overview

The creature beastery is a reusable creature library using **event sourcing** for the backend and **signals** for the frontend.

- **Backend**: Creatures stored as events in H2, snapshots for fast queries
- **Frontend**: Angular Signals for reactive state, localStorage for persistence
- **Architecture**: Hexagonal (ports/adapters), TDD required (80%+ coverage)

## Project Layout

```
backend/
└── src/main/kotlin/.../battle/backend/
    ├── domain/creature/              # Core business logic
    │   ├── Creature.kt               # Main aggregate
    │   ├── Ability.kt               # Value object
    │   └── ports/
    │       └── CreatureRepository.kt # Interface
    ├── application/creature/         # Use cases
    │   └── CreateCreatureUseCase.kt
    └── infrastructure/
        ├── persistence/jpa/          # Database adapters
        └── rest/                      # REST controller

frontend-angular/
└── src/app/
    ├── core/creature/               # Domain ports (interfaces)
    ├── adapters/creature/           # API client, localStorage
    └── features/beastery/           # UI & feature logic
        ├── components/              # creature-list, creature-form
        ├── services/                # BeasteryService (use cases)
        └── state/                   # beastery.signal.ts (state)
```

## Key Files to Create

### Backend (Kotlin)

1. **Domain Layer** (`domain/creature/`):
   - `Creature.kt` - Aggregate root with create/update/delete methods
   - `Ability.kt` - Value object for abilities
   - `CreatureId.kt` - Creature ID type

2. **Ports** (`domain/creature/ports/`):
   - `CreatureRepository.kt` - Interface for persistence
   - `CreatureEvents.kt` - Event definitions

3. **Use Cases** (`domain/creature/usecase/`):
   - `CreateCreatureUseCase.kt` - Create new creature
   - `UpdateCreatureUseCase.kt` - Edit creature
   - `DeleteCreatureUseCase.kt` - Delete creature
   - `ListCreaturesUseCase.kt` - Get all creatures for user

4. **Application Service** (`application/creature/`):
   - `CreatureApplicationService.kt` - Orchestrates use cases

5. **Infrastructure** (`infrastructure/`):
   - `CreatureJpaRepository.kt` - Spring Data JPA adapter
   - `CreatureJpaEntity.kt` - JPA entity mapping
   - `CreatureController.kt` - REST endpoints

### Frontend (Angular)

1. **Domain Ports** (`core/creature/`):
   - `creature.ts` - Creature interface
   - `creature.repository.ts` - Repository port

2. **Adapters** (`adapters/creature/`):
   - `creature.api.ts` - HTTP calls to backend
   - `creature.storage.ts` - localStorage fallback

3. **Feature** (`features/beastery/`):
   - `beastery.service.ts` - Business logic (use cases)
   - `beastery.signal.ts` - Signal-based state management
   - `creature-list.component.ts` - List creatures with search
   - `creature-form.component.ts` - Create/edit form
   - `creature-detail.component.ts` - View creature details

## Development Workflow

### 1. Start with Tests (TDD)

```bash
# Backend: Create test first
touch backend/src/test/kotlin/de/thomcz/pap/battle/backend/creature/domain/CreatureTest.kt

# Write failing test
class CreatureTest {
    @Test
    fun `create creature with valid data`() {
        val creature = Creature.create(
            name = "Orc",
            hitPoints = 45,
            armorClass = 15
        )
        assertThat(creature.name).isEqualTo("Orc")
    }
}

# Run test (RED)
./gradlew test --tests CreatureTest

# Implement to pass
data class Creature(
    val id: CreatureId = CreatureId.generate(),
    val name: String,
    val hitPoints: Int,
    val armorClass: Int,
    val abilities: List<Ability> = emptyList()
)
```

### 2. Implement in Layers

**Domain** → **Application** → **Infrastructure** → **Tests**

```bash
# 1. Implement domain logic (Creature aggregate)
# 2. Define ports (CreatureRepository interface)
# 3. Implement use cases (CreateCreatureUseCase)
# 4. Implement adapters (CreatureJpaRepository, CreatureController)
# 5. Write integration tests (CreatureControllerTest)
```

### 3. Frontend Development

```bash
cd frontend-angular

# Create service test first
ng generate service features/beastery/services/beastery --skip-tests=false

# Write failing test for service
it('should create creature', () => {
  const service = TestBed.inject(BeasteryService);
  service.createCreature({ name: 'Orc', hitPoints: 45, armorClass: 15 }).subscribe(creature => {
    expect(creature.name).toBe('Orc');
  });
});

# Create component after service works
ng generate component features/beastery/components/creature-list
```

## Key Testing Points

### Backend Unit Tests (Domain)

```kotlin
// test/kotlin/creature/domain/CreatureTest.kt
class CreatureTest {
    // Test creature creation
    // Test ability addition/removal
    // Test validation (HP > 0, AC >= 0, name not blank)
    // Test hard deletion prevents modification
    // Test duplicate generation
}
```

### Backend Integration Tests (API)

```kotlin
// test/kotlin/creature/infrastructure/CreatureControllerTest.kt
@SpringBootTest(webEnvironment = RANDOM_PORT)
class CreatureControllerTest {
    // POST /api/creatures → 201
    // GET /api/creatures → 200
    // GET /api/creatures/{id} → 200 or 404
    // PUT /api/creatures/{id} → 200
    // DELETE /api/creatures/{id} → 204
    // Authorization: 401 without JWT, 403 for other user's creature
}
```

### Frontend Component Tests

```typescript
// features/beastery/components/creature-list.spec.ts
describe('CreatureListComponent', () => {
  // Test loading creatures
  // Test search filtering
  // Test delete confirmation
  // Test navigate to creature detail
  // Test error handling
});
```

## API Usage Example

### Create Creature

```bash
curl -X POST http://localhost:8080/api/creatures \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Orc",
    "hitPoints": 45,
    "armorClass": 15,
    "abilities": [
      {
        "name": "Attack",
        "damage": "2d6+2"
      }
    ]
  }'
```

### List Creatures

```bash
curl -X GET "http://localhost:8080/api/creatures?search=orc" \
  -H "Authorization: Bearer <token>"
```

### Delete Creature

```bash
curl -X DELETE http://localhost:8080/api/creatures/{creatureId} \
  -H "Authorization: Bearer <token>"
```

## Running Tests

```bash
# Backend
cd backend
./gradlew test                          # All tests
./gradlew test --tests CreatureTest     # Specific test class
./gradlew test --coverage               # With coverage report

# Frontend
cd frontend-angular
npm test                                # All tests
npm test -- --code-coverage             # With coverage report
npm test -- --watch                     # Watch mode
```

## Performance Targets

- Create creature form: < 2 minutes
- Search 50+ creatures: < 5 seconds
- API response time: p95 < 300ms
- Search implementation: Full-text on creature name (SQL LIKE for MVP)

## Architecture Decisions

### Why Event Sourcing?

- Audit trail for creature modifications
- Foundation for future undo/redo
- Snapshots enable fast queries
- Alignment with existing project pattern

### Why Signals (Frontend)?

- Angular 18+ first-class feature
- Better change detection than RxJS alone
- Automatic computed signal updates
- Simpler state management for small features

### Why Hard Delete?

- Spec requirement (no recovery)
- Simpler implementation
- Event sourcing preserves history anyway

### Why No Creature Sharing?

- Out of scope for MVP
- Can add in future feature
- Starts with single-user use case

## Common Pitfalls

❌ **Don't**: Modify creature during battle execution
✅ **Do**: Copy creature when adding to battle

❌ **Don't**: Create creature without validation
✅ **Do**: Validate in domain (before save)

❌ **Don't**: Skip tests for simple methods
✅ **Do**: Test all public domain methods

❌ **Don't**: Store creature reference in battle
✅ **Do**: Store independent copy of creature data

## Debugging

### Backend Event Sourcing Issues

```sql
-- Check events for creature
SELECT * FROM creature_events
WHERE aggregate_id = '...'
ORDER BY created_at;

-- Check current snapshot state
SELECT * FROM creature_snapshots
WHERE aggregate_id = '...';
```

### Frontend Signal Issues

```typescript
// Log signal changes
effect(() => {
  console.log('Creatures changed:', creatureListSignal());
});

// Manual signal update debugging
console.log('Current creatures:', creatureListSignal());
creatureListSignal.set([...]);
```

## Next Steps

1. ✅ Review data-model.md for entity definitions
2. ✅ Review creature-api.yaml for API contracts
3. Create domain tests (RED phase)
4. Implement domain logic (GREEN phase)
5. Create API integration tests
6. Implement REST controller
7. Build Angular components (test-driven)
8. Run full test suite with coverage report
9. Validate against constitution (TDD, hexagonal, performance)

## Links

- [Feature Spec](spec.md)
- [Data Model](data-model.md)
- [API Contracts](contracts/creature-api.yaml)
- [Research Notes](research.md)
- [CLAUDE.md](../../CLAUDE.md) - Project guidelines
- [Constitution](../../.specify/memory/constitution.md) - Non-negotiable principles

# Quickstart: Creature Management

**Feature**: 002-creature-management
**Date**: 2026-02-16
**Prerequisites**: Backend and frontend development environment set up

## Overview

This guide helps developers quickly set up, test, and develop the creature management feature for PAPBattleTracker.

## Development Environment Setup

### Backend (Kotlin + Spring Boot)

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Run tests** (TDD - write tests first!):
   ```bash
   ./gradlew test
   ```

3. **Start backend server**:
   ```bash
   ./gradlew bootRun
   # Server starts at http://localhost:8080
   ```

4. **Verify backend is running**:
   ```bash
   curl http://localhost:8080/api/health
   # Should return 200 OK
   ```

### Frontend (Angular)

1. **Navigate to frontend directory**:
   ```bash
   cd frontend-angular
   ```

2. **Install dependencies** (if not done):
   ```bash
   npm install
   ```

3. **Run tests**:
   ```bash
   npm test
   ```

4. **Start dev server**:
   ```bash
   npm start
   # Server starts at http://localhost:4200
   ```

5. **Verify frontend is running**:
   - Open browser to http://localhost:4200
   - Should see login page

## Feature Development Workflow

### Test-Driven Development (TDD) - MANDATORY

Follow Red-Green-Refactor cycle:

1. **RED**: Write failing test
   ```kotlin
   @Test
   fun `should add creature to battle`() {
       // given
       val battle = Battle.create(...)
       val creatureRequest = CreateCreatureRequest(...)

       // when
       val result = battle.addCreature(creatureRequest)

       // then
       assertThat(result.creatures).hasSize(1)
       assertThat(result.creatures[0].name).isEqualTo("Goblin")
   }
   ```

2. **GREEN**: Implement minimum code to pass
   ```kotlin
   fun addCreature(request: CreateCreatureRequest): Battle {
       val creature = Creature(
           id = UUID.randomUUID(),
           name = request.name,
           // ... other fields
       )
       val event = CreatureAdded(...)
       return applyEvent(event)
   }
   ```

3. **REFACTOR**: Clean up while keeping tests green

### Backend Development Order

**Phase 1: Domain Layer** (no framework dependencies)
1. Create `Creature.kt` value object with validation
   - Test file: `CreatureTest.kt`
   - Coverage target: 100%

2. Add creature events in `events/` directory
   - `CreatureAdded.kt`
   - `CreatureUpdated.kt`
   - `CreatureRemoved.kt`
   - Modify `CombatEnded.kt` (add removedMonsterIds)

3. Extend `Battle.kt` aggregate with creature methods
   - Test file: `BattleCreatureTest.kt`
   - Methods: addCreature, updateCreature, removeCreature, sortCreaturesByInitiative
   - Coverage target: 100%

**Phase 2: Application Layer**
4. Create DTOs in `application/dto/`
   - `CreateCreatureRequest.kt`
   - `UpdateCreatureRequest.kt`
   - `CreatureResponse.kt`

5. Extend `BattleService.kt` with creature operations
   - Test file: `BattleServiceCreatureTest.kt`
   - Methods: addCreature, updateCreature, removeCreature
   - Coverage target: ≥90%

**Phase 3: Infrastructure Layer**
6. Extend `BattleController.kt` with REST endpoints
   - Test file: `BattleControllerCreatureTest.kt`
   - Endpoints: POST/PUT/DELETE `/api/battles/{id}/creatures/{creatureId}`
   - Coverage target: ≥80%

### Frontend Development Order

**Phase 1: Core Layer** (domain models and use cases)
1. Extend `battle.model.ts` with Creature interface
   - Add CreatureType enum
   - Update Battle interface to include creatures array

2. Extend `battle.port.ts` with creature methods
   - `addCreature(battleId, request): Observable<Creature>`
   - `updateCreature(battleId, creatureId, request): Observable<Creature>`
   - `removeCreature(battleId, creatureId): Observable<void>`

3. Create use cases in `core/domain/use-cases/`
   - `add-creature.use-case.ts` with signal-based state
   - `update-creature.use-case.ts`
   - `remove-creature.use-case.ts`
   - Test files: `.spec.ts` for each use case

**Phase 2: Adapters**
4. Extend `battle-api.adapter.ts` to implement creature port methods
   - Test file: `battle-api.adapter.spec.ts`

**Phase 3: Components**
5. Create creature components in `features/battle/`
   - `creature-list/` - Display roster
   - `creature-card/` - Individual creature card
   - `creature-dialog/` - Add/edit form
   - All with `.spec.ts` test files

6. Integrate into `battle-detail.component.ts`
   - Add creature list to battle detail page

## Testing the Feature

### Manual Testing Flow

1. **Start both backend and frontend**:
   ```bash
   # Terminal 1
   cd backend && ./gradlew bootRun

   # Terminal 2
   cd frontend-angular && npm start
   ```

2. **Register/Login**:
   - Navigate to http://localhost:4200
   - Register new user or login

3. **Create Battle**:
   - Click "New Battle"
   - Enter battle name
   - Battle detail page should open

4. **Add Creatures**:
   - Click "Add Creature" button
   - Fill form:
     - Name: "Goblin"
     - Type: Monster
     - Current HP: 7
     - Max HP: 7
     - Initiative: 14
     - Armor Class: 15
   - Click "Save"
   - Creature should appear in roster

5. **Add Multiple Creatures**:
   - Add another creature (e.g., "Fighter", Player, 30/30 HP, init 18, AC 18)
   - Creatures appear in creation order (not yet sorted)

6. **Start Combat**:
   - Click "Start Combat"
   - Creatures should re-sort by initiative (Fighter first, Goblin second)

7. **Edit Creature**:
   - Click edit on Goblin
   - Change initiative to 20
   - Save
   - Roster should re-sort (Goblin now first)

8. **Remove Creature**:
   - Click delete on Goblin
   - Confirm
   - Creature should disappear from roster

9. **End Combat**:
   - Add new monster creature
   - Click "End Combat"
   - Monster should be auto-removed
   - Player character should remain

### API Testing with curl

**1. Register and login**:
```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"userName":"testuser","email":"test@example.com","password":"password123"}'

# Login (save token)
TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userName":"testuser","password":"password123"}' \
  | jq -r '.token')
```

**2. Create battle**:
```bash
BATTLE_ID=$(curl -X POST http://localhost:8080/api/battles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Battle"}' \
  | jq -r '.id')
```

**3. Add creature**:
```bash
CREATURE_ID=$(curl -X POST http://localhost:8080/api/battles/$BATTLE_ID/creatures \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Goblin",
    "type":"MONSTER",
    "currentHp":7,
    "maxHp":7,
    "initiative":14,
    "armorClass":15
  }' \
  | jq -r '.id')
```

**4. Update creature**:
```bash
curl -X PUT http://localhost:8080/api/battles/$BATTLE_ID/creatures/$CREATURE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentHp":3}'
```

**5. Remove creature**:
```bash
curl -X DELETE http://localhost:8080/api/battles/$BATTLE_ID/creatures/$CREATURE_ID \
  -H "Authorization: Bearer $TOKEN"
```

**6. Get battle (verify creatures)**:
```bash
curl -X GET http://localhost:8080/api/battles/$BATTLE_ID \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.creatures'
```

### Automated Testing

**Backend Tests**:
```bash
cd backend

# Run all tests
./gradlew test

# Run specific test class
./gradlew test --tests CreatureTest

# Run with coverage report
./gradlew test jacocoTestReport
# Coverage report: build/reports/jacoco/test/html/index.html
```

**Frontend Tests**:
```bash
cd frontend-angular

# Run all tests
npm test

# Run in watch mode (re-run on file change)
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

## Debugging Tips

### Backend Debugging

**1. Enable debug logging** (`application.properties`):
```properties
logging.level.de.thomcz.pap.battle.backend=DEBUG
```

**2. View H2 database**:
- Navigate to http://localhost:8080/h2-console
- JDBC URL: `jdbc:h2:mem:testdb`
- Username: `sa`
- Password: (leave blank)
- Query events: `SELECT * FROM battle_events WHERE battle_id = '<uuid>'`

**3. Common issues**:
- **401 Unauthorized**: JWT token missing or expired - re-login
- **403 Forbidden**: User doesn't own battle - check userId matches
- **404 Not Found**: Battle or creature ID incorrect - verify UUIDs
- **409 Conflict**: Invalid battle state (e.g., combat ended) - check battle.status

### Frontend Debugging

**1. View signal state** (browser console):
```javascript
// Get Angular debug utilities
ng.getComponent($0)  // Select element in DevTools first

// View signal value
ng.getComponent($0).creatureUseCase.creatures()
```

**2. Network debugging**:
- Open DevTools → Network tab
- Filter: XHR
- Check request/response for creature API calls
- Verify JWT token in Authorization header

**3. Common issues**:
- **Signal not updating**: Check if signal is readonly in component
- **API call fails**: Check CORS, verify backend is running
- **Form validation errors**: Check Angular form validators match backend validation

## Performance Profiling

### Backend Performance

**Test initiative sorting performance**:
```kotlin
@Test
fun `should sort 20 creatures by initiative in under 10ms`() {
    // given
    val battle = createBattleWith20Creatures()

    // when
    val startTime = System.nanoTime()
    val sorted = battle.sortCreaturesByInitiative()
    val duration = (System.nanoTime() - startTime) / 1_000_000 // Convert to ms

    // then
    assertThat(duration).isLessThan(10)
}
```

**Test event replay performance**:
```kotlin
@Test
fun `should replay 100 events in under 1 second`() {
    // given
    val events = create100CreatureEvents()

    // when
    val startTime = System.nanoTime()
    val battle = Battle.fromEvents(events)
    val duration = (System.nanoTime() - startTime) / 1_000_000

    // then
    assertThat(duration).isLessThan(1000)
}
```

### Frontend Performance

**Measure rendering time**:
```typescript
it('should render 20 creatures in under 500ms', () => {
  const creatures = create20TestCreatures();
  const startTime = performance.now();

  fixture.componentInstance.creatures = signal(creatures);
  fixture.detectChanges();

  const duration = performance.now() - startTime;
  expect(duration).toBeLessThan(500);
});
```

## Next Steps

1. Implement backend domain layer (Creature value object, events)
2. Implement backend application layer (BattleService methods)
3. Implement backend REST endpoints (BattleController)
4. Implement frontend domain layer (models, use cases)
5. Implement frontend components (list, card, dialog)
6. Integration testing (end-to-end flow)
7. Performance testing (verify constitution targets)

## Resources

- **Spec**: [spec.md](./spec.md) - Feature requirements and acceptance criteria
- **Plan**: [plan.md](./plan.md) - Implementation plan and architecture decisions
- **Research**: [research.md](./research.md) - Technology decisions and rationale
- **Data Model**: [data-model.md](./data-model.md) - Entity definitions and event schemas
- **API Contract**: [contracts/creature-api.yaml](./contracts/creature-api.yaml) - OpenAPI specification
- **Backend Guide**: `/backend/CLAUDE.md` - Kotlin development patterns
- **Frontend Guide**: `/frontend-angular/CLAUDE.md` - Angular development patterns
- **Constitution**: `/.specify/memory/constitution.md` - Project-wide principles

## Support

For questions or issues:
1. Check existing tests for examples
2. Review CLAUDE.md files for patterns
3. Consult data-model.md for entity structure
4. Reference API contract for endpoint details

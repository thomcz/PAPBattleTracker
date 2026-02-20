# Phase 1: Quick Start - Player Management

**Date**: 2026-02-19 | **Feature**: 004-player-management

## Overview

This quick start guide provides developers with the essential setup and patterns needed to implement the Player Management feature. It assumes familiarity with the existing codebase (features 001-003).

---

## Backend Setup (Kotlin + Spring Boot)

### 1. Create Domain Layer

**File**: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/player/Player.kt`

```kotlin
package de.thomcz.pap.battle.backend.domain.player

import java.util.*

// Value Objects
data class PlayerId(val value: UUID) {
  companion object {
    fun generate() = PlayerId(UUID.randomUUID())
  }
}

data class SessionId(val value: UUID)
data class PlayerName(val value: String) {
  init {
    require(value.isNotEmpty()) { "Name cannot be empty" }
    require(value.length <= 100) { "Name cannot exceed 100 characters" }
  }
}

data class CharacterClass(val value: String) {
  init {
    require(value.isNotEmpty()) { "Class cannot be empty" }
    require(value.length <= 50) { "Class cannot exceed 50 characters" }
  }
}

// Domain Event Classes
sealed class PlayerEvent(
  open val aggregateId: PlayerId,
  open val aggregateType: String = "Player",
  open val sessionId: SessionId,
  open val timestamp: Instant,
  open val version: Int
)

data class PlayerCreated(
  override val aggregateId: PlayerId,
  override val sessionId: SessionId,
  val name: PlayerName,
  val characterClass: CharacterClass,
  val level: Int,
  val maxHp: Int,
  override val timestamp: Instant = Instant.now(),
  override val version: Int = 1
) : PlayerEvent(aggregateId, sessionId = sessionId, timestamp = timestamp, version = version) {
  init {
    require(level in 1..20) { "Level must be between 1 and 20" }
    require(maxHp in 1..1000) { "Max HP must be between 1 and 1000" }
  }
}

data class PlayerUpdated(
  override val aggregateId: PlayerId,
  override val sessionId: SessionId,
  val changes: Map<String, Any>,
  override val timestamp: Instant = Instant.now(),
  override val version: Int
) : PlayerEvent(aggregateId, sessionId = sessionId, timestamp = timestamp, version = version) {
  init {
    require(changes.isNotEmpty()) { "At least one field must change" }
  }
}

data class PlayerDeleted(
  override val aggregateId: PlayerId,
  override val sessionId: SessionId,
  override val timestamp: Instant = Instant.now(),
  override val version: Int
) : PlayerEvent(aggregateId, sessionId = sessionId, timestamp = timestamp, version = version)

// Aggregate Root
class Player(
  val playerId: PlayerId,
  val sessionId: SessionId,
  val name: PlayerName,
  val characterClass: CharacterClass,
  val level: Int,
  val maxHp: Int,
  val isDeleted: Boolean = false,
  val events: List<PlayerEvent> = emptyList()
) {
  fun updateLevel(newLevel: Int): PlayerUpdated {
    require(newLevel in 1..20) { "Level must be between 1 and 20" }
    return PlayerUpdated(
      playerId, sessionId,
      mapOf("level" to newLevel),
      version = events.size + 1
    )
  }

  fun updateMaxHp(newMaxHp: Int): PlayerUpdated {
    require(newMaxHp in 1..1000) { "Max HP must be between 1 and 1000" }
    return PlayerUpdated(
      playerId, sessionId,
      mapOf("maxHp" to newMaxHp),
      version = events.size + 1
    )
  }

  fun delete(): PlayerDeleted {
    return PlayerDeleted(playerId, sessionId, version = events.size + 1)
  }

  companion object {
    fun create(
      sessionId: SessionId,
      name: PlayerName,
      characterClass: CharacterClass,
      level: Int,
      maxHp: Int
    ): Pair<Player, PlayerCreated> {
      val playerId = PlayerId.generate()
      val event = PlayerCreated(playerId, sessionId, name, characterClass, level, maxHp)
      return Player(playerId, sessionId, name, characterClass, level, maxHp, false, listOf(event)) to event
    }

    fun fromEvents(events: List<PlayerEvent>): Player? {
      if (events.isEmpty()) return null

      var state = events[0].let { e ->
        (e as PlayerCreated).let { created ->
          Player(created.aggregateId, created.sessionId, created.name, created.characterClass,
                 created.level, created.maxHp, false, events)
        }
      }

      for (event in events.drop(1)) {
        state = when (event) {
          is PlayerUpdated -> {
            var newLevel = state.level
            var newMaxHp = state.maxHp
            var newName = state.name
            var newClass = state.characterClass

            if ("level" in event.changes) newLevel = event.changes["level"] as Int
            if ("maxHp" in event.changes) newMaxHp = event.changes["maxHp"] as Int
            if ("name" in event.changes) newName = PlayerName(event.changes["name"] as String)
            if ("characterClass" in event.changes) newClass = CharacterClass(event.changes["characterClass"] as String)

            state.copy(level = newLevel, maxHp = newMaxHp, name = newName, characterClass = newClass, events = events)
          }
          is PlayerDeleted -> state.copy(isDeleted = true, events = events)
          else -> state
        }
      }
      return state
    }
  }
}
```

### 2. Create Use Cases

**File**: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/player/CreatePlayerUseCase.kt`

```kotlin
package de.thomcz.pap.battle.backend.domain.player

interface PlayerRepository {
  fun save(event: PlayerEvent)
  fun findById(playerId: PlayerId, sessionId: SessionId): Player?
  fun findBySessionId(sessionId: SessionId): List<Player>
}

class CreatePlayerUseCase(private val playerRepository: PlayerRepository) {
  fun execute(
    sessionId: SessionId,
    name: String,
    characterClass: String,
    level: Int,
    maxHp: Int
  ): PlayerId {
    val (player, event) = Player.create(
      sessionId,
      PlayerName(name),
      CharacterClass(characterClass),
      level,
      maxHp
    )
    playerRepository.save(event)
    return player.playerId
  }
}
```

### 3. Create REST Adapter

**File**: `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/rest/PlayerController.kt`

```kotlin
@RestController
@RequestMapping("/api/sessions/{sessionId}/players")
class PlayerController(
  private val createPlayerUseCase: CreatePlayerUseCase,
  private val playerRepository: PlayerRepository
) {

  @PostMapping
  fun createPlayer(
    @PathVariable sessionId: UUID,
    @RequestBody request: CreatePlayerRequest,
    authentication: Authentication
  ): ResponseEntity<PlayerDto> {
    // Verify session ownership (authorization)
    val userId = (authentication.principal as JwtUser).id

    val playerId = createPlayerUseCase.execute(
      SessionId(sessionId),
      request.name,
      request.characterClass,
      request.level,
      request.maxHp
    )

    val player = playerRepository.findById(PlayerId(playerId), SessionId(sessionId))
    return ResponseEntity.status(201).body(player?.toDto())
  }

  @GetMapping
  fun listPlayers(@PathVariable sessionId: UUID): ResponseEntity<List<PlayerDto>> {
    val players = playerRepository.findBySessionId(SessionId(sessionId))
      .filter { !it.isDeleted }
    return ResponseEntity.ok(players.map { it.toDto() })
  }
}

data class CreatePlayerRequest(
  val name: String,
  val characterClass: String,
  val level: Int,
  val maxHp: Int
)

data class PlayerDto(
  val playerId: String,
  val name: String,
  val characterClass: String,
  val level: Int,
  val maxHp: Int,
  val isDeleted: Boolean
)
```

---

## Frontend Setup (Angular 18)

### 1. Create Domain Models

**File**: `frontend-angular/src/app/core/player/domain/models/player.model.ts`

```typescript
import { UUID } from 'uuid';

export interface Player {
  playerId: string;
  sessionId: string;
  name: string;
  characterClass: string;
  level: number;
  maxHp: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class CreatePlayerCommand {
  constructor(
    public readonly sessionId: string,
    public readonly name: string,
    public readonly characterClass: string,
    public readonly level: number,
    public readonly maxHp: number
  ) {}
}

export class UpdatePlayerCommand {
  constructor(
    public readonly sessionId: string,
    public readonly playerId: string,
    public readonly changes: Partial<Omit<Player, 'playerId' | 'sessionId'>>
  ) {}
}

export class DeletePlayerCommand {
  constructor(
    public readonly sessionId: string,
    public readonly playerId: string
  ) {}
}
```

### 2. Create Use Cases

**File**: `frontend-angular/src/app/core/player/domain/use-cases/create-player.use-case.ts`

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Player, CreatePlayerCommand } from '../models/player.model';
import { PlayerRepository } from '../ports/player.repository';

@Injectable({ providedIn: 'root' })
export class CreatePlayerUseCase {
  constructor(private playerRepository: PlayerRepository) {}

  execute(command: CreatePlayerCommand): Observable<Player> {
    return this.playerRepository.create(command);
  }
}
```

### 3. Create Domain Port

**File**: `frontend-angular/src/app/core/player/domain/ports/player.repository.ts`

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Player, CreatePlayerCommand } from '../models/player.model';

export abstract class PlayerRepository {
  abstract create(command: CreatePlayerCommand): Observable<Player>;
  abstract getAll(sessionId: string): Observable<Player[]>;
  abstract getById(sessionId: string, playerId: string): Observable<Player>;
  abstract update(command: UpdatePlayerCommand): Observable<Player>;
  abstract delete(command: DeletePlayerCommand): Observable<void>;
}
```

### 4. Create HTTP Adapter

**File**: `frontend-angular/src/app/adapters/player/api/player.api.adapter.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Player, CreatePlayerCommand } from '../../../core/player/domain/models/player.model';
import { PlayerRepository } from '../../../core/player/domain/ports/player.repository';

@Injectable({ providedIn: 'root' })
export class PlayerApiAdapter implements PlayerRepository {
  private apiUrl = '/api/sessions';

  constructor(private http: HttpClient) {}

  create(command: CreatePlayerCommand): Observable<Player> {
    return this.http.post<Player>(
      `${this.apiUrl}/${command.sessionId}/players`,
      {
        name: command.name,
        characterClass: command.characterClass,
        level: command.level,
        maxHp: command.maxHp
      }
    );
  }

  getAll(sessionId: string): Observable<Player[]> {
    return this.http.get<Player[]>(`${this.apiUrl}/${sessionId}/players`);
  }

  // ... other methods
}
```

### 5. Create State Management (Signals)

**File**: `frontend-angular/src/app/core/player/state/player.store.ts`

```typescript
import { Injectable, signal, computed } from '@angular/core';
import { Player } from '../domain/models/player.model';
import { CreatePlayerUseCase } from '../domain/use-cases/create-player.use-case';

@Injectable({ providedIn: 'root' })
export class PlayerStore {
  private playersSignal = signal<Player[]>([]);
  private selectedSessionId = signal<string | null>(null);

  // Selectors
  players = computed(() =>
    this.playersSignal().filter(p => !p.isDeleted)
  );

  loadingSignal = signal(false);

  constructor(private createPlayerUseCase: CreatePlayerUseCase) {}

  setSession(sessionId: string) {
    this.selectedSessionId.set(sessionId);
  }

  loadPlayers(sessionId: string) {
    this.loadingSignal.set(true);
    // Load players logic
  }

  addPlayer(player: Player) {
    this.playersSignal.set([...this.playersSignal(), player]);
  }

  updatePlayer(updated: Player) {
    const players = this.playersSignal();
    const index = players.findIndex(p => p.playerId === updated.playerId);
    if (index >= 0) {
      players[index] = updated;
      this.playersSignal.set([...players]);
    }
  }
}
```

### 6. Create Components

**File**: `frontend-angular/src/app/features/player-management/player-list/player-list.component.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerStore } from '../../../core/player/state/player.store';

@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.css']
})
export class PlayerListComponent implements OnInit {
  players$ = this.playerStore.players;

  constructor(
    private playerStore: PlayerStore,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    const currentSessionId = this.sessionService.getCurrentSessionId();
    this.playerStore.loadPlayers(currentSessionId);
  }

  deletePlayer(playerId: string): void {
    if (confirm('Are you sure you want to delete this player?')) {
      // Call delete use case
    }
  }
}
```

---

## Integration Points

### Connect to Battle Creation (Feature 003)

In the battle creation component, add a player selection dropdown:

```typescript
// In battle-create.component.ts
players$ = this.playerStore.players;

onCreateBattle(battleData: CreateBattleCommand) {
  const selectedPlayers = this.selectedPlayerIds; // From form
  const battleWithPlayers = {
    ...battleData,
    participantPlayerIds: selectedPlayers
  };
  // Call create battle use case
}
```

---

## Testing Examples

### Backend Unit Test

```kotlin
@ExtendWith(MockitoExtension::class)
class CreatePlayerUseCaseTest {
  private lateinit var useCase: CreatePlayerUseCase

  @Mock
  lateinit var playerRepository: PlayerRepository

  @Before
  fun setup() {
    useCase = CreatePlayerUseCase(playerRepository)
  }

  @Test
  fun `should create player with valid data`() {
    val sessionId = SessionId(UUID.randomUUID())
    val playerId = useCase.execute(sessionId, "Aragorn", "Ranger", 10, 85)

    verify(playerRepository).save(any<PlayerCreated>())
    assertThat(playerId).isNotNull()
  }

  @Test
  fun `should throw when level is invalid`() {
    assertThrows<IllegalArgumentException> {
      useCase.execute(sessionId, "Aragorn", "Ranger", 25, 85)
    }
  }
}
```

### Frontend Component Test

```typescript
describe('PlayerListComponent', () => {
  let component: PlayerListComponent;
  let playerStore: PlayerStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerListComponent],
      providers: [PlayerStore]
    }).compileComponents();

    component = TestBed.createComponent(PlayerListComponent).componentInstance;
    playerStore = TestBed.inject(PlayerStore);
  });

  it('should display player list', (done) => {
    const mockPlayers: Player[] = [
      { playerId: '1', name: 'Aragorn', characterClass: 'Ranger', level: 10, maxHp: 85, ... }
    ];

    playerStore.addPlayer(mockPlayers[0]);
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      const listItems = fixture.debugElement.queryAll(By.css('li'));
      expect(listItems.length).toBe(1);
      done();
    });
  });
});
```

---

## Key Patterns to Follow

1. **Hexagonal Architecture**: Keep domain logic isolated; use ports for dependencies
2. **Event Sourcing**: Every state change is an immutable event
3. **Test-First**: Write tests before implementation
4. **Signal-Based State**: Use Angular signals for reactive state in frontend
5. **Session Scoping**: All player operations require session context

---

## Running Tests

```bash
# Backend
cd backend
./gradlew test

# Frontend
cd frontend-angular
npm test
```

---

## Common Issues & Solutions

**Issue**: Player not appearing in list after creation
- **Solution**: Ensure PlayerStore is updated via `addPlayer()` after API success

**Issue**: Session ID not available in component
- **Solution**: Inject SessionService and call `getCurrentSessionId()`

**Issue**: Validation failing on update
- **Solution**: Ensure all fields meet requirements (level 1-20, maxHp 1-1000)

---

## Next Steps

1. Create test files first (TDD approach)
2. Implement domain models and events
3. Implement use cases
4. Create repositories and adapters
5. Create UI components
6. Verify all tests pass with 80%+ coverage

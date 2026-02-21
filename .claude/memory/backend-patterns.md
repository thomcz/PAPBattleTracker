# Backend Architecture Patterns (Kotlin/Spring Boot)

## Package Structure
```
de.thomcz.pap.battle.backend/
├── domain/
│   ├── model/           # Aggregates (Player, Battle, BeasteryCreature) + events subpackage
│   └── port/
│       ├── in/          # Use case interfaces (one per operation)
│       └── out/         # Repository + EventStore interfaces
├── application/
│   ├── service/         # @Service @Transactional implementations
│   └── dto/             # Commands, Requests, Responses
└── infrastructure/
    └── adapter/
        ├── in/rest/     # @RestController classes
        └── out/persistence/  # JPA entities, Spring Data repos, H2 event stores, mappers
```

## Pattern: Input Port (Use Case Interface)
- Location: `domain/port/in/`
- One interface per operation: `CreateXxxUseCase`, `GetXxxUseCase`, `ListXxxUseCase`, `UpdateXxxUseCase`, `DeleteXxxUseCase`
- Single `fun execute(command, userId: String)` method
- userId is always a String (JWT username), converted to UUID in service layer

## Pattern: Output Port (Repository)
- Location: `domain/port/out/`
- `XxxRepository`: `findById(id: UUID)`, `findByUserId(userId: UUID)`, `save(entity)`, `deleteById(id: UUID)`
- `XxxEventStore`: `saveEvents(id: UUID, events: List<Event>)`, `getEvents(id: UUID, afterSequence: Int = 0)`, `getEventCount(id: UUID): Int`

## Pattern: Application Service
- Location: `application/service/`
- `@Service @Transactional` class implementing ALL use case interfaces for that aggregate
- `userNameToUUID()` helper: `UUID.nameUUIDFromBytes("pap-battle-tracker:$userName".toByteArray(UTF_8))`
- Flow: load from repo → verify ownership (AccessDeniedException) → call aggregate method → save → return
- Custom exceptions: `EntityNotFoundException`, `AccessDeniedException`, `StateConflictException` (defined in BattleService.kt)

## Pattern: DTOs
- Location: `application/dto/`
- Commands: `CreateXxxCommand`, `UpdateXxxCommand`, `DeleteXxxCommand`
- Responses: `XxxResponse` with `companion object { fun fromXxx(domain): XxxResponse }`
- Can be grouped in one file (e.g., `PlayerDtos.kt`)

## Pattern: REST Controller
- Location: `infrastructure/adapter/in/rest/`
- `@RestController @RequestMapping("/api/xxx")`
- Constructor-injects individual use case interfaces
- Gets userId from `authentication.name` (Spring Security Authentication)
- Maps: RequestBody → Command → execute → Response DTO
- `@ExceptionHandler` methods: EntityNotFoundException→404, AccessDeniedException→403, IllegalArgumentException→400, IllegalStateException→409
- Request DTOs (`CreateXxxRequest`, `UpdateXxxRequest`) defined at bottom of controller file OR in dto package
- Shared `ErrorResponse` data class in `infrastructure/adapter/in/rest/ErrorResponse.kt`

## Pattern: JPA Persistence
- Location: `infrastructure/adapter/out/persistence/`
- Two JPA entities per aggregate:
  - Metadata entity (e.g., `PlayerEntity` table `players`) - queryable fields, NOT source of truth
  - Event entity (e.g., `PlayerEventEntity` table `player_events`) - eventId, aggregateId, eventType, eventData(TEXT/JSON), sequenceNumber, timestamp, userId
- Spring Data interfaces: `XxxEntityRepository extends JpaRepository<XxxEntity, UUID>`
- Event store adapter (`H2XxxEventStore @Component implements XxxEventStore`):
  - Serialize: `objectMapper.writeValueAsString(event)`
  - Deserialize: `Class.forName("$packageName.$eventType")` then `objectMapper.readValue(data, clazz)`
  - Sequence numbers managed via `getMaxSequenceNumber` query
- Repository adapter (`JpaXxxRepository @Component implements XxxRepository`):
  - `save()`: get uncommitted events → save to event store → markCommitted → save metadata entity
  - `findById()`: check entity exists → replay events → `Aggregate.newInstance().loadFromHistory(events)`
- Mapper objects: `XxxMapper` with `toEntity(domain, eventCount): JpaEntity`

## Pattern: Event-Sourced Aggregate
- Private constructor, companion object factory methods
- `var field: Type ... private set` for all state
- `uncommittedEvents: MutableList<Event>`, `getUncommittedEvents()`, `markEventsAsCommitted()`
- `loadFromHistory(events)`: replays events with `isReplay = true`
- `applyEvent(event, isReplay = false)`: `when(event)` block updates state, adds to uncommitted if not replay
- Factory method `create(...)` validates with `require()`, creates event, applies it
- Business methods validate with `check(!isDeleted)` + `require()`, create event, apply

## Schema Pattern (schema.sql)
- Tables: `xxx_events` (event_id UUID PK, aggregate_id UUID, event_type VARCHAR, event_data TEXT, sequence_number INT, timestamp TIMESTAMP, user_id UUID)
- Metadata table: `xxxs` (xxx_id UUID PK, user_id UUID, ... queryable fields ..., event_count INT)
- Indexes on aggregate_id and (aggregate_id, sequence_number) with UNIQUE constraint
- Foreign keys with ON DELETE CASCADE from events to metadata table

## Existing Aggregates
- **Player**: name, characterClass, level, maxHp. Events: PlayerCreated, PlayerUpdated, PlayerDeleted
- **Battle**: name, status(CombatStatus), creatures list, combatLog. Many events for combat.
- **BeasteryCreature** (IN PROGRESS): name, hitPoints, armorClass. Events: Created, Updated, Deleted

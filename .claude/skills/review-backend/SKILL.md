# Backend Code Reviewer

Review Kotlin/Spring Boot backend code against the project's established hexagonal architecture, event sourcing patterns, and conventions.

## Configuration
- disable-model-invocation: true
- allowed-tools: Read, Grep, Glob, Bash

## Instructions

You are a code reviewer for the PAPBattleTracker Kotlin backend. Review the code specified in `$ARGUMENTS` (file paths, directory, or PR reference). If no arguments are provided, review all staged and unstaged changes via `git diff` and `git diff --cached`.

### Step 1: Gather Code to Review

- If `$ARGUMENTS` contains file paths or directories, read those files
- If `$ARGUMENTS` contains a PR number, use `gh pr diff $ARGUMENTS` to get the diff
- If `$ARGUMENTS` is empty, run `git diff` and `git diff --cached` to review current changes
- Focus only on files under `backend/src/`

### Step 2: Review Against Project Conventions

Check each category below. For each violation found, report the file, line, and what's wrong.

#### Hexagonal Architecture Compliance
- Domain layer (`domain/`) must have NO imports from `infrastructure/`, `application/`, or Spring framework (except annotations like `@Component` are NOT allowed in domain)
- Ports (`domain/port/in/`, `domain/port/out/`) define interfaces only
- Adapters (`infrastructure/adapter/`) implement ports
- Application services (`application/service/`) implement input ports
- Dependencies flow inward: infrastructure -> application -> domain

#### Use Case Pattern
- One interface per operation in `domain/port/in/`
- Naming: `CreateXxxUseCase`, `GetXxxUseCase`, `ListXxxUseCase`, `UpdateXxxUseCase`, `DeleteXxxUseCase`
- Single method: `fun execute(command, userId: String)`
- userId is always `String` (converted to UUID in service layer)

#### Event-Sourced Aggregate Pattern
- Private constructor with companion object factory methods
- Mutable state with `private set`
- `uncommittedEvents: MutableList<Event>`, `getUncommittedEvents()`, `markEventsAsCommitted()`
- `loadFromHistory(events)` replays events with `isReplay = true`
- `applyEvent(event, isReplay = false)` uses `when(event)` block, adds to uncommitted if not replay
- Factory method validates with `require()`, creates event, applies it
- Business methods validate with `check(!isDeleted)` + `require()`

#### Service Layer
- `@Service @Transactional` annotation on service class
- Implements ALL use case interfaces for that aggregate
- `userNameToUUID()` helper using `UUID.nameUUIDFromBytes("pap-battle-tracker:$userName".toByteArray(UTF_8))`
- Ownership verification with `AccessDeniedException`
- Flow: load -> verify ownership -> call aggregate method -> save -> return response
- Custom exceptions: `EntityNotFoundException`, `AccessDeniedException`, `StateConflictException`

#### REST Controller
- `@RestController @RequestMapping("/api/xxx")`
- Constructor-injects individual use case interfaces (not the service class directly)
- Gets userId from `authentication.name`
- Maps: RequestBody -> Command -> execute -> Response DTO
- `@ExceptionHandler` methods: EntityNotFoundException->404, AccessDeniedException->403, IllegalArgumentException->400, IllegalStateException->409
- Uses shared `ErrorResponse` data class

#### DTOs
- Commands: `CreateXxxCommand`, `UpdateXxxCommand`, `DeleteXxxCommand`
- Responses: `XxxResponse` with `companion object { fun fromXxx(domain): XxxResponse }`
- Request DTOs at bottom of controller file or in `application/dto/`

#### Persistence Layer
- Two JPA entities per aggregate: metadata entity + event entity
- Event entity fields: eventId, aggregateId, eventType, eventData(TEXT), sequenceNumber, timestamp, userId
- Spring Data interfaces extend `JpaRepository`
- Event store adapter: `H2XxxEventStore @Component implements XxxEventStore`
  - Serializes with `objectMapper.writeValueAsString(event)`
  - Deserializes with `Class.forName()` + `objectMapper.readValue()`
- Repository adapter: `JpaXxxRepository @Component implements XxxRepository`
  - `save()`: get uncommitted events -> save to event store -> markCommitted -> save metadata entity
  - `findById()`: check entity exists -> replay events -> `loadFromHistory()`
- Mapper: `XxxMapper` object with `toEntity(domain, eventCount)`

#### Schema
- Event table: `xxx_events` with UNIQUE constraint on `(aggregate_id, sequence_number)`
- Metadata table with `event_count INT`
- Foreign keys with `ON DELETE CASCADE`

#### Naming Conventions
- Use case interfaces: `CreateXxxUseCase`, `GetXxxUseCase`, etc.
- Repository port: `XxxRepository`
- Event store port: `XxxEventStore`
- Event store adapter: `H2XxxEventStore`
- Repository adapter: `JpaXxxRepository`
- JPA entities: `XxxEntity`, `XxxEventEntity`
- Spring Data repos: `XxxEntityRepository`, `XxxEventEntityRepository`

#### Test Coverage
- Unit tests for domain aggregates (creation, state transitions, validation)
- Unit tests for application services (mock repositories, verify behavior)
- Integration tests for controllers (MockMvc, full Spring context)
- Minimum 80% code coverage for new features
- Test file naming: `XxxTest.kt` for unit tests, `XxxIntegrationTest.kt` for integration tests

### Step 3: Output Review

Format the review as:

```
## Backend Code Review

### Summary
[One paragraph overview of what was reviewed and overall quality]

### Violations Found

#### [Category Name]
- **[severity: critical/warning/info]** `file:line` — [description of the violation and how to fix it]

### Positive Observations
- [Things done well that follow conventions]

### Recommendations
- [Optional suggestions for improvement that aren't strict violations]
```

Severity levels:
- **critical**: Breaks hexagonal architecture, missing tests, security issues
- **warning**: Deviates from established patterns, missing validation
- **info**: Style/naming suggestions, minor improvements
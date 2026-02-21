# Project File Map

## Root
- `CLAUDE.md` - Project-level instructions
- `IMPLEMENTATION_PLAN.md` - Migration roadmap

## Backend (Kotlin) - `backend/`
- `backend/CLAUDE.md` - Backend-specific guidance
- `backend/build.gradle.kts` - Dependencies
- `backend/src/main/resources/schema.sql` - H2 schema (tables: users, battles, events, players, player_events)

### Domain Layer
- `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/model/`
  - `Player.kt`, `Battle.kt`, `BeasteryCreature.kt`, `User.kt`
  - `events/` - PlayerEvent, BattleEvent, BeasteryCreatureEvent + concrete events
- `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/port/in/` - Use case interfaces
- `backend/src/main/kotlin/de/thomcz/pap/battle/backend/domain/port/out/` - Repository/EventStore interfaces

### Application Layer
- `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/service/`
  - `PlayerService.kt`, `BattleService.kt`, `AuthenticationUserService.kt`, `RegisterUserService.kt`
- `backend/src/main/kotlin/de/thomcz/pap/battle/backend/application/dto/`
  - `PlayerDtos.kt`, `CreateBattleCommand.kt`, `BattleResponse.kt`, `CreatureResponse.kt`, etc.

### Infrastructure Layer
- `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/in/rest/`
  - `PlayerController.kt`, `BattleController.kt`, `AuthenticationController.kt`, `ErrorResponse.kt`
- `backend/src/main/kotlin/de/thomcz/pap/battle/backend/infrastructure/adapter/out/persistence/`
  - JPA entities: `EventEntity.kt`, `BattleEntity.kt`, `PlayerEventEntity.kt`, `PlayerEntity.kt`, `UserEntity.kt`
  - Spring Data repos: `EventEntityRepository.kt`, `BattleEntityRepository.kt`, `PlayerEventEntityRepository.kt`, `PlayerEntityRepository.kt`
  - Adapters: `H2EventStore.kt`, `H2PlayerEventStore.kt`, `JpaBattleRepository.kt`, `JpaPlayerRepository.kt`
  - Mappers: `BattleMapper.kt`, `PlayerMapper.kt`

### Tests
- `backend/src/test/kotlin/de/thomcz/pap/battle/backend/`
  - `domain/`, `application/`, `infrastructure/`, `integration/`

## Frontend (Angular) - `frontend-angular/`
- `frontend-angular/CLAUDE.md` - Angular-specific guidance
- `frontend-angular/src/app/core/domain/models/` - Domain interfaces
- `frontend-angular/src/app/core/domain/use-cases/` - Use cases
- `frontend-angular/src/app/adapters/` - Port implementations
- `frontend-angular/src/app/features/` - Feature modules (auth, battle, beastery TBD)

## Specs
- `specs/005-creature-beastery/` - Current feature
  - `spec.md`, `plan.md`, `tasks.md`, `data-model.md`, `research.md`, `quickstart.md`
  - `checklists/requirements.md`

## Beastery Implementation Status (as of 2026-02-20)
### DONE:
- Domain: BeasteryCreature aggregate + 3 events (Created, Updated, Deleted)
- Output ports: BeasteryCreatureRepository, BeasteryCreatureEventStore
- Input ports: Create/Get/List/Update/Delete/Duplicate use cases
- Application: BeasteryCreatureService + BeasteryCreatureDtos (commands + responses)
- Infrastructure: BeasteryCreatureController (/api/beastery/creatures), JPA entities, H2 event store, JPA repository, mapper
- Compiles and all existing tests pass
### TODO:
- Tests: All layers (domain, application, infrastructure, integration)
- Frontend: All beastery components and services

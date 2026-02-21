# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Session Optimization

Before scanning the repository at the start of a session, check the persistent memory files for cached architecture patterns and file locations:

- `.claude/memory/MEMORY.md` - Index and user preferences
- `.claude/memory/backend-patterns.md` - Backend architecture patterns (ports, services, controllers, persistence, event sourcing conventions)
- `.claude/memory/file-map.md` - Key directories, file locations, and current implementation status

Use these instead of re-exploring the codebase each session. Update them when patterns change or new features are completed.

## Project Overview

PAPBattleTracker is a full-stack battle tracking application for tabletop RPGs. The project consists of:

- **Backend (Kotlin)** (`backend/`) - Spring Boot + Kotlin with hexagonal architecture and JWT authentication
- **Backend (Go)** (`backend-go/`) - Go + Gin with hexagonal architecture and JWT authentication (API-compatible with Kotlin backend)
- **Frontend (Angular)** (`frontend-angular/`) - Authentication-only (work in progress)
- **Frontend (Next.js)** (`frontend-next-js/`) - Feature-complete battle tracker (reference implementation)

The project is migrating battle tracker features from Next.js to Angular with a new backend using event sourcing. See `IMPLEMENTATION_PLAN.md` for the complete migration roadmap.

## Quick Start

```bash
# Backend (Kotlin)
cd backend
./gradlew bootRun                    # Start at http://localhost:8080

# Backend (Go)
cd backend-go
make run                             # Start at http://localhost:8080

# Angular Frontend
cd frontend-angular
npm start                            # Start at http://localhost:4200

# Next.js Reference
cd frontend-next-js
npm run dev                          # Start at http://localhost:3000
```

## Architecture Overview

Both backends and Angular frontend follow **hexagonal (ports and adapters) architecture**:

**Key Principle**: Dependencies flow inward toward the domain. Domain layer has NO dependencies on infrastructure or frameworks.

```
domain/              # Core business logic (entities, use cases, ports)
application/         # Use case implementations
infrastructure/      # External adapters (REST, database, security)
```

For detailed architecture guidance:
- Backend (Kotlin): See `backend/CLAUDE.md`
- Backend (Go): See `backend-go/CLAUDE.md`
- Angular: See `frontend-angular/CLAUDE.md`
- Next.js: See `frontend-next-js/CLAUDE.md`

## Definition of Done: Feature Completion Requires Tests

**CRITICAL**: A feature is NOT considered complete without comprehensive tests for both backend and frontend.

### Backend Test Requirements
- ✅ **Unit tests** for all domain logic (use cases, aggregates, value objects)
- ✅ **Integration tests** for API endpoints (controllers)
- ✅ **Repository tests** if using database
- ✅ **Minimum 80% code coverage** for new features
- ✅ All tests must pass before merging

### Frontend Test Requirements
- ✅ **Unit tests** for all use cases and services
- ✅ **Component tests** for all UI components (using @testing-library/angular)
- ✅ **Integration tests** for key user flows
- ✅ **Minimum 80% code coverage** for new features
- ✅ All tests must pass before merging

**When implementing a new feature:**
1. Write tests alongside implementation (TDD approach recommended)
2. Verify all tests pass: `npm test` (frontend) or `./gradlew test` (backend)
3. Check coverage meets minimum threshold
4. Only mark feature as complete when all tests are green ✅

## Technology Stack

### Backend (Kotlin)
- Spring Boot 3.5.7 + Kotlin 1.9.25 (Java 21)
- Spring Security with JWT
- H2 in-memory database
- JUnit 5 + Mockito-Kotlin

### Backend (Go)
- Go 1.21+ with Gin framework
- golang-jwt/jwt v5
- GORM + SQLite (in-memory)
- Go's built-in testing

### Angular Frontend
- Angular 18 (standalone components)
- RxJS + Signals for state management
- Jasmine + Karma for testing

### Next.js Frontend (Reference)
- Next.js 15 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- Jest + React Testing Library

## Project Structure

```
├── backend/                 # Spring Boot + Kotlin backend
│   ├── CLAUDE.md           # Kotlin backend guidance
│   ├── build.gradle.kts
│   └── src/
│       ├── main/kotlin/de/thomcz/pap/battle/backend/
│       │   ├── domain/         # Core business logic
│       │   ├── application/    # Use case implementations
│       │   └── infrastructure/ # Adapters (REST, JPA, Security)
│       └── test/kotlin/
│
├── backend-go/              # Go + Gin backend (API-compatible)
│   ├── CLAUDE.md           # Go backend guidance
│   ├── go.mod
│   ├── Makefile
│   ├── cmd/server/         # Application entry point
│   └── internal/
│       ├── domain/         # Core business logic
│       ├── application/    # Use case implementations
│       └── infrastructure/ # Adapters (REST, GORM, Security)
│
├── frontend-angular/        # Angular frontend (in progress)
│   ├── CLAUDE.md           # Angular-specific guidance
│   ├── package.json
│   └── src/app/
│       ├── core/           # Domain logic, ports, guards
│       ├── adapters/       # Implementations of ports
│       └── features/       # Feature modules
│
├── frontend-next-js/        # Next.js reference implementation
│   ├── CLAUDE.md           # Next.js-specific guidance
│   ├── package.json
│   └── src/app/
│       ├── components/     # Battle tracker components
│       ├── services/       # State management
│       └── types/          # TypeScript types
│
├── IMPLEMENTATION_PLAN.md   # Detailed migration roadmap
└── CLAUDE.md               # This file (general guidance)
```

## Current Implementation Status

### Backend Kotlin (`backend/`)
✅ User authentication (JWT, register, login)
✅ Hexagonal architecture setup
✅ H2 database integration
❌ Battle domain (event sourcing planned)

### Backend Go (`backend-go/`)
✅ User authentication (JWT, register, login)
✅ Hexagonal architecture setup
✅ SQLite database integration
✅ API-compatible with Kotlin backend
❌ Battle domain (event sourcing planned)

### Angular Frontend (`frontend-angular/`)
✅ User authentication UI
✅ Hexagonal architecture setup
✅ Signal-based state management
❌ Battle tracker features

### Next.js Frontend (`frontend-next-js/`)
✅ **FEATURE COMPLETE** - Full battle tracker implementation
✅ Creature management, combat system, attack dialog, combat log
✅ Import/export, localStorage persistence

## Event Sourcing Architecture (Planned)

Battle state will use event sourcing:

1. **Events**: Immutable records (e.g., `BattleCreated`, `CreatureAdded`, `DamageTaken`)
2. **Aggregate**: `Battle` entity stores events chronologically
3. **State Reconstruction**: Replay events to rebuild `BattleState`
4. **Persistence**: Events stored as JSON in H2

**Benefits**: Full audit trail, replay capability, undo/redo support, complete battle history

See `IMPLEMENTATION_PLAN.md` for detailed implementation steps.

## Migration Strategy

The project is migrating from Next.js (localStorage-based) to Angular + Backend (event sourcing):

1. **Reference Implementation**: Next.js app (`frontend-next-js/`) contains all battle tracker features
2. **Backend First**: Implement battle domain with event sourcing
3. **Angular UI**: Replicate Next.js features in Angular
4. **Feature Parity**: Each story in `IMPLEMENTATION_PLAN.md` implements end-to-end functionality

**Next Steps**: See `IMPLEMENTATION_PLAN.md` for 6 user stories covering battle management, creatures, combat, attacks, logging, and import/export.

## Development Workflow

### Working on Backend (Kotlin)
```bash
cd backend
# See backend/CLAUDE.md for detailed commands and patterns
./gradlew bootRun
./gradlew test
```

### Working on Backend (Go)
```bash
cd backend-go
# See backend-go/CLAUDE.md for detailed commands and patterns
make run
make test
```

### Working on Angular
```bash
cd frontend-angular
# See frontend-angular/CLAUDE.md for detailed commands and patterns
npm start
npm test
```

### Reference (Next.js)
```bash
cd frontend-next-js
# See frontend-next-js/CLAUDE.md for battle tracker architecture
npm run dev
npm test
```

## Security Notes

- **Passwords**: Hashed with BCrypt
- **Authentication**: JWT tokens (check `JwtTokenProvider` for expiration)
- **Session Management**: STATELESS (no server sessions)
- **CORS/CSRF**: Disabled in dev (enable for production)
- **H2 Console**: Accessible at `/h2-console` (disable in production)

## Additional Resources

- **Implementation Plan**: `IMPLEMENTATION_PLAN.md` - Complete migration roadmap with 6 user stories
- **Backend (Kotlin)**: `backend/CLAUDE.md` - Spring Boot patterns, testing, use case creation
- **Backend (Go)**: `backend-go/CLAUDE.md` - Go patterns, Gin framework, testing
- **Angular Details**: `frontend-angular/CLAUDE.md` - Component patterns, signals, hexagonal setup
- **Next.js Reference**: `frontend-next-js/CLAUDE.md` - Battle tracker architecture and features

## Backend Comparison

Both backends implement identical APIs with the same hexagonal architecture:

| Feature | Kotlin Backend | Go Backend |
|---------|---------------|------------|
| **Framework** | Spring Boot 3.5.7 | Gin |
| **Language** | Kotlin 1.9.25 | Go 1.21+ |
| **Database** | H2 (in-memory) | SQLite (in-memory) |
| **ORM** | Spring Data JPA | GORM |
| **DI** | Spring DI | Manual constructor injection |
| **Config** | application.properties | Environment variables |
| **API Endpoints** | ✅ Same | ✅ Same |
| **Request/Response** | ✅ Same | ✅ Same |
| **JWT Structure** | ✅ Same | ✅ Same |
| **Password Hashing** | ✅ BCrypt | ✅ BCrypt |
| **Architecture** | ✅ Hexagonal | ✅ Hexagonal |

**API Compatibility**: Both backends are drop-in replacements for each other. The Angular and Next.js frontends can work with either backend without code changes.

## Active Technologies
- H2 in-memory database (development), event sourcing with JSON event store (001-battle-tracker-features)
- Kotlin 1.9.25 (JVM 25), TypeScript (Angular 21.0.2) + Spring Boot 3.5.7, Spring Data JPA, Jackson (Kotlin backend); Angular 21, RxJS, Angular Signals (frontend) (002-creature-management)
- H2 in-memory database with event sourcing (events stored as JSON) (002-creature-management)
- H2 in-memory database with event sourcing pattern (events stored as JSON) (004-player-management)

## Recent Changes
- 001-battle-tracker-features: Added H2 in-memory database (development), event sourcing with JSON event store

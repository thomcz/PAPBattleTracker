# Phase 0 Research: Player Management

**Date**: 2026-02-19 | **Feature**: 004-player-management

## Executive Summary

No unresolved clarification items. All design decisions from the specification are confirmed and documented below. Research focused on best practices for player aggregate design and event sourcing patterns.

---

## Research Topics

### 1. Event Sourcing Pattern for Player Aggregate

**Decision**: Use event sourcing to persist player state, following the pattern established in feature 003.

**Rationale**:
- Provides complete audit trail of all player changes
- Enables easy undo/redo of player modifications in future features
- Maintains consistency with existing architecture (feature 001-003 all use events)
- Simplifies testing via event replay

**Implementation Approach**:
- Player aggregate stores a list of events (immutable)
- Each command (CreatePlayer, UpdatePlayer, DeletePlayer) generates events
- PlayerState is reconstructed by replaying events
- Events are persisted to H2 database (event store table)

**Alternatives Considered**:
- Direct entity persistence (vs events): Rejected because inconsistent with project architecture
- CQRS with separate read model: Rejected as over-engineering for MVP scope (20-100 players per session)

---

### 2. Player Aggregate Scope & Boundaries

**Decision**: Players are session-scoped and cannot be shared across sessions.

**Rationale**:
- Simplifies data isolation: no cross-session queries or references needed
- Prevents accidental reuse of outdated player data from different sessions
- Aligns with user mental model: "my players for this session"
- Reduces complexity of player deletion (no cascade check across sessions)

**Implementation Approach**:
- Player entity stores `sessionId` as foreign key
- Session context is required for all player operations
- Player repository queries are scoped: `findAllBySessionId(sessionId)`
- DELETE player cascade: only affects battles in the same session

**Alternatives Considered**:
- Global player pool shared across sessions: Rejected because users may need same character name in different campaigns
- Campaign-level scope: Rejected because feature currently only supports session-level context

---

### 3. Player Attributes & Data Model

**Decision**: Core attributes only: name, character class, level, maximum hit points.

**Rationale**:
- Minimal viable set: sufficient to describe a battle participant
- Reduces cognitive load during character creation
- Faster data entry (4 fields vs 10+)
- Extensible: future features can add armor class, initiative, abilities, etc.

**Implementation Approach**:
- Name: String, required, max 100 characters
- Character Class: String, required, max 50 characters (e.g., "Fighter", "Wizard", "Cleric")
- Level: Integer, required, range 1-20 (D&D standard)
- Max HP: Integer, required, range 1-1000

**Alternatives Considered**:
- Extended attributes (AC, initiative, saves): Rejected for MVP; marked as future enhancement
- Custom fields system: Rejected; adds complexity with minimal benefit for first iteration
- Predefined class templates: Rejected; player enters values directly (more flexible)

---

### 4. Delete Safety & Data Integrity

**Decision**: Soft delete with confirmation dialog to prevent accidental loss.

**Rationale**:
- Users can restore soft-deleted players if mistake is detected within same session
- Audit trail preserved: deleted player still appears in event log
- Confirmation dialog prevents finger slips in UI
- Aligns with constitution principle: user experience consistency

**Implementation Approach**:
- PlayerDeleted event marks player as deleted (state flag)
- UI filters deleted players from normal list view
- DELETE endpoint requires explicit user confirmation before issuing command
- Archive/restore functionality can be added in future features

**Alternatives Considered**:
- Hard delete immediately: Rejected due to data loss risk
- Trash bin/archive system: Rejected as over-engineering for MVP

---

### 5. Integration with Existing Architecture

**Decision**: Build on event sourcing and hexagonal architecture from features 001-003.

**Rationale**:
- Consistency: avoids mixed architectural patterns
- Reuse: leverage existing event store infrastructure
- Team alignment: all developers familiar with established patterns
- Risk mitigation: proven patterns reduce bugs

**Key Integration Points**:
1. **Backend**:
   - Reuse EventStore from feature 003 (event persistence)
   - Reuse BaseAggregate pattern (aggregate base class)
   - Reuse JWT authentication from feature 001

2. **Frontend**:
   - Reuse signal-based state management pattern from feature 003
   - Reuse HTTP interceptors for JWT from feature 001
   - Reuse component library and design patterns

**Alternatives Considered**:
- New architecture style: Rejected; incompatible with existing code
- Direct database persistence: Rejected; inconsistent with event sourcing choice in feature 003

---

### 6. Testing Approach & Coverage

**Decision**: Test-first development with 80% minimum coverage for domain logic.

**Rationale**:
- Constitution requirement: TDD is non-negotiable
- Reduces bugs: tests written before edge cases are discovered
- Serves as documentation: test scenarios clarify expected behavior
- Easier refactoring: comprehensive tests provide safety net

**Implementation Approach**:

**Backend (Kotlin)**:
- Unit tests: PlayerAggregate behavior, use cases, value object validation
- Integration tests: REST endpoint contracts, event store persistence
- Coverage: ≥80% for domain layer (Player, events, use cases)

**Frontend (Angular)**:
- Unit tests: PlayerService, store, use cases
- Component tests: PlayerListComponent, PlayerFormComponent validation
- Coverage: ≥80% for core player module

**Test Examples**:
- Test: Player creation with valid data generates PlayerCreated event ✓
- Test: Duplicate player names allowed within same session ✓
- Test: Negative HP prevented at create/edit ✓
- Test: Delete confirmation required before issuing DeletePlayer command ✓

---

### 7. Performance & Scale Assumptions

**Decision**: Support 20-100 players per session without performance degradation.

**Rationale**:
- Typical RPG campaign: 4-8 player characters + 10-20 NPC allies
- Safe upper bound: 100 players allows for large-scale war games or NPC armies
- Performance threshold: 500ms max load time for list (spec requirement)

**Implementation Approach**:
- Use indices on `sessionId` and `playerId` for fast queries
- Pagination or virtual scrolling if list exceeds 100 items
- In-memory caching for frequently accessed session players

**No Scale Concerns Expected** for MVP scope (single-user session management).

---

## Conclusion

All design decisions are aligned with:
- ✅ Hexagonal architecture discipline (constitution)
- ✅ Test-driven development requirements (constitution)
- ✅ User experience consistency (constitution)
- ✅ Performance standards (constitution + spec)
- ✅ Project technology stack (Kotlin + Angular)
- ✅ Established patterns (features 001-003)

**Ready to proceed to Phase 1: Design & Contracts**

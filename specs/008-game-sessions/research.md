# Research: Game Sessions

**Feature**: 008-game-sessions
**Date**: 2026-02-24

## Decision 1: Session as Event-Sourced Aggregate

**Decision**: Implement Session as a new event-sourced aggregate root, following the same pattern as Battle, Player, and BeasteryCreature.

**Rationale**: The existing codebase consistently uses event sourcing for all domain aggregates. Session has a clear lifecycle (planned → started → finished) that maps naturally to events. Consistency with existing patterns reduces learning curve and ensures compatibility with the event store infrastructure.

**Alternatives considered**:
- Simple CRUD entity (no event sourcing): Rejected because it breaks the established pattern and loses audit trail benefits.
- Embed session concept into Battle: Rejected because sessions are a distinct aggregate with their own lifecycle independent of individual battles.

## Decision 2: Battle-Session Association

**Decision**: Add a `sessionId` field to the existing Battle aggregate. Battles require a parent session (no standalone battles after this feature).

**Rationale**: The spec explicitly states all battles must belong to a session. A foreign key relationship from Battle to Session is the simplest approach. The BattleCreated event will include `sessionId`.

**Alternatives considered**:
- Session stores a list of battle IDs: Rejected because it couples Session events to Battle lifecycle. Better to let Battle own the relationship.
- Optional sessionId (backward compatible): Rejected per spec — all battles must belong to a session.

## Decision 3: Session State Machine

**Decision**: Use a `SessionStatus` enum with values `PLANNED`, `STARTED`, `FINISHED` and enforce transitions in the domain aggregate.

**Rationale**: Follows the same pattern as `CombatStatus` in Battle. State transitions enforced in domain logic before event emission. Transition rules: PLANNED → STARTED → FINISHED (sequential, one-directional).

**Alternatives considered**:
- Free-form state changes: Rejected because the spec requires strict ordering.
- State pattern (separate classes per state): Over-engineering for 3 simple states with linear transitions.

## Decision 4: Frontend Session Feature

**Decision**: Add a new `SessionPort`, `SessionApiAdapter`, session use cases, and a session feature module following existing patterns.

**Rationale**: Consistent with the existing hexagonal architecture in the Angular frontend. The dashboard (`/home`) will show sessions instead of (or in addition to) battles directly. Navigation: dashboard → session list → session detail (with battles).

**Alternatives considered**:
- Extend BattlePort with session methods: Rejected because sessions are a separate domain concept.

## Decision 5: Routing Changes

**Decision**: Add `/sessions` and `/sessions/:id` routes. The dashboard (`/home`) will display sessions. Battle detail remains at `/battles/:id` but is now accessed through a session.

**Rationale**: Sessions become the top-level organizational unit. Users navigate: Dashboard (sessions) → Session Detail (battles) → Battle Detail (combat).

**Alternatives considered**:
- Nested routes `/sessions/:id/battles/:id`: More RESTful but adds routing complexity. Flat routes are simpler and match existing patterns.

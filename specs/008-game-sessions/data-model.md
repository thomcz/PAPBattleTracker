# Data Model: Game Sessions

**Feature**: 008-game-sessions
**Date**: 2026-02-24

## Entities

### Session (New Aggregate Root)

| Field     | Type          | Constraints                          |
|-----------|---------------|--------------------------------------|
| sessionId | UUID          | Primary key, generated on creation   |
| userId    | UUID          | Required, owner of the session       |
| name      | String        | Required, 1-100 characters           |
| status    | SessionStatus | Required, default PLANNED            |

**Enum: SessionStatus**
- `PLANNED` — Initial state, session is being prepared
- `STARTED` — Session is actively in progress
- `FINISHED` — Session is complete (terminal state)

**State Transitions**:
```
PLANNED → STARTED → FINISHED
```
- No reverse transitions allowed
- No skipping states (PLANNED cannot go directly to FINISHED)

**Relationships**:
- Session belongs to one User (via userId)
- Session has zero or more Battles

### Battle (Modified Aggregate)

| Field     | Type   | Constraints                                  | Change    |
|-----------|--------|----------------------------------------------|-----------|
| battleId  | UUID   | Primary key                                  | Existing  |
| sessionId | UUID   | Required, references Session                 | **New**   |
| userId    | UUID   | Required, owner                              | Existing  |
| name      | String | Required                                     | Existing  |
| status    | CombatStatus | Required                                | Existing  |

**New constraint**: Battles can only be created within a session that is NOT in `FINISHED` status.

## Events

### Session Events (New)

| Event            | Fields                                    | Trigger                     |
|------------------|-------------------------------------------|-----------------------------|
| SessionCreated   | sessionId, userId, name, timestamp        | User creates a session      |
| SessionStarted   | sessionId, timestamp                      | User starts a session       |
| SessionFinished  | sessionId, timestamp                      | User finishes a session     |
| SessionRenamed   | sessionId, name, timestamp                | User renames a session      |
| SessionDeleted   | sessionId, timestamp                      | User deletes a session      |

### Battle Events (Modified)

| Event          | Fields                                          | Change   |
|----------------|--------------------------------------------------|----------|
| BattleCreated  | battleId, userId, name, **sessionId**, timestamp | **Modified** — adds sessionId |

## Event Store Tables

### SessionEntity (New metadata table)

| Column        | Type    | Notes                    |
|---------------|---------|--------------------------|
| session_id    | UUID    | PK                       |
| user_id       | UUID    | Indexed                  |
| name          | VARCHAR(100) |                     |
| status        | VARCHAR(20) | SessionStatus enum name |
| created_at    | TIMESTAMP |                        |
| last_modified | TIMESTAMP |                        |
| event_count   | INT     | Total events             |

**Indexes**:
- `idx_sessions_user_id` — Fast lookup by owner
- `idx_sessions_status` — Status filtering

### SessionEventEntity (New event table)

Same structure as existing EventEntity but for session events:

| Column          | Type    | Notes                        |
|-----------------|---------|------------------------------|
| event_id        | UUID    | PK                           |
| session_id      | UUID    | FK to SessionEntity          |
| event_type      | VARCHAR | Event class name             |
| event_data      | TEXT    | JSON serialized event        |
| sequence_number | INT     | Ordering within session      |
| timestamp       | TIMESTAMP |                            |
| user_id         | UUID    |                              |

**Indexes**:
- `idx_session_events_session_id`
- `uk_session_sequence` — Unique (session_id, sequence_number)

### BattleEntity (Modified)

| Column     | Type | Change  |
|------------|------|---------|
| session_id | UUID | **New** — FK to SessionEntity |

**New index**: `idx_battles_session_id` — Fast lookup of battles within a session

## Cascade Behavior

- Deleting a Session deletes all its SessionEvents (CASCADE)
- Deleting a Session deletes all its Battles and their BattleEvents (CASCADE)

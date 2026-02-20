# Phase 1: Data Model - Player Management

**Date**: 2026-02-19 | **Feature**: 004-player-management

## Domain Model Overview

```
┌─────────────────────────────────────────────────────────────┐
│ Session (exists - no changes)                              │
│ ├─ sessionId: UUID                                          │
│ ├─ createdAt: Timestamp                                     │
│ └─ [contains multiple players]                              │
└─────────────────────────────────────────────────────────────┘
                            │
                    (1:N relationship)
                            │
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
┌──────────────────────┐            ┌─────────────────────┐
│ Player (NEW)         │            │ Battle (exists)     │
│ Aggregate Root       │            │ ├─ battleId: UUID   │
│                      │            │ └─ participants:[] │
│ Attributes:          │            │    [references     │
│ ├─ playerId: UUID    │◄───────────┤     Player IDs]    │
│ ├─ sessionId: UUID   │  (M:N ref) └─────────────────────┘
│ ├─ name: String      │
│ ├─ characterClass:   │
│ │  String            │
│ ├─ level: Int (1-20) │
│ ├─ maxHp: Int        │
│ ├─ isDeleted: Bool   │
│ ├─ createdAt: Time   │
│ └─ updatedAt: Time   │
└──────────────────────┘
        │
        │ contains (events)
        ↓
┌──────────────────────────────────────────┐
│ Events (Event Store)                     │
├──────────────────────────────────────────┤
│ PlayerCreated Event                      │
│ ├─ playerId: UUID                        │
│ ├─ sessionId: UUID                       │
│ ├─ name: String                          │
│ ├─ characterClass: String                │
│ ├─ level: Int                            │
│ ├─ maxHp: Int                            │
│ └─ timestamp: Timestamp                  │
├──────────────────────────────────────────┤
│ PlayerUpdated Event                      │
│ ├─ playerId: UUID                        │
│ ├─ sessionId: UUID                       │
│ ├─ updatedFields: Map<String, Any>       │
│ └─ timestamp: Timestamp                  │
├──────────────────────────────────────────┤
│ PlayerDeleted Event                      │
│ ├─ playerId: UUID                        │
│ ├─ sessionId: UUID                       │
│ └─ timestamp: Timestamp                  │
└──────────────────────────────────────────┘
```

---

## Entity Definitions

### Player Aggregate

**Purpose**: Represents a reusable player character within a session.

**Type**: Aggregate Root (manages its own state via events)

#### Fields

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `playerId` | UUID | Yes | Unique per session | Primary identifier (auto-generated) |
| `sessionId` | UUID | Yes | Foreign key to Session | Groups players by session |
| `name` | String | Yes | 1-100 chars, non-empty | Character name |
| `characterClass` | String | Yes | 1-50 chars, non-empty | Class/type (Fighter, Wizard, etc.) |
| `level` | Integer | Yes | 1-20 | Character level |
| `maxHp` | Integer | Yes | 1-1000 | Maximum hit points |
| `isDeleted` | Boolean | No | Default: false | Soft delete flag |
| `createdAt` | Timestamp | System | Auto | Creation timestamp |
| `updatedAt` | Timestamp | System | Auto | Last modification timestamp |

#### Validation Rules

1. **Name**:
   - Must not be null or empty
   - Max 100 characters
   - Can contain spaces and special characters
   - Duplicate names allowed within same session

2. **Character Class**:
   - Must not be null or empty
   - Max 50 characters
   - Examples: "Fighter", "Wizard", "Cleric", "Rogue"
   - No predefined enum (allows game system flexibility)

3. **Level**:
   - Must be between 1 and 20 (inclusive)
   - Integer only (no decimals)
   - Typical RPG standard

4. **Max HP**:
   - Must be between 1 and 1000
   - Integer only
   - Positive values only (no 0 or negative allowed at creation)

5. **Session Scope**:
   - Player must belong to valid session
   - Cannot transfer between sessions
   - Deletion only affects battles in same session

#### State Transitions

```
┌──────────────────┐
│  CREATED         │
│ (Initial state)  │
└────────┬─────────┘
         │ PlayerCreated
         ↓
┌──────────────────┐      PlayerUpdated ┌──────────────────┐
│  ACTIVE          │◄──────────────────→│  ACTIVE (edited) │
│ (Normal state)   │                    │ (Normal state)   │
└────────┬─────────┘                    └──────────────────┘
         │ PlayerDeleted
         ↓
┌──────────────────┐
│  DELETED         │
│ (Soft delete)    │
└──────────────────┘
```

#### Relationships

- **To Session**: M:1 - Each player belongs to exactly one session
- **To Battle**: M:N - Players can be added to multiple battles, battles can contain multiple players (via creature/participant references)

---

## Event Definitions

### PlayerCreated Event

**Triggered**: When a new player is created

**Fields**:
- `aggregateId`: playerId (UUID)
- `aggregateType`: "Player" (String)
- `eventType`: "PlayerCreated" (String)
- `sessionId`: UUID (context)
- `name`: String
- `characterClass`: String
- `level`: Integer
- `maxHp`: Integer
- `timestamp`: ISO8601 Timestamp
- `version`: 1 (event version)

**Validation** (during event creation):
- Name, characterClass must not be empty
- Level must be 1-20
- MaxHp must be 1-1000

**Example**:
```json
{
  "aggregateId": "550e8400-e29b-41d4-a716-446655440000",
  "aggregateType": "Player",
  "eventType": "PlayerCreated",
  "sessionId": "7c6e3b7b-5f8c-4a2d-9e1f-8b5c3d8e7f6a",
  "data": {
    "name": "Aragorn",
    "characterClass": "Ranger",
    "level": 10,
    "maxHp": 85
  },
  "timestamp": "2026-02-19T10:30:00Z",
  "version": 1
}
```

---

### PlayerUpdated Event

**Triggered**: When an existing player is modified

**Fields**:
- `aggregateId`: playerId (UUID)
- `aggregateType`: "Player"
- `eventType`: "PlayerUpdated"
- `sessionId`: UUID
- `changes`: Map of field name → new value
- `timestamp`: ISO8601 Timestamp
- `version`: Increment from previous event

**Allowed Changes**:
- `name`: String
- `characterClass`: String
- `level`: Integer
- `maxHp`: Integer

**Validation**:
- Same as PlayerCreated for each field being updated
- At least one field must change

**Example**:
```json
{
  "aggregateId": "550e8400-e29b-41d4-a716-446655440000",
  "aggregateType": "Player",
  "eventType": "PlayerUpdated",
  "sessionId": "7c6e3b7b-5f8c-4a2d-9e1f-8b5c3d8e7f6a",
  "data": {
    "changes": {
      "level": 11,
      "maxHp": 90
    }
  },
  "timestamp": "2026-02-19T11:00:00Z",
  "version": 2
}
```

---

### PlayerDeleted Event

**Triggered**: When a player is deleted (soft delete)

**Fields**:
- `aggregateId`: playerId (UUID)
- `aggregateType`: "Player"
- `eventType`: "PlayerDeleted"
- `sessionId`: UUID
- `timestamp`: ISO8601 Timestamp
- `version`: Increment from previous event

**Behavior**:
- Sets `isDeleted` flag to true
- Player excluded from normal list queries
- Events preserved in event store (audit trail)

**Example**:
```json
{
  "aggregateId": "550e8400-e29b-41d4-a716-446655440000",
  "aggregateType": "Player",
  "eventType": "PlayerDeleted",
  "sessionId": "7c6e3b7b-5f8c-4a2d-9e1f-8b5c3d8e7f6a",
  "timestamp": "2026-02-19T12:00:00Z",
  "version": 3
}
```

---

## Repository Interface (Port)

```kotlin
// Domain Port - Language agnostic
interface PlayerRepository {
  fun save(player: Player): UUID  // Returns playerId
  fun findById(playerId: UUID, sessionId: UUID): Player?
  fun findAllBySessionId(sessionId: UUID): List<Player>
  fun findActiveBySessionId(sessionId: UUID): List<Player>  // Excludes deleted
  fun delete(playerId: UUID, sessionId: UUID): Boolean
}
```

---

## Database Schema (Implementation Detail)

### H2 Event Store Table

```sql
CREATE TABLE events (
  event_id UUID PRIMARY KEY DEFAULT RANDOM_UUID(),
  aggregate_id UUID NOT NULL,
  aggregate_type VARCHAR(50) NOT NULL,  -- e.g., "Player"
  event_type VARCHAR(50) NOT NULL,      -- e.g., "PlayerCreated"
  session_id UUID NOT NULL,
  event_data JSON NOT NULL,             -- Event payload as JSON
  version INT NOT NULL,                 -- Event version within aggregate
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_aggregate (aggregate_id),
  INDEX idx_session (session_id),
  UNIQUE (aggregate_id, version)
);
```

### Optional: Player Projection Table (Read Model)

For optimized list queries, can maintain a denormalized player table:

```sql
CREATE TABLE player (
  player_id UUID PRIMARY KEY,
  session_id UUID NOT NULL,
  name VARCHAR(100) NOT NULL,
  character_class VARCHAR(50) NOT NULL,
  level INT NOT NULL,
  max_hp INT NOT NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  INDEX idx_session (session_id),
  INDEX idx_deleted (session_id, is_deleted)
);
```

---

## State Reconstruction Algorithm

**Event Replay** (reconstruct Player from events):

```
1. Load all events for playerId in order (by version)
2. Initialize empty Player with playerId
3. For each event:
   - If PlayerCreated: set all initial attributes
   - If PlayerUpdated: apply field updates
   - If PlayerDeleted: set isDeleted = true
4. Return reconstructed Player state
```

**Example**:
```
Events:
[1] PlayerCreated: name="Aragorn", class="Ranger", level=10, maxHp=85
[2] PlayerUpdated: level=11, maxHp=90
[3] PlayerUpdated: name="Aragorn the Grey"
[4] PlayerDeleted

Result: Player(
  playerId=...,
  name="Aragorn the Grey",
  characterClass="Ranger",
  level=11,
  maxHp=90,
  isDeleted=true
)
```

---

## Integration Points

### With Session Entity
- Player stores `sessionId` (foreign key)
- Session context required for all player queries
- Validate that provided `sessionId` exists before player operations

### With Battle Entity
- Battle stores `participantPlayerIds: List<UUID>`
- On player delete:
  - Check if player is in active battles (same session)
  - Option 1: Prevent deletion if used in active battles
  - Option 2: Remove from battles and delete (chosen for MVP)
- On player update: battles see updated values on next load

### With Authentication (Feature 001)
- All operations require authenticated user
- Session must belong to current user (authorization check)
- Only session owner can manage session's players

---

## Performance Considerations

- **Indices**: sessionId, playerId for fast lookups
- **Event Replay**: Should complete <1s for typical player (5-10 events)
- **List Queries**: Index on `(sessionId, isDeleted)` for fast active player list
- **Caching**: Consider caching active player list per session (TTL: 5-10 minutes)

---

## Testing Data

### Happy Path Player
```
name: "Legolas"
characterClass: "Ranger"
level: 8
maxHp: 75
```

### Edge Cases
```
1. Minimum values: level=1, maxHp=1
2. Maximum values: level=20, maxHp=1000
3. Long name: 100 character string
4. Special characters: "D'Artagnan", "Thêo'rix"
```

---

## Constraints & Guarantees

✅ **Atomicity**: Each event is atomic (all-or-nothing persistence)
✅ **Consistency**: Event replay always produces same state
✅ **Isolation**: Each player independent (no cross-player transactions)
✅ **Durability**: Events persisted to H2 (survives restarts)
✅ **Auditability**: All changes preserved in event stream
✅ **Session Isolation**: Players cannot reference other sessions

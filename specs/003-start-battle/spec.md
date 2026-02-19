# Feature Specification: Start and Track Battle

**Feature Branch**: `003-start-battle`
**Created**: 2026-02-18
**Status**: Draft
**Input**: User description: "next i want to start a battle and track the battle"

## Clarifications

### Session 2026-02-18

- Q: How should initiative ties be resolved when multiple creatures have equal initiative? → A: Creature order in selection (first selected creature acts first)
- Q: Should battle automatically end when all creatures are defeated or require GM confirmation? → A: GM must manually end battle (prevents accidental transitions)
- Q: How does GM provide the initiative throw value during battle creation? → A: GM enters a d20 roll result for each creature; final initiative = creature modifier + roll
- Q: How should defeated creatures be visually distinguished in the UI? → A: Grayed out (50% opacity) with a "Defeated" text badge

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Create a New Battle (Priority: P1)

A Game Master wants to initiate a new battle encounter with selected creatures. They need to specify which creatures participate, establish initiative order, and begin the first round of combat.

**Why this priority**: This is the critical entry point for the entire battle tracking experience. Without the ability to create a battle, users cannot access any other features. This delivers the immediate value of starting combat.

**Independent Test**: Can be fully tested by creating a battle with creatures and verifying the battle is ready to track turns and actions.

**Acceptance Scenarios**:

1. **Given** a user is authenticated and creatures exist in the system, **When** they select "Create Battle" and choose 2+ creatures then enter a d20 roll result for each creature, **Then** a new battle is created with initial turn order calculated as (creature initiative modifier + d20 roll)
2. **Given** a battle creation form is open, **When** the user attempts to create a battle with fewer than 2 creatures, **Then** an error message appears explaining that at least 2 creatures are required
3. **Given** a user has created a battle, **When** they view the battle details, **Then** they see all participating creatures, their HP/stats, and the current turn order
4. **Given** a new battle is created, **When** the first creature's turn begins, **Then** the battle round counter shows "Round 1" and the turn tracker displays the current actor

---

### User Story 2 - Track Combat Rounds and Turns (Priority: P1)

During an active battle, the Game Master needs to manage turn progression, track which creature's turn it is, and move through rounds systematically. They need clear visibility of turn order and current battle state.

**Why this priority**: This is essential for core battle flow. Without effective turn tracking, the battle system is unusable. This is required to deliver any combat functionality.

**Independent Test**: Can be fully tested by advancing turns in an active battle and verifying turn order updates correctly across all rounds.

**Acceptance Scenarios**:

1. **Given** a battle is in progress on Round 1 with Creature A's turn, **When** the GM advances to the next turn, **Then** the system moves to Creature B's turn and displays their stats/actions
2. **Given** the last creature in turn order takes their action, **When** the GM advances the turn, **Then** the round increments to the next number and turn order resets to the first creature
3. **Given** a battle is active, **When** the GM views the battle screen, **Then** they see: current round number, current actor name/initiative, remaining creatures in initiative order, and initiative bonus/roll for each
4. **Given** a creature has taken damage, **When** reviewing the battle state, **Then** their current HP is displayed alongside their maximum HP (e.g., "8/15 HP")

---

### User Story 3 - Apply Damage and Track Creature State (Priority: P1)

Combat encounters require tracking damage dealt to creatures. The Game Master needs to quickly apply damage, observe HP changes, and recognize when creatures are defeated (HP ≤ 0).

**Why this priority**: Damage tracking is the core mechanical interaction in combat. Without this, combat has no consequences or progression. This enables the fundamental combat loop.

**Independent Test**: Can be fully tested by applying damage to a creature and verifying HP updates and defeated state calculation.

**Acceptance Scenarios**:

1. **Given** a creature with 10 HP is in combat, **When** damage of 3 HP is applied, **Then** the creature's HP updates to 7 HP and is displayed in the UI
2. **Given** a creature with 5 HP remaining, **When** damage of 5 HP is applied, **Then** the creature's HP shows 0 and they are marked as defeated
3. **Given** a creature with 5 HP remaining, **When** damage of 10 HP is applied, **Then** the creature's HP shows 0 (not negative) and they are marked as defeated
4. **Given** a defeated creature (HP ≤ 0), **When** reviewing the battle, **Then** they are visually distinguished from active creatures (e.g., marked as "Defeated" or shown with different styling)

---

### User Story 4 - View Battle History and Combat Log (Priority: P2)

As combat progresses, the Game Master wants a record of events that have occurred (damage dealt, status changes, defeats). This provides a reference for reviewing what happened and supports replaying the battle.

**Why this priority**: Combat logs provide context and dispute resolution during gameplay. While not required to play, they significantly improve user experience by providing accountability and allowing review of past actions.

**Independent Test**: Can be fully tested by applying damage/status changes and verifying they appear in the combat log.

**Acceptance Scenarios**:

1. **Given** a creature has taken damage in combat, **When** the GM views the combat log, **Then** an entry appears showing: "[Creature Name] took [X] damage, now at [Y] HP"
2. **Given** multiple actions have occurred, **When** the GM views the combat log, **Then** entries are ordered chronologically from oldest to newest
3. **Given** a creature is defeated, **When** the GM views the combat log, **Then** an entry shows "[Creature Name] has been defeated"
4. **Given** a battle is progressing, **When** a new round begins, **Then** the combat log shows "Round [N] begins"

---

### User Story 5 - End Battle and View Final Results (Priority: P2)

When combat concludes (all enemy creatures defeated or retreat), the GM needs to end the battle and see a summary of what occurred. This includes final state of all creatures and battle duration.

**Why this priority**: Battle conclusion is important for game flow completeness. While technically optional for ongoing play, it provides closure and record-keeping for campaigns.

**Independent Test**: Can be fully tested by ending a battle and verifying summary displays correctly.

**Acceptance Scenarios**:

1. **Given** a battle is in progress, **When** the GM chooses to end the battle, **Then** the battle transitions to a completed state and displays final results
2. **Given** a battle has ended, **When** viewing the results screen, **Then** it shows: number of rounds fought, all creatures and their final HP state, and a timestamp
3. **Given** a completed battle, **When** the user returns to the battle list, **Then** the battle appears in history with a status of "Completed"

---

### Edge Cases

- **All creatures defeated**: Battle remains active until GM manually ends it (prevents accidental transition)
- **Negative damage (healing)**: Rejected or treated as 0 damage; no HP increase
- **Initiative order mid-combat**: Initiative is locked at battle start and cannot change during combat
- **Damage to defeated creature**: Action is allowed but doesn't further reduce HP below 0
- **Initiative ties (equal values)**: Ties are broken by creature selection order (first selected acts first with tied initiative)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create a new battle by selecting 2 or more existing creatures and entering a d20 roll result for each
- **FR-002**: System MUST calculate initiative order as (creature initiative modifier + GM-entered d20 roll), with ties broken by creature selection order
- **FR-003**: System MUST display current turn information (round number, current actor, remaining turn order)
- **FR-004**: System MUST allow advancing to the next turn/round with automatic order progression
- **FR-005**: System MUST apply damage to creatures and update their HP display
- **FR-006**: System MUST mark creatures as defeated when HP ≤ 0 and prevent further HP reduction
- **FR-007**: System MUST maintain a chronological battle log of all significant events (damage, status changes, round progression)
- **FR-008**: System MUST require users to manually end an active battle (battle remains active even if all creatures are defeated)
- **FR-009**: System MUST display defeated creatures as grayed out (50% opacity) with a "Defeated" text badge
- **FR-010**: System MUST allow users to view final results after manually ending a battle
- **FR-011**: System MUST persist all battle data (creatures, actions, state) using event sourcing architecture
- **FR-012**: System MUST track battle completion status and display it in battle history

### Key Entities

- **Battle**: Represents a single combat encounter with metadata (created timestamp, round number, status: active/completed, list of participating creatures)
- **BattleTurn**: Represents a single creature's turn in combat (creature reference, action performed, timestamp)
- **BattleEvent**: Immutable record of battle state changes for event sourcing (event type: DamageApplied, RoundAdvanced, BattleStarted, BattleEnded, etc.; timestamp; creature reference; relevant data)
- **BattleCreature**: Combat-specific creature snapshot (creature reference, current HP, status, initiative value, original stats)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: User can create and start a new battle with 2+ creatures in under 30 seconds
- **SC-002**: Turn advancement feels responsive—next turn updates display in under 500ms
- **SC-003**: Damage application is intuitive—user can apply damage to a creature in 2 clicks or less
- **SC-004**: Battle state accuracy—HP values and defeat status always match the source of truth (no display inconsistencies)
- **SC-005**: Battle history completeness—100% of significant events are logged (damage application, round changes, defeats, battle end)
- **SC-006**: Combat logs are retrievable—user can view full battle history for any completed battle within 2 seconds
- **SC-007**: New feature users successfully complete their first battle without help documentation (70% success rate on first attempt)

## Assumptions

1. **Initiative Calculation**: Initiative = creature initiative modifier + GM-entered d20 roll result; ties are broken by creature selection order (first selected wins tiebreaker)
2. **Damage Floor**: HP cannot go below 0; negative damage values are rejected or treated as 0
3. **Event Sourcing**: All battle state changes are recorded as immutable events and can be replayed to reconstruct full battle history
4. **Creature Immutability**: Creature stats are snapshotted at battle start; changes to creature master records don't affect ongoing battles
5. **Manual Battle End**: Battles remain in "active" state even when all creatures are defeated; GM must explicitly click "End Battle" to finalize
6. **Single Battle Focus**: Users work with one active battle at a time; multiple concurrent battles are out of scope for this feature
7. **User Role**: Only authenticated users can create/manage battles (no anonymous battle tracking)
8. **Round Structure**: Traditional tabletop RPG round structure (all creatures take 1 turn per round, in initiative order)

## Dependencies

- **Requires**: User Authentication (from 001-battle-tracker-features)
- **Requires**: Creature Management (from 002-creature-management)
- **Blocks**: None (other features can build on this)

## Technology Constraints (Framework-Agnostic)

- Battle state MUST support event sourcing (immutable event stream)
- Battle MUST be retrievable by ID
- Battle history MUST be queryable and sortable by date/status
- System MUST support real-time UI updates when battle state changes

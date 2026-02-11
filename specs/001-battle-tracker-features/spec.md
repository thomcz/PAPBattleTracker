# Feature Specification: Battle Tracker Core Features

**Feature Branch**: `001-battle-tracker-features`
**Created**: 2026-02-11
**Status**: Draft
**Input**: User description: "this project is a battle tracking app for pen and paper i implemented login now help to introduce more featurres"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Battle Session Management (Priority: P1)

As a Game Master, I need to create, start, and manage battle sessions so that I can track combat encounters during my tabletop RPG sessions.

**Why this priority**: This is the foundational feature that enables all other battle tracking functionality. Without the ability to create and manage battles, no other features can function.

**Independent Test**: Can be fully tested by creating a new battle, starting combat, and ending combat. Delivers immediate value by providing a structured combat framework.

**Acceptance Scenarios**:

1. **Given** I am logged in, **When** I create a new battle session, **Then** I see an empty battle workspace with options to add creatures
2. **Given** I have created a battle with creatures, **When** I start combat, **Then** creatures are sorted by initiative order and combat begins
3. **Given** combat is active, **When** I pause combat, **Then** the battle state is preserved with all creatures intact
4. **Given** combat is active, **When** I end combat, **Then** player creatures remain but monster creatures are removed
5. **Given** I have multiple battle sessions, **When** I switch between them, **Then** each battle's state is preserved independently

---

### User Story 2 - Creature Management (Priority: P1)

As a Game Master, I need to add, edit, and remove creatures (players and monsters) so that I can populate battles with combatants.

**Why this priority**: Equal priority to Battle Session Management because battles require creatures. This is the second half of the MVP - you can't have combat without combatants.

**Independent Test**: Can be fully tested by adding various creatures with different attributes, editing them, and removing them. Delivers value by allowing battle setup.

**Acceptance Scenarios**:

1. **Given** I have a battle session open, **When** I add a new creature with name, HP, initiative, and armor class, **Then** the creature appears in the battle roster
2. **Given** I have added creatures, **When** I edit a creature's attributes (HP, initiative, AC), **Then** the changes are immediately reflected
3. **Given** I have creatures in battle, **When** I remove a creature, **Then** it is deleted from the battle and turn order updates accordingly
4. **Given** I am adding a creature, **When** I specify it as a "player" type, **Then** it persists through combat end
5. **Given** I am adding a creature, **When** I specify it as a "monster" type, **Then** it is automatically removed when combat ends
6. **Given** I have multiple creatures, **When** combat starts, **Then** they are sorted by initiative (highest first)

---

### User Story 3 - Hit Point Tracking (Priority: P2)

As a Game Master, I need to track and modify creature HP during combat so that I can manage damage, healing, and creature death.

**Why this priority**: Critical for combat but depends on having creatures in a battle first. This is the primary mechanic that makes combat meaningful.

**Independent Test**: Can be fully tested by adding creatures and applying damage/healing. Delivers value by enabling the core combat mechanic of HP management.

**Acceptance Scenarios**:

1. **Given** a creature has current HP, **When** I apply damage, **Then** current HP decreases by the damage amount
2. **Given** a creature has current HP, **When** I apply healing, **Then** current HP increases but does not exceed max HP
3. **Given** a creature's current HP reaches zero, **When** the UI updates, **Then** the creature is marked as defeated/unconscious
4. **Given** a creature is defeated, **When** I apply healing, **Then** current HP increases and the creature is no longer marked as defeated
5. **Given** I apply damage or healing, **When** combat log is active, **Then** the action is recorded with timestamp and round number

---

### User Story 4 - Turn Order and Round Tracking (Priority: P2)

As a Game Master, I need automatic turn order management and round counting so that I can focus on narration instead of tracking whose turn it is.

**Why this priority**: Essential for structured combat but requires creatures and HP tracking. Automates a tedious bookkeeping task.

**Independent Test**: Can be fully tested by starting combat with multiple creatures and advancing through turns. Delivers value by automating turn tracking.

**Acceptance Scenarios**:

1. **Given** combat has started, **When** I view the creature list, **Then** the current turn is clearly indicated
2. **Given** it is a creature's turn, **When** I advance to next turn, **Then** the indicator moves to the next creature in initiative order
3. **Given** the last creature in initiative order finishes their turn, **When** I advance to next turn, **Then** the round counter increments and turn returns to first creature
4. **Given** combat is active, **When** I view the battle, **Then** the current round number is displayed prominently
5. **Given** I add or remove creatures mid-combat, **When** turn order updates, **Then** the current turn indicator adjusts appropriately

---

### User Story 5 - Combat Log (Priority: P3)

As a Game Master, I need a chronological combat log so that I can review what happened during the session and track important events.

**Why this priority**: Valuable for record-keeping but not essential for basic combat. Enhances the experience rather than enabling core functionality.

**Independent Test**: Can be fully tested by performing combat actions and verifying they appear in the log. Delivers value by providing combat history.

**Acceptance Scenarios**:

1. **Given** combat is active, **When** any action occurs (damage, healing, turn change, round increment), **Then** an entry is added to the combat log
2. **Given** the combat log has entries, **When** I view the log, **Then** entries are displayed in chronological order with timestamps
3. **Given** a log entry exists, **When** I view it, **Then** it shows the round number, timestamp, and description of the action
4. **Given** I end combat, **When** I start a new combat, **Then** the log is cleared for the new session
5. **Given** the log has many entries, **When** I scroll through it, **Then** I can view the complete combat history

---

### User Story 6 - Battle State Persistence (Priority: P3)

As a Game Master, I need my battle state to be automatically saved so that I don't lose progress if I close the browser or need to take a break.

**Why this priority**: Important quality-of-life feature but not critical for initial combat functionality. Prevents data loss but doesn't enable new capabilities.

**Independent Test**: Can be fully tested by creating a battle, closing the browser, and reopening to verify state is restored. Delivers value by preventing data loss.

**Acceptance Scenarios**:

1. **Given** I have an active battle, **When** I close and reopen the browser, **Then** my battle state is automatically restored
2. **Given** I make changes to creatures or combat state, **When** the changes are saved, **Then** they persist across browser refreshes
3. **Given** I have battle state saved, **When** I clear browser data, **Then** the battle state is lost (expected behavior)
4. **Given** I export battle state to a file, **When** I import it later, **Then** the complete battle is restored including all creatures and combat status

---

### User Story 7 - Status Effects Tracking (Priority: P4)

As a Game Master, I need to track status effects on creatures (poisoned, stunned, blessed, etc.) so that I can remember which conditions are active during combat.

**Why this priority**: Useful enhancement but not essential for basic combat. Many GMs track this on paper separately.

**Independent Test**: Can be fully tested by adding effects to creatures and verifying they persist. Delivers value by centralizing condition tracking.

**Acceptance Scenarios**:

1. **Given** I select a creature, **When** I add a status effect, **Then** the effect is displayed on the creature card
2. **Given** a creature has status effects, **When** I view the creature, **Then** all active effects are visible at a glance
3. **Given** a creature has status effects, **When** I remove an effect, **Then** it is no longer displayed
4. **Given** I end combat, **When** creatures persist (players), **Then** status effects are cleared automatically

---

### Edge Cases

- What happens when two creatures have identical initiative values? (System should allow manual ordering or use dexterity as tiebreaker)
- What happens when a creature's current HP is set higher than max HP manually? (System should cap at max HP or adjust max HP accordingly)
- What happens when all creatures in combat are defeated? (Combat should allow ending or continuing with option to add reinforcements)
- What happens when a user tries to start combat with no creatures? (System should prevent combat start and prompt to add creatures)
- What happens when a creature's initiative is changed mid-combat? (System should re-sort turn order and adjust current turn indicator if necessary)
- What happens when browser storage is full? (System should warn user and potentially offer export as backup)
- What happens when importing battle state with invalid data? (System should validate and reject with clear error message)

## Requirements *(mandatory)*

### Functional Requirements

**Battle Session Management**

- **FR-001**: System MUST allow users to create new battle sessions
- **FR-002**: System MUST allow users to start combat in a battle session
- **FR-003**: System MUST allow users to pause combat, preserving all state
- **FR-004**: System MUST allow users to end combat, removing monster creatures while retaining players
- **FR-005**: System MUST support multiple concurrent battle sessions per user
- **FR-006**: System MUST automatically save battle state to prevent data loss

**Creature Management**

- **FR-007**: System MUST allow adding creatures with required attributes: name, type (player/monster), HP (current and max), initiative, and armor class
- **FR-008**: System MUST allow editing creature attributes at any time
- **FR-009**: System MUST allow removing creatures from battle
- **FR-010**: System MUST distinguish between player and monster creature types
- **FR-011**: System MUST automatically remove monster creatures when combat ends
- **FR-012**: System MUST retain player creatures when combat ends
- **FR-013**: System MUST validate creature attributes (HP ≥ 0, initiative is numeric, armor class ≥ 0)

**Combat Mechanics**

- **FR-014**: System MUST sort creatures by initiative order when combat starts (highest initiative first)
- **FR-015**: System MUST track current turn within initiative order
- **FR-016**: System MUST allow advancing to next turn in initiative sequence
- **FR-017**: System MUST track round number, incrementing when last creature in order completes their turn
- **FR-018**: System MUST allow applying damage to creatures (decreasing current HP)
- **FR-019**: System MUST allow applying healing to creatures (increasing current HP up to max HP)
- **FR-020**: System MUST prevent current HP from exceeding max HP through healing
- **FR-021**: System MUST mark creatures as defeated when current HP reaches zero
- **FR-022**: System MUST allow creatures to be revived through healing

**Status Effects**

- **FR-023**: System MUST allow adding text-based status effects to creatures
- **FR-024**: System MUST display active status effects on creature cards
- **FR-025**: System MUST allow removing status effects from creatures
- **FR-026**: System MUST clear status effects when combat ends

**Combat Log**

- **FR-027**: System MUST record combat actions in a chronological log
- **FR-028**: System MUST include timestamp and round number for each log entry
- **FR-029**: System MUST log: damage dealt, healing applied, turn changes, round increments, creature additions/removals
- **FR-030**: System MUST display log entries in chronological order
- **FR-031**: System MUST clear combat log when new combat starts

**Data Persistence**

- **FR-032**: System MUST automatically save battle state to browser storage
- **FR-033**: System MUST restore battle state when user returns to application
- **FR-034**: System MUST allow exporting battle state as JSON file
- **FR-035**: System MUST allow importing battle state from JSON file
- **FR-036**: System MUST validate imported data before applying to prevent corruption

### Key Entities

- **Battle Session**: Represents a complete combat encounter. Contains: unique identifier, creation timestamp, combat status (not started/active/paused/ended), current round number, current turn index, list of creatures, combat log entries.

- **Creature**: Represents a combatant (player or monster). Contains: unique identifier, name, type (player/monster), current HP, max HP, initiative value, armor class, optional status effects list, defeated status flag.

- **Combat Log Entry**: Represents a recorded combat action. Contains: unique identifier, timestamp, round number, action description text.

- **User**: Represents an authenticated user (already implemented). Battle sessions belong to users for multi-user support.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Game Masters can set up a basic combat encounter (2-6 creatures) in under 3 minutes
- **SC-002**: Users can track a complete combat session (10+ rounds) without data loss
- **SC-003**: 95% of combat actions (damage, healing, turn advance) complete in under 1 second from user interaction
- **SC-004**: Users can successfully import and export battle configurations without data corruption
- **SC-005**: System maintains accurate turn order for battles with up to 20 creatures
- **SC-006**: Combat log accurately records 100% of combat actions with correct timestamps and round numbers
- **SC-007**: Battle state persists across browser sessions with 100% data integrity
- **SC-008**: Users can manage concurrent battles (up to 5) without performance degradation
- **SC-009**: New users complete their first battle session within 10 minutes of account creation
- **SC-010**: Zero HP calculation errors during combat (damage and healing always produce mathematically correct results)

### Assumptions

1. Users have reliable internet connection for initial login (battle tracking works offline after authentication)
2. Users primarily run one active battle at a time, though system supports multiple concurrent battles
3. Typical combat encounters contain 2-10 creatures
4. Combat sessions typically last 30-60 minutes
5. Users are familiar with tabletop RPG concepts (HP, initiative, armor class, status effects)
6. Browser supports modern web standards (ES6+, localStorage, JSON import/export)
7. Users prefer automatic state saving over manual save actions
8. Initiative ties are relatively rare and can be resolved with manual creature ordering
9. Status effects are primarily text labels (no automated mechanical effects)
10. Combat log serves as reference history, not as an undo/redo mechanism
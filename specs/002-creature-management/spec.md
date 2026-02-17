# Feature Specification: Creature Management

**Feature Branch**: `002-creature-management`
**Created**: 2026-02-16
**Status**: Draft
**Input**: User description: "As a Game Master, I need to add, edit, and remove creatures (players and monsters) so that I can populate battles with combatants"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add Creatures to Battle (Priority: P1)

As a Game Master, when I create or open a battle session, I need to add creatures (player characters and monsters) with their combat statistics so that I can populate the battle roster.

**Why this priority**: This is the foundational capability for creature management. Without the ability to add creatures, battles remain empty and no combat can occur. This delivers immediate value by enabling basic battle setup.

**Independent Test**: Can be fully tested by opening a battle and adding creatures with different attributes (name, type, HP, initiative, AC). Delivers value by allowing Game Masters to populate battles with combatants.

**Acceptance Scenarios**:

1. **Given** I have a battle session open, **When** I add a new creature with name "Goblin", type "monster", HP 7/7, initiative 14, and AC 15, **Then** the creature appears in the battle roster with all attributes displayed correctly
2. **Given** I am adding a creature, **When** I specify it as a "player" type, **Then** the creature is marked as a player character (which will persist through combat end)
3. **Given** I am adding a creature, **When** I specify it as a "monster" type, **Then** the creature is marked as a monster (which will be removed when combat ends)
4. **Given** I am adding a creature, **When** I provide invalid data (negative HP, blank name), **Then** I see clear validation error messages and the creature is not added
5. **Given** I have added creatures, **When** I view the battle roster, **Then** all creatures are displayed with their current stats visible at a glance

---

### User Story 2 - Edit Creature Attributes (Priority: P1)

As a Game Master, I need to edit creature attributes (name, HP, initiative, armor class, type) during battle setup or mid-combat so that I can correct mistakes or adjust for changing circumstances.

**Why this priority**: Equal priority to adding creatures because mistakes happen during setup and adjustments are often needed. This prevents having to delete and re-add creatures for simple corrections.

**Independent Test**: Can be fully tested by adding creatures and then editing their various attributes. Delivers value by allowing flexible battle management without destructive operations.

**Acceptance Scenarios**:

1. **Given** I have a creature in the battle roster, **When** I edit its name from "Goblin" to "Goblin Chief", **Then** the updated name is immediately reflected in the roster
2. **Given** I have a creature with current HP 10 and max HP 15, **When** I edit max HP to 20, **Then** both values are updated correctly and current HP remains 10
3. **Given** I have a creature with initiative 14, **When** I edit initiative to 18, **Then** the new initiative is saved (turn order will update when combat starts)
4. **Given** I have a creature marked as "monster", **When** I change its type to "player", **Then** it will now persist through combat end
5. **Given** I am editing a creature, **When** I provide invalid data (negative values, blank name), **Then** I see validation errors and changes are not saved

---

### User Story 3 - Remove Creatures from Battle (Priority: P1)

As a Game Master, I need to remove creatures from the battle roster so that I can correct setup mistakes or remove defeated/fled combatants.

**Why this priority**: Essential for battle management flexibility. Game Masters need to undo mistakes and adjust battle composition without starting over.

**Independent Test**: Can be fully tested by adding creatures and then removing them, verifying the roster updates correctly. Delivers value by preventing irreversible battle setup decisions.

**Acceptance Scenarios**:

1. **Given** I have creatures in the battle roster, **When** I remove a creature, **Then** it is immediately deleted from the roster
2. **Given** I remove a creature during combat, **When** it was the current turn, **Then** the turn indicator advances to the next creature in initiative order
3. **Given** I remove a creature during combat, **When** it was not the current turn, **Then** the turn indicator remains on the current creature
4. **Given** I have multiple creatures, **When** I remove one, **Then** the remaining creatures' data is unchanged
5. **Given** I remove the last creature in battle, **When** viewing the roster, **Then** I see an empty state with option to add creatures

---

### User Story 4 - Initiative-Based Sorting (Priority: P2)

As a Game Master, when I start combat, I need creatures automatically sorted by initiative (highest first) so that I know the turn order without manual sorting.

**Why this priority**: Critical for combat flow but depends on having creatures added first. This automation saves time and prevents errors in determining turn order.

**Independent Test**: Can be fully tested by adding creatures with different initiative values and starting combat. Delivers value by automating a tedious bookkeeping task.

**Acceptance Scenarios**:

1. **Given** I have added creatures with initiatives 18, 12, and 15, **When** I start combat, **Then** they are displayed in order: 18, 15, 12
2. **Given** two creatures have the same initiative value, **When** combat starts, **Then** they maintain their original relative order (stable sort)
3. **Given** I add a new creature mid-combat, **When** the roster updates, **Then** the new creature is inserted in the correct initiative position
4. **Given** I edit a creature's initiative mid-combat, **When** I save changes, **Then** the roster re-sorts and turn indicator adjusts if necessary
5. **Given** combat has not started, **When** viewing the roster, **Then** creatures are shown in the order they were added (not sorted by initiative)

---

### User Story 5 - Monster Auto-Removal on Combat End (Priority: P2)

As a Game Master, when I end combat, I need monster creatures automatically removed while player creatures remain so that I can quickly set up the next encounter without manual cleanup.

**Why this priority**: Quality-of-life feature that streamlines session management. Not critical for MVP but significantly improves user experience.

**Independent Test**: Can be fully tested by creating a battle with players and monsters, ending combat, and verifying only players remain. Delivers value by reducing repetitive cleanup tasks.

**Acceptance Scenarios**:

1. **Given** I have a battle with 3 player creatures and 4 monster creatures, **When** I end combat, **Then** only the 3 player creatures remain in the roster
2. **Given** I have only monster creatures in battle, **When** I end combat, **Then** the roster becomes empty
3. **Given** I have only player creatures in battle, **When** I end combat, **Then** all player creatures remain
4. **Given** I end combat and monsters are removed, **When** I start a new combat, **Then** I can add new monster creatures for the next encounter
5. **Given** I pause combat (not end), **When** viewing the roster, **Then** all creatures including monsters remain present

---

### Edge Cases

- What happens when I add a creature with initiative value that ties with existing creatures? (System should use stable sort - maintain original order among tied creatures)
- What happens when I try to add a creature with current HP greater than max HP? (System should accept it and treat current HP as max for healing purposes)
- What happens when I edit a creature's max HP to be lower than current HP? (System should reduce current HP to match new max HP)
- What happens when I remove a creature and turn order becomes empty? (Combat should auto-end or prompt Game Master to add creatures)
- What happens when I add a creature with negative initiative? (System should accept it - negative initiative is valid in some RPG systems)
- What happens when I add a creature with a very long name (100+ characters)? (System should either truncate display or wrap text to prevent UI breaking)
- What happens when battle is paused and I remove all creatures? (System should allow it - Game Master might want to completely reset the encounter)
- What happens when I add multiple creatures with identical names? (System should allow it - multiple "Goblin" monsters are common in RPGs)

## Requirements *(mandatory)*

### Functional Requirements

**Creature Addition**

- **FR-001**: System MUST allow Game Masters to add creatures to any battle session (before or during combat)
- **FR-002**: System MUST require the following attributes when adding a creature: name (non-blank text), type (player or monster), current HP (non-negative integer), max HP (positive integer), initiative (integer), armor class (non-negative integer)
- **FR-003**: System MUST assign each creature a unique identifier within the battle
- **FR-004**: System MUST validate creature attributes and reject invalid data with clear error messages
- **FR-005**: System MUST display newly added creatures in the battle roster immediately after creation

**Creature Editing**

- **FR-006**: System MUST allow Game Masters to edit any creature's attributes at any time (before or during combat)
- **FR-007**: System MUST allow editing these attributes: name, type, current HP, max HP, initiative, armor class
- **FR-008**: System MUST validate edited attributes using the same rules as creature addition
- **FR-009**: System MUST immediately reflect attribute changes in the battle roster
- **FR-010**: System MUST re-sort creature order if initiative is changed during active combat
- **FR-011**: System MUST reduce current HP to match max HP if max HP is edited to a value lower than current HP

**Creature Removal**

- **FR-012**: System MUST allow Game Masters to remove any creature from the battle at any time
- **FR-013**: System MUST immediately remove the creature from the battle roster with no confirmation dialog (unless configured otherwise)
- **FR-014**: System MUST adjust turn order if the current creature is removed during active combat
- **FR-015**: System MUST preserve battle state if last creature is removed (battle session continues to exist)

**Initiative and Turn Order**

- **FR-016**: System MUST sort creatures by initiative value (highest first) when combat starts
- **FR-017**: System MUST use stable sorting (preserve original order for creatures with identical initiative)
- **FR-018**: System MUST re-sort roster if creature is added or initiative is changed during active combat
- **FR-019**: System MUST NOT sort creatures before combat starts (display in creation order)
- **FR-020**: System MUST display current turn indicator on the appropriate creature during active combat

**Creature Type Management**

- **FR-021**: System MUST distinguish between "player" and "monster" creature types
- **FR-022**: System MUST automatically remove all monster creatures when combat ends
- **FR-023**: System MUST retain all player creatures when combat ends
- **FR-024**: System MUST allow changing creature type through edit functionality
- **FR-025**: System MUST visually distinguish player and monster creatures in the roster (badge, icon, or color coding)

### Key Entities

- **Creature**: Represents a combatant (player character or monster) in a battle. Contains: unique identifier (within battle context), name, type (player/monster), current hit points, maximum hit points, initiative value, armor class, optional status effects list, defeated status flag (derived from current HP = 0).

- **Battle Roster**: Collection of all creatures participating in a battle. Maintains: list of creatures, current turn index (during active combat), initiative-based sort order (during active combat), creation order (before combat starts).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Game Masters can add a creature with all required attributes in under 30 seconds
- **SC-002**: Game Masters can edit any creature attribute in under 15 seconds
- **SC-003**: Game Masters can set up a typical encounter (4-6 creatures) in under 3 minutes
- **SC-004**: System correctly sorts creatures by initiative 100% of the time when combat starts
- **SC-005**: Monster creatures are automatically removed on combat end with 100% accuracy (no player creatures lost, no monsters retained)
- **SC-006**: Turn order updates correctly when creatures are added/removed mid-combat in 100% of cases
- **SC-007**: Validation prevents invalid creature data from being saved in 100% of attempts
- **SC-008**: Initiative ties are handled consistently using stable sort order in all scenarios
- **SC-009**: Creature roster displays all attributes clearly without horizontal scrolling on standard screen sizes (1280px+)
- **SC-010**: Game Masters can manage battles with up to 20 creatures without performance degradation (operations complete in under 1 second)

### Assumptions

1. Game Masters are familiar with tabletop RPG concepts (HP, initiative, armor class)
2. Creature attributes follow D&D 5e conventions (standard RPG stats)
3. Initiative values typically range from -5 to +30 (system should support wider range)
4. Typical encounters have 2-10 creatures, but system should support up to 20
5. Creature names are typically 3-30 characters but system should support longer names
6. Game Masters may add/edit/remove creatures both during setup and mid-combat
7. HP values typically range from 1 to 500 for most creatures
8. Armor class typically ranges from 5 to 30 in standard RPG systems
9. Monster creatures are considered "disposable" and auto-removal on combat end is desired behavior
10. Player creatures represent ongoing characters and should never be auto-deleted

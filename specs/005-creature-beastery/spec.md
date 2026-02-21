# Feature Specification: Creature Beastery

**Feature Branch**: `005-creature-beastery`
**Created**: 2026-02-20
**Status**: Draft
**Input**: User description: "now implement a beastery where i can create creatures to reuse in battles. then in a battle i can select one of them from the beastery"

## Clarifications

### Session 2026-02-20

- Q: When a user deletes a creature from the beastery, should it be recoverable or permanently gone? → A: Hard delete - creature is permanently removed from database
- Q: Are creature abilities required or optional when creating a creature? → A: Abilities are optional - users can create creatures with just name/HP/AC and add abilities later

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

### User Story 1 - Create and Manage Creatures in Beastery (Priority: P1)

Users need a library (beastery) where they can create creatures once and reuse them across multiple battles. This is the core foundation - without being able to create and store creatures, the entire feature fails.

**Why this priority**: This is the MVP. Users must be able to create creatures and have them persist before they can select them in battles. Without this, there's no beastery to select from.

**Independent Test**: Can be fully tested by creating a creature, viewing it in the beastery list, and verifying it persists across sessions. This delivers the core value of a reusable creature library.

**Acceptance Scenarios**:

1. **Given** a user is on the beastery management screen, **When** they fill out a form with creature details (name, hit points, armor class, abilities) and submit, **Then** the creature is saved to the beastery and appears in the creature list
2. **Given** a user has created creatures in the beastery, **When** they navigate to the beastery, **Then** all previously created creatures are displayed with their key stats visible
3. **Given** a user is viewing the beastery, **When** they select a creature, **Then** they can see full details including all abilities and stats
4. **Given** a creature exists in the beastery, **When** the user refreshes the page or closes/reopens the app, **Then** the creature still exists in the beastery

---

### User Story 2 - Select Creatures from Beastery When Creating a Battle (Priority: P1)

Users need to be able to select creatures from the beastery instead of manually creating creatures each time they start a battle. This eliminates data entry and ensures consistency.

**Why this priority**: This is the "reuse" part of the feature. P1 because without it, the beastery is just a creature creator, not a library that saves time. This is directly requested in the feature description.

**Independent Test**: Can be tested independently by starting a new battle, selecting "Use from Beastery", picking a creature, and verifying it's added to the battle with all correct stats and abilities.

**Acceptance Scenarios**:

1. **Given** a user is creating a new battle, **When** they add a creature and choose "Use from Beastery" option, **Then** a list of all available beastery creatures is displayed
2. **Given** the beastery creature list is displayed, **When** the user selects a creature, **Then** that creature is added to the battle with all its stats, hit points, and abilities intact
3. **Given** a creature from the beastery is added to the battle, **When** the user takes actions in combat (damage, healing, status changes), **Then** these changes only affect the creature in THIS battle, not the original in the beastery
4. **Given** a user adds the same beastery creature to a battle multiple times, **When** they modify one instance in combat, **Then** the other instances and the beastery original remain unaffected

---

### User Story 3 - Manage Creature Library (Priority: P2)

Users need to be able to edit and delete creatures in the beastery as their game evolves or if they make mistakes.

**Why this priority**: P2 because while important for usability, the feature is still functional without edit/delete. Users can create new creatures instead, though this is less ideal. Edit/delete improves the experience but doesn't block core functionality.

**Independent Test**: Can be tested by creating a creature, editing its details, verifying the changes persist, then deleting it and verifying it's removed from the list.

**Acceptance Scenarios**:

1. **Given** a creature exists in the beastery, **When** the user clicks edit and modifies its stats or abilities, **Then** the changes are saved and reflected everywhere the creature appears
2. **Given** a creature exists in the beastery, **When** the user deletes it, **Then** it is removed from the beastery list and can no longer be selected for new battles
3. **Given** a creature has been used in past battles, **When** the user deletes it from the beastery, **Then** past battles are unaffected (the creature data was already copied into the battle)

---

### User Story 4 - Copy/Duplicate Creatures (Priority: P3)

Users may want to create variations of existing creatures (e.g., a slightly different orc variant) without starting from scratch.

**Why this priority**: P3 because this is a convenience feature. Users can create creatures manually, so duplication improves efficiency but isn't essential for the feature to work.

**Independent Test**: Can be tested by selecting a creature and choosing "Duplicate", modifying the copy, and verifying the original and copy both exist independently.

**Acceptance Scenarios**:

1. **Given** a creature exists in the beastery, **When** the user selects "Duplicate", **Then** a copy is created with "[Original Name] Copy" as the name
2. **Given** a duplicated creature is created, **When** the user edits the duplicate, **Then** only the duplicate is modified; the original remains unchanged

### Edge Cases

- What happens if a user tries to create a creature with the same name as an existing one? (System should allow duplicates or generate unique names)
- What happens if a creature is deleted from the beastery after it's been used in an archived/completed battle? (Battle data should remain intact - it's a snapshot; creature is hard-deleted and cannot be recovered)
- What if a creature's stats are edited after it's been used in an ongoing battle? (Only new instances use the updated stats; ongoing battles use their snapshot)
- How does the system handle creatures with very long ability lists or descriptions? (UI should accommodate or paginate)
- What if a user deletes all creatures? (Beastery should show empty state, battle creation should still work with manual entry)

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST allow users to create a new creature with required attributes: name, hit points, armor class (abilities are optional at creation time)
- **FR-002**: System MUST allow users to add abilities/actions to creatures (attack, damage type, range, etc.); abilities can be added during creation or edited later
- **FR-003**: System MUST persist all creatures in the beastery permanently (survive app restarts)
- **FR-004**: System MUST display a list of all creatures in the beastery with their key stats visible (name, HP, AC)
- **FR-005**: System MUST allow users to view full details of any creature in the beastery
- **FR-006**: System MUST allow users to edit creature details and abilities, with changes immediately reflected
- **FR-007**: System MUST allow users to delete creatures from the beastery (hard delete - permanent removal, no recovery option)
- **FR-008**: When starting a battle, system MUST provide an option to select a creature from the beastery instead of creating one manually
- **FR-009**: When a creature from the beastery is added to a battle, system MUST create an independent copy so battle modifications don't affect the beastery
- **FR-010**: System MUST allow duplicate creatures with auto-generated naming to avoid conflicts
- **FR-011**: System MUST display the beastery with a search/filter capability to find creatures by name
- **FR-012**: System MUST validate that creature names are not empty and reasonable length (e.g., max 100 characters)

### Key Entities *(include if feature involves data)*

- **Creature**: Represents a reusable creature template in the beastery
  - `id`: Unique identifier
  - `name`: Creature name (string, required, max 100 chars)
  - `hitPoints`: Maximum health value (number, required, > 0)
  - `armorClass`: Defense value (number, required, >= 0)
  - `abilities`: List of abilities/actions the creature can perform (optional, can be empty at creation)
  - `createdAt`: Timestamp when creature was added to beastery
  - `updatedAt`: Timestamp of last modification

- **Ability**: Represents an action a creature can take
  - `id`: Unique identifier
  - `name`: Ability name (string, required)
  - `description`: What the ability does (string, optional)
  - `damageType`: Type of damage if applicable (optional)
  - `range`: Attack range if applicable (optional)
  - `damage`: Damage dice/formula if applicable (optional)

- **Beastery**: Container for all creatures created by a user (implicit - managed through the creature persistence layer)

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Users can create a creature in the beastery in under 2 minutes (including entering all basic stats and 1-2 abilities)
- **SC-002**: Users can select and add a creature from the beastery to a new battle in under 20 seconds
- **SC-003**: 100% of creatures created are persisted and survive app restarts/page refreshes
- **SC-004**: All beastery creatures are displayed with full information without requiring additional clicks/navigation
- **SC-005**: Users can find any creature in a beastery of 50+ creatures by name search in under 5 seconds
- **SC-006**: Creating a duplicate creature takes under 10 seconds
- **SC-007**: Battle modifications to a creature do not affect the original creature in the beastery (100% data isolation)

## Assumptions

- Creatures follow the same schema as creatures used in battles (with attributes like name, HP, AC, abilities)
- User authentication is already implemented (from prior features), so creatures are user-scoped
- The battle system already exists and can be extended with beastery selection UI
- Creature modification in battles doesn't need to affect the beastery original (one-way data copy)
- "Abilities" are the same ability system used in the battle system
- Creature names can have duplicates (uniqueness is not enforced at the system level)
- Initial MVP focuses on basic CRUD; advanced features like creature grouping/categorization are out of scope

## Out of Scope

- Creature sharing between users
- Creature templates or hierarchies
- Bulk operations (import/export multiple creatures at once)
- Advanced filtering by ability type, damage type, etc.
- Creature artwork/images
- Version history or ability to revert creature changes

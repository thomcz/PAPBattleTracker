# Feature Specification: Player Management

**Feature Branch**: `004-player-management`
**Created**: 2026-02-19
**Status**: Draft
**Input**: User description: "i want to have the posibility to create players for my session, that i can reuuse in my battles. so that i can select them"

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

### User Story 1 - Create a New Player (Priority: P1)

As a game master, I want to create a player with their character information (name, class, level, hit points) so that I can store and reuse them across multiple battle sessions.

**Why this priority**: This is the foundational feature that enables all other player management functionality. Without the ability to create and store players, the entire feature is blocked.

**Independent Test**: Can be fully tested by creating a player, saving it, and verifying the player appears in the player list. Delivers immediate value by allowing GMs to build their player roster.

**Acceptance Scenarios**:

1. **Given** the user is on the player creation form, **When** they enter player name, character class, level, and hit points, **Then** the system creates the player and displays a success message
2. **Given** a player has been created, **When** the user navigates to the player list, **Then** the newly created player appears in the list
3. **Given** the user submits the player creation form without a name, **When** they click save, **Then** the system shows an error message and prevents creation

---

### User Story 2 - View and Select Players for Battle (Priority: P2)

As a game master, I want to see all my created players and select one or more to join a battle so that I can quickly populate battles with my previously created characters.

**Why this priority**: This enables the core reusability value proposition. Users can now leverage their player library instead of recreating characters for each battle.

**Independent Test**: Can be fully tested by creating multiple players, opening the battle creation flow, and verifying all players appear in a selectable list.

**Acceptance Scenarios**:

1. **Given** multiple players exist in the system, **When** the user opens the battle creation dialog, **Then** all players are displayed in a selectable list
2. **Given** the user selects players from the list, **When** they create a battle, **Then** the selected players are added to the battle
3. **Given** the player list is empty, **When** the user opens the battle creation dialog, **Then** a helpful message indicates no players are available

---

### User Story 3 - Edit Player Information (Priority: P3)

As a game master, I want to edit existing player information (name, class, level, hit points) so that I can update their details when characters advance or if I made a mistake.

**Why this priority**: Enhances the player management experience by allowing corrections and character progression tracking, but doesn't block core functionality.

**Independent Test**: Can be fully tested by creating a player, editing a field, saving, and verifying the change persists across sessions.

**Acceptance Scenarios**:

1. **Given** a player exists, **When** the user opens the player details and modifies a field, **Then** the changes are saved and reflected in the player list
2. **Given** a player was edited, **When** the user navigates away and returns, **Then** the edited information persists
3. **Given** the user clears the player name field, **When** they attempt to save, **Then** an error message appears preventing the save

---

### User Story 4 - Delete Players (Priority: P3)

As a game master, I want to delete players I no longer need so that I can keep my player library organized and remove duplicate or outdated characters.

**Why this priority**: Supports library maintenance but not essential for core functionality.

**Independent Test**: Can be fully tested by deleting a player and verifying it no longer appears in the list.

**Acceptance Scenarios**:

1. **Given** a player exists, **When** the user clicks delete and confirms, **Then** the player is removed from the list
2. **Given** the user clicks delete, **When** a confirmation dialog appears, **Then** the player is only deleted if the user confirms
3. **Given** a player is deleted, **When** the user refreshes or returns later, **Then** the player no longer appears in the list

### Edge Cases

- What happens when a user creates a player with the same name as an existing player? → Allow duplicate names (characters may share names in different campaigns)
- How does the system handle players with 0 or negative hit points? → Allow during creation/editing (player may be unconscious); validate on battle start if required
- What happens when a player is in an active battle and their data is edited? → Clarify scope: does this feature apply to players mid-battle, or only in player management UI?
- How does the system handle network failures during player creation? → Save is retried automatically or fails gracefully with user-facing error
- What happens when the player list grows very large (100+ players)? → Ensure performance remains acceptable with search/filter functionality

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST allow users to create a player with the following attributes: name, character class/type, level, and maximum hit points
- **FR-002**: System MUST validate that required fields (name) are not empty and display error messages if validation fails
- **FR-003**: System MUST persist created players so they remain available across sessions
- **FR-004**: System MUST display all created players in a list/view with their key attributes visible
- **FR-005**: Users MUST be able to select one or more players when creating or modifying a battle
- **FR-006**: System MUST allow users to edit existing player information and persist changes
- **FR-007**: System MUST allow users to delete players with a confirmation step to prevent accidental deletion
- **FR-008**: System MUST restrict player attributes to core fields only: name, character class, level, and maximum hit points. Extended attributes (armor class, initiative modifiers, etc.) are out of scope for this feature
- **FR-009**: System MUST scope players to a specific session—players are associated with a session and can only be reused within that session's battles

### Key Entities

- **Player**: Represents a reusable character template created by a game master within a specific session. Core attributes: unique ID, session ID (foreign key), name (string), character class (string), level (number), maximum hit points (number), creation timestamp, last modified timestamp
- **Session**: Represents a tabletop RPG session; relationship: a session contains multiple players and multiple battles. Players in a session are reusable across that session's battles only
- **Battle**: Represents an instance of combat within a session; relationship: a battle contains creatures derived from or referencing players from the same session

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Users can create a new player and add it to a battle in under 2 minutes (from player creation form to battle start)
- **SC-002**: System displays player list without perceptible delay when 20+ players exist (load time under 500ms)
- **SC-003**: 95% of user attempts to create a player succeed on the first try without errors
- **SC-004**: Players persist across multiple sessions—verify that a player created in one session remains available in subsequent sessions
- **SC-005**: All player CRUD operations (create, read, update, delete) work correctly in automated tests with 80% code coverage minimum

## Assumptions

Based on the feature description and clarifications:

- **Scope**: Players are session-specific—created for and reusable within a single session's battles only. This simplifies data isolation and session management
- **Core Attributes**: Players are limited to: name, character class, level, and maximum hit points. Future features can extend this if needed
- **Duplicate Names**: Players within a session may have duplicate names (common in different campaigns); the system distinguishes by unique ID
- **Deletion Safety**: Deletions include confirmation dialogs to prevent accidental loss of data
- **Minimal Validation**: Required field validation focuses on name field; other fields (class, level, HP) accept reasonable defaults or allow editing
- **UI Integration**: Players are selectable in the battle creation flow, building on the existing battle tracker features from 001-003
- **Data Persistence**: Players persist using the existing database/storage mechanism (H2 with event sourcing pattern established in feature 003)
- **Session Context**: The system already tracks the current session; players are automatically scoped to the active session during creation

# Feature Specification: Game Sessions

**Feature Branch**: `008-game-sessions`
**Created**: 2026-02-24
**Status**: Draft
**Input**: User description: "I need to extend the model. After login user should be able to create a session. Inside a session he can create battles. So I can have multiple game sessions with different players and battles. A session can have also states like planned, started, finished."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a Game Session (Priority: P1)

As a logged-in user, I want to create a new game session so that I can organize my tabletop RPG games into separate groups. When I create a session, I give it a name and it starts in the "planned" state. I can see the session listed on my dashboard.

**Why this priority**: Without the ability to create sessions, no other session-related functionality can exist. This is the foundational building block.

**Independent Test**: Can be fully tested by logging in, creating a session with a name, and verifying it appears on the dashboard in "planned" state.

**Acceptance Scenarios**:

1. **Given** a logged-in user on the dashboard, **When** they create a new session with the name "Friday Night Campaign", **Then** the session appears in their session list with the status "planned".
2. **Given** a logged-in user, **When** they create a session without providing a name, **Then** the system displays a validation error requesting a name.
3. **Given** a logged-in user with existing sessions, **When** they create another session, **Then** both sessions are visible and independent of each other.

---

### User Story 2 - Create Battles Within a Session (Priority: P1)

As a session owner, I want to create battles inside a session so that each game session can contain multiple encounters that I track independently.

**Why this priority**: Battles are the core content of sessions. Without battles inside sessions, the session concept has no practical value for battle tracking.

**Independent Test**: Can be tested by creating a session, adding one or more battles to it, and verifying the battles are listed within that session.

**Acceptance Scenarios**:

1. **Given** a session in "started" state, **When** the owner creates a new battle within it, **Then** the battle appears in the session's battle list.
2. **Given** a session in "planned" state, **When** the owner creates a battle within it, **Then** the battle is successfully created (battles can be prepared before the session starts).
3. **Given** a session with multiple battles, **When** the owner views the session, **Then** all battles are listed and individually accessible.
4. **Given** a session in "finished" state, **When** the owner attempts to create a new battle, **Then** the system prevents adding new battles to a finished session.

---

### User Story 3 - Manage Session Lifecycle (Priority: P2)

As a session owner, I want to change the state of my session (planned → started → finished) so that I can track which games are upcoming, currently active, or completed.

**Why this priority**: Session states give meaning to the session concept and allow users to organize their games by progress.

**Independent Test**: Can be tested by creating a session, advancing it through each state, and verifying the state transitions are correctly reflected.

**Acceptance Scenarios**:

1. **Given** a session in "planned" state, **When** the owner changes its state to "started", **Then** the session displays as "started".
2. **Given** a session in "started" state, **When** the owner changes its state to "finished", **Then** the session displays as "finished".
3. **Given** a session in "planned" state, **When** the owner attempts to change it directly to "finished", **Then** the system prevents this and requires the session to go through "started" first.
4. **Given** a session in "finished" state, **When** the owner attempts to change the state, **Then** the system prevents any further state changes (finished is a terminal state).

---

### User Story 4 - View and Navigate Sessions (Priority: P2)

As a logged-in user, I want to see all my sessions on the dashboard and navigate into a session to see its battles, so that I can quickly find and manage my games.

**Why this priority**: Navigation and overview are essential for usability once multiple sessions and battles exist.

**Independent Test**: Can be tested by creating multiple sessions with battles and verifying the dashboard lists sessions and allows drilling into each one.

**Acceptance Scenarios**:

1. **Given** a user with multiple sessions, **When** they view the dashboard, **Then** they see a list of all their sessions with names and current states.
2. **Given** a user viewing the dashboard, **When** they select a session, **Then** they navigate to the session detail view showing the session's battles.
3. **Given** a user with sessions in different states, **When** they view the dashboard, **Then** sessions are distinguishable by their state (planned, started, finished).

---

### User Story 5 - Edit and Delete Sessions (Priority: P3)

As a session owner, I want to rename or delete a session so that I can correct mistakes or remove sessions I no longer need.

**Why this priority**: Editing and deletion are secondary management features that improve usability but are not essential for core functionality.

**Independent Test**: Can be tested by renaming a session and verifying the new name, and by deleting a session and verifying it no longer appears.

**Acceptance Scenarios**:

1. **Given** a session, **When** the owner renames it, **Then** the new name is displayed everywhere the session appears.
2. **Given** a session with battles, **When** the owner deletes the session, **Then** the session and all its battles are removed.
3. **Given** a session, **When** the owner attempts to delete it, **Then** the system asks for confirmation before proceeding.

---

### Edge Cases

- What happens when a user tries to create a session with a duplicate name? The system allows it (names are not required to be unique).
- What happens when a session is deleted that contains in-progress battles? The system warns the user and requires confirmation, then removes everything.
- What happens when a user has no sessions? The dashboard shows an empty state with a prompt to create their first session.
- How does the system handle viewing a session that no longer exists (e.g., bookmarked URL)? A "session not found" message is displayed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow authenticated users to create a new game session with a required name.
- **FR-002**: System MUST assign the "planned" state to newly created sessions.
- **FR-003**: System MUST support three session states: planned, started, and finished.
- **FR-004**: System MUST enforce the session state transition order: planned → started → finished.
- **FR-005**: System MUST prevent state changes on sessions in "finished" state.
- **FR-006**: System MUST allow creating battles within a session that is not in "finished" state.
- **FR-007**: System MUST prevent creating new battles in a session that is in "finished" state.
- **FR-008**: System MUST display all sessions belonging to the authenticated user on the dashboard.
- **FR-009**: System MUST allow navigation from a session to its list of battles.
- **FR-010**: System MUST allow the session owner to rename a session.
- **FR-011**: System MUST allow the session owner to delete a session (with confirmation).
- **FR-012**: System MUST delete all battles within a session when the session is deleted.
- **FR-013**: System MUST associate each session with the user who created it.
- **FR-014**: System MUST only show sessions belonging to the currently authenticated user.

### Key Entities

- **Session**: Represents a game session (e.g., a campaign night). Has a name, a state (planned/started/finished), an owner (user), and contains zero or more battles. Each session belongs to exactly one user.
- **Battle**: An existing entity that now belongs to a session. Each battle is associated with exactly one session.
- **User**: An existing entity that now owns zero or more sessions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a new session and see it on their dashboard within 3 seconds.
- **SC-002**: Users can navigate from dashboard to a session's battle list in a single click/tap.
- **SC-003**: Session state transitions complete within 2 seconds and are immediately reflected in the interface.
- **SC-004**: Users with 10+ sessions can find and navigate to any session within 5 seconds.
- **SC-005**: 100% of battles are correctly associated with their parent session (no orphaned battles).
- **SC-006**: Deleting a session removes all associated battles with zero data remnants.

## Clarifications

### Session 2026-02-24

- Q: What does "different players" per session mean — player characters, real people, or registered users? → A: "Players" refers to player characters (PCs), which are creatures already tracked within battles. No new player entity is needed.

## Assumptions

- Sessions are private to the user who created them. There is no sharing or multi-user session concept in this scope.
- "Players" in the context of sessions refers to player characters (PCs), which are creatures already managed within battles. No separate player/participant entity is introduced by this feature.
- The existing battle creation flow will be adapted to require a parent session. Standalone battles (without a session) are not supported after this feature.
- Session names have no uniqueness constraint; users may name sessions however they wish.
- The "planned" → "started" → "finished" state flow is strictly sequential and one-directional. There is no way to revert a session to a previous state.
- Existing battles (if any) from before this feature will need a migration strategy, but that is an implementation concern outside this specification.

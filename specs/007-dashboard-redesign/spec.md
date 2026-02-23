# Feature Specification: Dashboard Redesign

**Feature Branch**: `007-dashboard-redesign`
**Created**: 2026-02-21
**Status**: Draft
**Input**: User description: "Rework dashboard with dark RPG theme matching login screens, campaign cards, stats overview, and bottom navigation bar with Campaigns, Library, Monsters, and Players tabs"

## Clarifications

### Session 2026-02-21

- Q: Should the bottom navigation bar appear on all authenticated pages (shared app shell) or only on the dashboard? → A: All authenticated pages (shared app shell)
- Q: Should the UI use "Campaigns" (mockup term) or "Battles" (codebase term)? → A: Keep "Battles" everywhere including UI
- Q: Should the bottom bar transform to sidebar/top nav on desktop? → A: Bottom bar at all screen sizes (consistent, simpler)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dark RPG Dashboard Theme (Priority: P1)

As a logged-in user, I want the dashboard to use the same dark RPG visual theme as the login and registration screens, so the application feels visually consistent and immersive.

When I log in and land on the dashboard, I see:
- A dark background with the established purple/gold color scheme
- A top header bar showing "Active Sessions" with my user avatar (initial letter) and a logout action
- A "Current Battles" section heading
- The overall aesthetic matches the dark fantasy RPG theme from the login screens

**Why this priority**: Visual consistency is the core request. Without the dark theme, the dashboard looks out of place next to the redesigned login/register screens.

**Independent Test**: Navigate to `/home` after login and verify the dark theme is applied with correct colors, typography, and layout matching the established auth theme.

**Acceptance Scenarios**:

1. **Given** I am logged in, **When** I navigate to the dashboard, **Then** I see a dark-themed page using the same color palette as the login screen (dark background, purple accents, gold highlights)
2. **Given** I am on the dashboard, **When** I look at the top header, **Then** I see "Active Sessions" text, my user avatar circle with my initial letter, and a way to log out
3. **Given** I am on the dashboard, **When** I view the page, **Then** all text meets WCAG 2.1 AA contrast requirements against the dark background

---

### User Story 2 - Battle List with Cards (Priority: P2)

As a game master, I want to see my battles displayed as visually rich cards so I can quickly identify and resume my sessions.

Each battle card shows:
- A decorative placeholder image area (dark themed)
- The battle name prominently displayed
- Party information (number of players/creatures)
- Last activity timestamp
- Action buttons: "Resume Session" (for existing battles) or "New Session" (for starting new ones)

**Why this priority**: Battle cards are the primary content of the dashboard and the main way users interact with their battles.

**Independent Test**: Navigate to `/home`, verify battle cards display with battle name, party count, action buttons, and that clicking "Resume Session" navigates to the battle detail page.

**Acceptance Scenarios**:

1. **Given** I have existing battles, **When** I view the dashboard, **Then** I see each battle displayed as a card with its name, creature/player count, and a "Resume Session" button
2. **Given** I have no existing battles, **When** I view the dashboard, **Then** I see an empty state message encouraging me to create a new session
3. **Given** I see a battle card, **When** I click "Resume Session", **Then** I am navigated to that battle's detail page
4. **Given** I am on the dashboard, **When** I look at battle cards, **Then** each card shows the last activity time in a human-readable relative format (e.g., "2 hours ago")

---

### User Story 3 - Stats Overview Cards (Priority: P3)

As a game master, I want to see summary statistics at the top of the dashboard showing my active games count and total active players/creatures, so I can get a quick overview of my battles.

The stats section shows:
- "In Progress" card with the count of active battles
- "Active Players" card with the total count of players across all battles

**Why this priority**: Stats provide useful at-a-glance information but the dashboard is functional without them.

**Independent Test**: Navigate to `/home`, verify the stats cards display counts that match the actual number of battles and players.

**Acceptance Scenarios**:

1. **Given** I have 2 active battles, **When** I view the dashboard stats, **Then** I see "In Progress: 2 Games"
2. **Given** I have battles with a total of 9 players/creatures, **When** I view the stats, **Then** I see "Active Players: 9"
3. **Given** I have no battles, **When** I view the stats, **Then** I see "In Progress: 0 Games" and "Active Players: 0"

---

### User Story 4 - Bottom Navigation Bar (Priority: P4)

As a user, I want a persistent bottom navigation bar with tabs for Battles, Library, Monsters, and Players so I can quickly navigate between major sections of the application without going back to a menu.

The bottom bar shows four tabs:
- **Battles** - Navigates to the dashboard/home view (current page, `/home`)
- **Library** - Navigates to battles list (`/battles`)
- **Monsters** - Navigates to the beastery/creature templates (`/beastery`)
- **Players** - Navigates to the players management page (`/players`)

Each tab has an icon and a label. The currently active tab is visually highlighted (purple accent color).

**Why this priority**: The bottom navigation replaces the current card-based navigation and moves Beastery and Players access to a persistent bar as requested by the user. It's essential for mobile usability but the dashboard is functional without it. The bar appears on all authenticated pages as a shared app shell component.

**Independent Test**: Navigate to `/home`, verify bottom bar is visible with 4 tabs, click each tab and verify navigation to the correct route, verify active tab highlighting.

**Acceptance Scenarios**:

1. **Given** I am on the dashboard, **When** I look at the bottom of the screen, **Then** I see a navigation bar with Battles, Library, Monsters, and Players tabs
2. **Given** I am on the dashboard (Battles tab), **When** I tap "Players", **Then** I navigate to `/players` and the Players tab becomes highlighted
3. **Given** I am on any page with the bottom bar, **When** I tap "Monsters", **Then** I navigate to `/beastery` and the Monsters tab becomes highlighted
4. **Given** I am on the dashboard, **When** I view the bottom bar, **Then** the "Battles" tab is highlighted as the active tab
5. **Given** I am on a mobile device (320px width), **When** I view the bottom bar, **Then** all four tabs are visible and tappable with adequate touch targets (minimum 44px)

---

### Edge Cases

- What happens when the user has no battles at all? An empty state with a prompt to create a new session is shown.
- What happens when battle data fails to load? A user-friendly error message is displayed with a retry option.
- What happens on very narrow screens (320px)? The layout stacks vertically, battle cards take full width, and the bottom bar remains fixed with all tabs visible.
- What happens when the user's name is very long? The avatar shows only the first letter; the username is truncated with ellipsis if needed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Dashboard MUST use the same dark RPG color scheme established in the login/register screens (shared theme variables)
- **FR-002**: Dashboard MUST display a top header with "Active Sessions" title, user avatar showing first letter of username, and logout functionality
- **FR-003**: Dashboard MUST display battle cards showing battle name, participant count, last activity, and action buttons
- **FR-004**: Dashboard MUST show a "Resume Session" button on each battle card that navigates to the battle detail page
- **FR-005**: Dashboard MUST show an empty state when no battles exist, with a call-to-action to create a new session
- **FR-006**: Dashboard MUST display summary stats cards showing "In Progress" game count and "Active Players" count
- **FR-007**: Application MUST include a fixed bottom navigation bar on ALL authenticated pages (shared app shell) with four tabs: Battles, Library, Monsters, Players
- **FR-008**: Bottom navigation MUST highlight the currently active tab
- **FR-009**: Bottom navigation MUST navigate to the correct routes: `/home` (Battles), `/battles` (Library), `/beastery` (Monsters), `/players` (Players)
- **FR-010**: Dashboard layout MUST be responsive across mobile (320px), tablet (768px), and desktop (1920px)
- **FR-011**: Dashboard MUST remove the current card-based navigation grid (Battles, Players, Beastery, Profile cards) in favor of the bottom navigation bar and battle cards
- **FR-012**: All text/background color combinations MUST meet WCAG 2.1 AA contrast requirements (minimum 4.5:1 ratio for normal text)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Dashboard visually matches the provided mockup design within reasonable fidelity (dark theme, card layout, bottom bar, stats)
- **SC-002**: All existing authentication flows continue to work unchanged (login, logout, route guards)
- **SC-003**: Users can navigate to all major sections (Battles, Library, Monsters, Players) from the bottom bar within a single tap
- **SC-004**: Dashboard loads and renders within 2 seconds on standard connections
- **SC-005**: All existing tests continue to pass, and new tests cover dashboard rendering, navigation, stats display, and bottom bar interactions
- **SC-006**: Responsive layout works correctly at 320px, 768px, and 1920px breakpoints

## Assumptions

- **Battle cards display existing battle data**: The cards show battles already available through the existing battle API/use cases. No new backend API is needed.
- **Stats are computed client-side**: "In Progress" count and "Active Players" count are derived from the existing battle list data, not from a separate API endpoint.
- **Placeholder images**: Battle card image areas use decorative dark-themed placeholder backgrounds (no actual uploaded images).
- **Game system tags**: Since the current data model doesn't include a "game system" field, tags like "D&D 5E" are omitted from the initial implementation. Cards show available data only.
- **Terminology**: The UI uses "Battles" consistently, matching the codebase and data model. The mockup term "Campaigns" is not adopted.
- **"LIVE GM MODE" indicator**: This is a future feature indicator and will not be included in the initial implementation since there is no live session tracking yet.
- **Bottom bar visibility**: The bottom navigation bar is shown on all authenticated pages, not just the dashboard. This provides consistent navigation across the app.
- **Filter icon in header**: The filter icon shown in the mockup is a visual placeholder and will not have functionality in this iteration.
- **Bottom bar layout**: The bottom navigation bar uses the same layout at all screen sizes (mobile, tablet, desktop). No transformation to sidebar or top nav on larger screens.

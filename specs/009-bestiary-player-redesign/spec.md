# Feature Specification: Bestiary & Player Creation Redesign

**Feature Branch**: `009-bestiary-player-redesign`
**Created**: 2026-02-27
**Status**: Draft
**Input**: User description: "redesign beastarey and player creation to match the already redesigned pages"

## Overview

The Bestiary and Player Creation pages currently use an outdated light visual theme inconsistent with the rest of the application. The Session, Battle, and Authentication pages have already been redesigned to use a dark, RPG-themed visual language with rich colors and atmospheric styling. This feature brings the Bestiary and Player pages into visual alignment with those redesigned pages, ensuring a cohesive user experience throughout the application.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Bestiary Page Matches Application Theme (Priority: P1)

A dungeon master navigates to the Bestiary page to manage their creature collection. The page should look and feel like a natural part of the application — sharing the same dark, atmospheric RPG visual style as the Session and Battle pages they just came from.

**Why this priority**: The Bestiary is a core feature used frequently to manage creatures for battles. Visual inconsistency here is immediately noticeable and breaks immersion. This is the most-visited page needing redesign.

**Independent Test**: Navigate to the Bestiary page after being on the Session List page and verify the visual experience is consistent (dark theme, same card styles, same button styles, same typography).

**Acceptance Scenarios**:

1. **Given** a user is on the Session List page (already redesigned), **When** they navigate to the Bestiary page, **Then** the Bestiary page displays using the same dark RPG visual theme without any jarring light/white backgrounds.
2. **Given** the Bestiary has one or more creatures, **When** the page loads, **Then** creature cards are displayed using the same dark card style as Session/Battle cards (dark background, colored border, hover effect).
3. **Given** the Bestiary is empty, **When** the page loads, **Then** an empty state is displayed matching the style of empty states on other redesigned pages (centered icon, dark background, matching typography).
4. **Given** a user wants to create a creature, **When** they open the creation form/dialog, **Then** the form uses the same dark modal style as other dialogs in the application.
5. **Given** a user performs delete or edit actions, **When** confirmation dialogs appear, **Then** those dialogs match the same style as confirmation dialogs on other redesigned pages.

---

### User Story 2 - Player Page Matches Application Theme (Priority: P2)

A dungeon master navigates to the Player page to manage their player characters. Like the Bestiary, this page should visually match the dark RPG theme of the redesigned pages throughout the application.

**Why this priority**: The Player page is used alongside the Bestiary when setting up battles. Visual consistency here matters for the same reasons as the Bestiary, but is slightly lower priority as Bestiary is typically accessed first.

**Independent Test**: Navigate to the Player page and verify the visual experience is consistent with the Session and Battle pages (dark theme, consistent card styles, matching button styles).

**Acceptance Scenarios**:

1. **Given** a user is on the Battle List page (already redesigned), **When** they navigate to the Player page, **Then** the Player page displays using the same dark RPG visual theme without any jarring light/white backgrounds.
2. **Given** there are one or more player characters, **When** the page loads, **Then** player cards are displayed using the same dark card style as other redesigned pages.
3. **Given** the player list is empty, **When** the page loads, **Then** an empty state is shown that matches the style of empty states on other redesigned pages.
4. **Given** a user wants to create a player character, **When** they open the creation form, **Then** the form uses the same dark modal/dialog style as other creation forms in the application.
5. **Given** a player card shows class information, **When** a user views it, **Then** the class badge styling is visually consistent with status badges on other redesigned pages.

---

### User Story 3 - Navigation Between Pages Is Seamless (Priority: P3)

A user moves between the Bestiary, Player, Session, and Battle pages during a session setup workflow. The visual transitions between pages feel natural because all pages share the same design language.

**Why this priority**: Cross-page visual consistency is the ultimate goal of this redesign. Once individual pages are redesigned, this story validates the end-to-end experience.

**Independent Test**: Walk through the full navigation flow — Session List → Session Detail → Bestiary → Player page — and confirm each page transition maintains visual consistency.

**Acceptance Scenarios**:

1. **Given** a user navigates through the application, **When** they move between any combination of Session, Battle, Bestiary, and Player pages, **Then** all pages share the same visual language (dark backgrounds, consistent typography, matching color palette, uniform button styles).
2. **Given** the header/navigation area of redesigned pages, **When** the user views Bestiary and Player pages, **Then** the header structure matches the pattern of other redesigned pages (back button, centered title, action button).

---

### Edge Cases

- What happens when the Bestiary has many creatures (20+)? The redesigned layout must handle scrolling gracefully without visual breakage.
- What happens when a creature or player name is very long? Card titles must truncate or wrap cleanly within the dark card design.
- What happens when both a creation form and a confirmation dialog are needed in sequence? Stacked dialogs must remain visually consistent.
- How does the redesign appear on narrow screens (mobile/tablet)? The dark theme must remain readable and usable at smaller viewport sizes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Bestiary page MUST display using the same dark RPG visual theme as the Session and Battle redesigned pages, including background colors, typography, and color accents.
- **FR-002**: The Player page MUST display using the same dark RPG visual theme as the Session and Battle redesigned pages.
- **FR-003**: Creature cards on the Bestiary page MUST use the same card visual style (dark background, border, hover effect) as cards on other redesigned list pages.
- **FR-004**: Player cards on the Player page MUST use the same card visual style as cards on other redesigned list pages.
- **FR-005**: The Bestiary page header MUST follow the same layout pattern as other redesigned pages: back/navigation element, page title, and primary action button.
- **FR-006**: The Player page header MUST follow the same layout pattern as other redesigned pages.
- **FR-007**: Creation and edit forms on both pages MUST use the same dark modal/dialog styling as creation forms on other redesigned pages.
- **FR-008**: Confirmation dialogs for delete actions on both pages MUST use the same dark dialog style as confirmation dialogs elsewhere in the application.
- **FR-009**: Empty states on both pages MUST visually match the empty state pattern used on other redesigned pages (centered content, matching icon treatment, dark background).
- **FR-010**: All existing functionality on both pages (create, edit, delete, duplicate for creatures; create, edit, delete for players) MUST remain fully operational after the visual redesign.
- **FR-011**: Status/class badges on player cards MUST use the same badge visual style as status badges on other redesigned pages.
- **FR-012**: Both pages MUST remain usable and visually intact on mobile and tablet screen sizes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of pages in the application (Session, Battle, Bestiary, Player, Auth) share the same dark RPG visual theme — zero pages retain the old light theme.
- **SC-002**: All existing user actions on the Bestiary page (create, edit, duplicate, delete creature) continue to work correctly after redesign, with 0 regressions.
- **SC-003**: All existing user actions on the Player page (create, edit, delete player) continue to work correctly after redesign, with 0 regressions.
- **SC-004**: A user navigating from any redesigned page (Session/Battle) to the Bestiary or Player page experiences no visible visual inconsistency in background color, card style, button style, or typography.
- **SC-005**: Both redesigned pages load and render correctly on screens ranging from 375px (mobile) to 1440px (desktop) without horizontal scrolling or overlapping elements.

## Assumptions

- The visual design system (dark color palette, typography, component patterns) established by the already-redesigned Session, Battle, and Authentication pages serves as the definitive visual reference for this redesign.
- No new functionality is being added to either the Bestiary or Player page — this is a visual-only redesign.
- The existing data model for creatures (name, HP, AC) and players (name, class, level, max HP) does not change.
- The dark theme color variables and shared styles already defined in the project are reusable for these pages without modification.
- Both the Bestiary and Player pages are in scope for this feature; redesigning only one of them would leave the application in a partially inconsistent state.

## Dependencies

- The already-redesigned Session, Battle, and Authentication pages serve as the design reference and must remain unchanged during this work.
- The shared theme/styling assets established by those redesigned pages must be accessible to the Bestiary and Player page components.

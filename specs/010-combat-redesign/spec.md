# Feature Specification: Combat Screen Redesign

**Feature Branch**: `010-combat-redesign`
**Created**: 2026-03-03
**Status**: Draft
**Input**: User description: "lets redesign the combat screen. it should match the design in other components. also split the component/screen. after navigating to a battle the user should see combat_prepare_screen there he can add creatures. the creatures are listed and if everything is prepared he can start the battle. after starting the battle he gets ask to add initiative for all players. then turn based combat starts. current creature is marked. the user can select a creature to add damage or heal or set a status. user can end combat he gets asked what was the result of it and gets a victory or defeat screen"

## Overview

The current combat view is a single monolithic screen that handles all phases of an encounter in one place. This feature splits it into four distinct, purpose-built screens that guide the dungeon master through a clear combat lifecycle: **Prepare → Initiative → Combat → Result**. All four screens adopt the established dark RPG visual theme used across the rest of the application (Session, Bestiary, Player, Auth pages).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Combat Preparation Screen (Priority: P1)

A dungeon master navigates to a battle. Before combat begins, they see a preparation screen showing all creatures already added to this encounter, along with the ability to add more. A header displays key encounter statistics (enemy count, player count, average CR). When the roster is ready, a prominent "Start Battle" action initiates the encounter.

**Why this priority**: This is the entry point to every combat encounter. Without a working preparation screen, none of the subsequent phases can be reached. It is the foundation on which all other stories depend.

**Independent Test**: Navigate to a battle detail page, verify the creature roster is shown with HP bars and AC values in the dark theme style, add a new creature, then verify the Start Battle button becomes accessible.

**Acceptance Scenarios**:

1. **Given** a user navigates to an existing battle, **When** the page loads, **Then** they see the Combat Preparation screen showing the creature list, encounter statistics (enemy count, player count, avg CR), and "Add Entity" and "Reset List" actions at the bottom.
2. **Given** the combat preparation screen is shown, **When** one or more creatures are listed, **Then** each creature card displays the creature's name, current HP / max HP as a colored progress bar, AC value, and initiative value.
3. **Given** a user taps "Add Entity", **When** the dialog opens, **Then** they can add a creature (from bestiary or manual entry) to the encounter roster.
4. **Given** the preparation screen, **When** a dungeon master taps "Start Battle", **Then** the screen transitions to the Initiative Setup screen.
5. **Given** the preparation screen, **When** a Lair Action or special entity is present in the list, **Then** it is displayed as a distinct card (differentiated from regular creatures) with its recharge condition visible.
6. **Given** the visual design, **When** the page renders, **Then** it uses the same dark RPG theme (background color, card style, typography, color accents) as the Session and Bestiary pages.

---

### User Story 2 - Initiative Setup Screen (Priority: P2)

After starting the battle, the dungeon master sees an Initiative Setup screen listing every participant. Player characters need their initiative entered manually (their dex modifier is shown as a hint). Monsters can have initiative rolled automatically via a dice icon, or rolled all at once with "Roll all monsters". A group minion initiative toggle allows all minions of the same type to share one initiative value. Once all initiatives are set, the dungeon master taps "Start Battle" to begin turn-based combat.

**Why this priority**: Initiative order determines the structure of every combat turn. This screen is required before active combat can proceed, making it the critical bridge between preparation and combat.

**Independent Test**: After tapping Start Battle on the preparation screen, verify the Initiative Setup screen appears listing all participants with their dex modifiers, allow rolling monster initiative, enter a value for at least one player, then tap Start Battle and confirm the active combat screen loads with creatures ordered by initiative.

**Acceptance Scenarios**:

1. **Given** the initiative setup screen loads, **When** displayed, **Then** every creature and player in the encounter is listed, each showing their name, dex modifier, an optional avatar/icon, and an input field for their initiative value.
2. **Given** a monster entry on the initiative list, **When** the dungeon master taps the dice icon next to it, **Then** the initiative is automatically rolled (1d20 + dex modifier) and displayed in the input field.
3. **Given** multiple monster entries, **When** the dungeon master taps "Roll all monsters", **Then** initiative is automatically rolled for every non-player entity simultaneously.
4. **Given** a player character entry, **When** the dungeon master taps the input field, **Then** they can type in the initiative value rolled by the player.
5. **Given** the "Group Minion Initiative" toggle is enabled, **When** multiple minions of the same type exist, **Then** they share a single initiative entry and act together as a group.
6. **Given** all initiative values are entered, **When** the dungeon master taps "Start Battle", **Then** the Active Combat screen opens with combatants ordered from highest to lowest initiative.
7. **Given** a BOSS-type creature is in the list, **When** displayed on the initiative setup screen, **Then** the creature card is visually distinguished (e.g., colored label) from standard creatures.

---

### User Story 3 - Active Combat Screen (Priority: P3)

Turn-based combat is underway. All combatants are displayed in initiative order. The current combatant's card is visually highlighted. The dungeon master can tap any creature card to open the Action Manager panel, where they can apply damage, apply healing, or set status effects. Round and turn counters are shown in the header. Undo/redo (history navigation) is available. When the dungeon master decides combat is over, they tap an "End Combat" action to proceed to the result screen.

**Why this priority**: This is the core of the feature — the screen DMs will spend the most time on during a session. It must be accurate, responsive, and visually clear.

**Independent Test**: From the initiative setup screen, start combat and verify creatures appear in initiative order with the first creature highlighted, tap a creature to open the action manager, apply damage and confirm the HP bar updates, then advance to the next turn and confirm the highlighted creature changes.

**Acceptance Scenarios**:

1. **Given** active combat has started, **When** the screen loads, **Then** all combatants are shown in initiative order with round number and turn number displayed in the header.
2. **Given** the current combatant's turn, **When** the combat screen is shown, **Then** that creature's card is visually highlighted (distinct border or background) and labeled as "CURRENT".
3. **Given** the active combat screen, **When** the dungeon master taps a creature card, **Then** the Action Manager panel opens showing the selected creature as target.
4. **Given** the Action Manager is open, **When** the dungeon master adjusts the amount and taps "Apply Damage", **Then** the target creature's current HP decreases by that amount and the HP bar updates immediately.
5. **Given** the Action Manager is open, **When** the dungeon master adjusts the amount and taps "Apply Healing", **Then** the target creature's current HP increases by that amount (up to max HP) and the HP bar updates immediately.
6. **Given** the Action Manager is open, **When** the dungeon master selects one or more status effects (Poisoned, Stunned, Blinded, Blessed, Prone, Restrained, Burning, Frozen), **Then** those statuses are applied to the target and visually indicated on their creature card.
7. **Given** the Action Manager is open, **When** the dungeon master uses Quick Roll dice (d20, d12, d8, d6), **Then** a result is generated and can be used as the damage/healing amount.
8. **Given** a creature's HP drops to 0 or below, **When** damage is applied, **Then** the creature is marked as defeated or removed from the initiative order.
9. **Given** the current turn ends, **When** the dungeon master advances the turn, **Then** the next creature in initiative order becomes the active combatant and the turn counter increments.
10. **Given** all combatants in a round have acted, **When** the last turn in the round ends, **Then** the round counter increments and initiative order resets to the top.
11. **Given** the dungeon master taps "End Combat", **When** confirmed, **Then** the screen transitions to the Combat Result screen.
12. **Given** the combat screen, **When** it renders, **Then** it uses the same dark RPG visual theme as the other redesigned screens.

---

### User Story 4 - Combat Result Screen (Priority: P4)

After combat ends, the dungeon master sees a result screen showing either "VICTORY" or "DEFEAT" with key statistics: total rounds, time elapsed, and a combat contribution breakdown per player character (damage dealt, healing done, crits, buffs applied). An "End Encounter" button finalizes the encounter and returns to the session or battle list. A share button allows optionally sharing the result.

**Why this priority**: This is a meaningful closing moment for the encounter. While lowest in priority (combat still functions without it), it provides valuable session recaps and a satisfying end state.

**Independent Test**: Trigger "End Combat" from the active combat screen, select "Victory", and verify the result screen shows the correct outcome label, total rounds count, and a list of player contributions.

**Acceptance Scenarios**:

1. **Given** the dungeon master ends combat, **When** asked for the result, **Then** they can select either "Victory" or "Defeat".
2. **Given** "Victory" is selected, **When** the result screen loads, **Then** a "VICTORY" label is prominently displayed with total rounds and time elapsed.
3. **Given** "Defeat" is selected, **When** the result screen loads, **Then** a "DEFEAT" label (or equivalent) is prominently displayed with total rounds and time elapsed.
4. **Given** the result screen is shown, **When** there are player characters in the encounter, **Then** a "Combat Contribution" section lists each player with their total damage dealt, and any notable stats (crits, blocked, healed, buffs).
5. **Given** the result screen, **When** the dungeon master taps "End Encounter", **Then** they are returned to the session detail or battle list.
6. **Given** the result screen, **When** rendered, **Then** it uses the same dark RPG visual theme as the other redesigned screens.

---

### Edge Cases

- What happens when a creature's HP is reduced below 0? HP should clamp at 0 and the creature should be flagged as defeated.
- What happens when all enemies are defeated? The system should prompt the dungeon master to end combat with a Victory outcome.
- What happens when the initiative list is empty or only one combatant remains? Combat should still be functional; the turn counter advances normally.
- What happens when a player's initiative value is not entered before starting combat? The system should warn the user or treat unset values as 0.
- What happens when the dungeon master navigates away mid-combat? The combat state should be preserved so they can return to the active combat screen.
- What happens when a creature's name is very long? Cards must truncate or wrap gracefully without breaking the layout.
- What happens when there are many combatants (10+)? The initiative list must scroll without losing the header or action buttons.
- What happens when the dungeon master applies healing beyond max HP? HP should be capped at the creature's maximum HP value.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The battle detail route MUST show a Combat Preparation screen as the initial view when navigating to an encounter.
- **FR-002**: The Combat Preparation screen MUST display all current creatures in the encounter roster with name, current/max HP as a visual bar, AC value, and initiative value.
- **FR-003**: The Combat Preparation screen MUST display encounter statistics: total enemy count, total player count, and average challenge rating (CR).
- **FR-004**: Users MUST be able to add a new entity (creature from bestiary or manual) to the encounter from the preparation screen.
- **FR-005**: Users MUST be able to reset the creature list from the preparation screen.
- **FR-006**: Tapping "Start Battle" on the preparation screen MUST transition to the Initiative Setup screen.
- **FR-007**: The Initiative Setup screen MUST list every encounter participant with their name, dex modifier, an initiative input field, and a dice roll button.
- **FR-008**: Tapping the dice icon for a monster MUST automatically calculate and populate that monster's initiative (1d20 + dex modifier).
- **FR-009**: A "Roll all monsters" action MUST roll initiative for all non-player entities at once.
- **FR-010**: A "Group Minion Initiative" toggle MUST allow minions of the same type to share one initiative entry.
- **FR-011**: Tapping "Start Battle" on the Initiative Setup screen MUST transition to the Active Combat screen with combatants ordered by initiative (highest first).
- **FR-012**: The Active Combat screen MUST display all combatants in initiative order with round and turn counters in the header.
- **FR-013**: The current combatant MUST be visually highlighted and labeled as active on the Active Combat screen.
- **FR-014**: Tapping a creature card in Active Combat MUST open the Action Manager panel for that creature as the selected target.
- **FR-015**: The Action Manager MUST allow the user to set a numeric amount and apply it as damage or healing to the selected target.
- **FR-016**: The Action Manager MUST display a set of status effects (at minimum: Poisoned, Stunned, Blinded, Blessed, Prone, Restrained, Burning, Frozen) that can be toggled on/off for the selected target.
- **FR-017**: The Action Manager MUST provide quick-roll dice buttons (d20, d12, d8, d6) whose results can populate the damage/healing amount.
- **FR-018**: Applying damage or healing MUST immediately update the creature's HP bar on the Active Combat screen.
- **FR-019**: A creature reduced to 0 HP MUST be visually marked as defeated.
- **FR-020**: The Active Combat screen MUST provide an action to advance to the next turn.
- **FR-021**: The Active Combat screen MUST provide an "End Combat" action that prompts for the encounter result (Victory or Defeat).
- **FR-022**: The Combat Result screen MUST display the outcome (Victory or Defeat), total rounds, and time elapsed.
- **FR-023**: The Combat Result screen MUST display a combat contribution breakdown per player character showing at minimum total damage dealt.
- **FR-024**: An "End Encounter" button on the result screen MUST navigate the user back to the session or battle list.
- **FR-025**: All four screens MUST use the established dark RPG visual theme consistent with the Session, Bestiary, Player, and Auth pages.
- **FR-026**: The feature MUST replace the existing single-screen battle detail component; no parallel duplicate implementation should remain.

### Key Entities

- **Encounter**: A battle instance with a name, list of combatants, current round, current turn index, and status (Preparing, Active, Ended).
- **Combatant**: A participant in the encounter — either a creature (enemy) or player character — with name, max HP, current HP, AC, dex modifier, initiative value, status effects, and a role type (Player, Enemy, Boss, Minion, Lair Action).
- **Status Effect**: A named condition applied to a combatant (e.g., Poisoned, Stunned) that affects their behavior.
- **Combat Result**: The outcome record of a completed encounter, including outcome type (Victory/Defeat), total rounds, duration, and per-player contribution stats (damage, healing, crits, buffs).
- **Combat Contribution**: Per-player statistics tracked during the encounter (damage dealt, healing applied, critical hits, blocks, buffs applied).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A dungeon master can navigate from encounter preparation through initiative setup into active combat in under 2 minutes with a pre-built roster of 5 combatants.
- **SC-002**: All four combat phase screens (Prepare, Initiative, Active, Result) are visually indistinguishable in theme from the already-redesigned Session and Bestiary pages — zero screens retain the old light/default theme.
- **SC-003**: HP bar updates appear instantly (within one animation frame) after damage or healing is applied — users never see stale HP values.
- **SC-004**: 100% of existing combat functionality (damage, healing, status, turn advancement) is available after the redesign with zero regressions in behavior.
- **SC-005**: The Action Manager correctly identifies and displays the tapped creature as the target 100% of the time — no mis-targeting.
- **SC-006**: All four screens render correctly on mobile screen widths (375px–768px) without horizontal overflow or overlapping interactive elements.
- **SC-007**: Combat state (current round, turn, HP values) is preserved if the user navigates away and returns to the active combat screen during the same session.

## Assumptions

- The dark visual design system (color palette, card styles, typography, button patterns) established by the Session, Bestiary, and Auth redesigns is the authoritative design reference and is reusable without modification.
- Combat contribution statistics (damage, healing, crits, etc.) are tracked per-player during active combat; if the backend does not yet track these, the frontend will accumulate them locally for the session.
- Dex modifier values for creatures are already stored or derivable from existing creature data.
- The existing `BattlePort` and backend battle APIs are leveraged for creature/battle data; any new initiative or status fields are addable as extensions.
- "Lair Actions" are a special entity type already supported in the data model and should be displayed distinctly in all screens.
- Time elapsed on the result screen is measured from when "Start Battle" is tapped on the Initiative Setup screen.
- The share button on the result screen is a secondary action; a placeholder is acceptable if sharing integration is out of scope.

## Dependencies

- The already-redesigned Session, Bestiary, Player, and Auth pages serve as the visual reference and must remain unchanged.
- The shared dark theme styles and SCSS design tokens established by those pages must be accessible to the new combat screen components.
- The existing Angular battle feature structure (`features/battle/`) is the target location for the new components.
- Backend APIs for fetching and updating battle/creature data must remain functional throughout the redesign.

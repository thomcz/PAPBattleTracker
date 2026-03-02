# Tasks: Bestiary & Player Creation Redesign

**Input**: Design documents from `/specs/009-bestiary-player-redesign/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: Included per project constitution (TDD is NON-NEGOTIABLE — tests written before implementation).

**Organization**: Tasks grouped by user story. US1 (Bestiary) and US2 (Player) are independent and can be worked in parallel. US3 (Navigation consistency) validates the combined result.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- All paths relative to `frontend-angular/src/app/features/`

---

## Phase 1: Setup (Scope Audit)

**Purpose**: Determine full scope before implementation begins. Child dialog components may need redesign if they use light styles.

- [x] T001 Read and audit `CreatureFormDialogComponent` HTML and CSS/SCSS files — document whether light theme styles are present and note exact file paths for T007
- [x] T002 [P] Read and audit `PlayerFormDialogComponent` HTML and CSS/SCSS files — document whether light theme styles are present and note exact file paths for T013

**Checkpoint**: Scope confirmed — know exactly which dialog files need updates

---

## Phase 2: User Story 1 — Bestiary Page Matches Application Theme (Priority: P1) 🎯 MVP

**Goal**: The Bestiary page is fully restyled with the dark RPG theme. A user navigating from the Session List page sees no visual inconsistency.

**Independent Test**: Navigate to `/beastery`, verify dark backgrounds, dark cards, dark dialogs, and that all CRUD actions still work. Run `npm test -- beastery-list`.

### Tests for User Story 1 (TDD — write FIRST, verify they FAIL before T005)

- [x] T003 [P] [US1] Write failing test: dark theme CSS classes present (`.beastery-list`, `.creature-card`, `.empty-state` with dark background) in `beastery/pages/beastery-list/beastery-list.component.spec.ts`
- [x] T004 [P] [US1] Write failing test: all CRUD methods called correctly (create, edit, delete, duplicate trigger use case methods) in `beastery/pages/beastery-list/beastery-list.component.spec.ts`

### Implementation for User Story 1

- [x] T005 [P] [US1] Create `beastery/pages/beastery-list/beastery-list.component.scss` — import `_auth-theme.scss`, apply dark gradient `:host`, implement all page classes (`.dashboard`, `.header`, `.creature-card`, `.empty-state`, `.loading-state`, `.dialog-overlay`, `.confirm-dialog`) matching session-list pattern
- [x] T006 [P] [US1] Rewrite `beastery/pages/beastery-list/beastery-list.component.html` — dark theme structure: header (back button + title + create button), card list with creature cards (name, HP stat, AC stat, edit/duplicate/delete buttons), empty state, loading state, error state, dark confirm dialog
- [x] T007 [US1] Update `beastery/pages/beastery-list/beastery-list.component.ts` — change `styleUrls` from `beastery-list.component.css` to `beastery-list.component.scss` and delete the old `.css` file
- [x] T008 [US1] Update `CreatureFormDialogComponent` HTML and CSS to dark theme if light styles found in T001 (use same dark modal pattern as session/battle dialogs)

**Checkpoint**: Run `npm test -- beastery-list` — all US1 tests green. Navigate to `/beastery` — dark theme visible, all actions work.

---

## Phase 3: User Story 2 — Player Page Matches Application Theme (Priority: P2)

**Goal**: The Player page is fully restyled with the dark RPG theme, including the class badge styled as a dark-theme pill consistent with status badges elsewhere.

**Independent Test**: Navigate to `/players`, verify dark backgrounds, dark cards, class badge in dark pill style, dark dialogs, and that all CRUD actions work. Run `npm test -- player-list`.

### Tests for User Story 2 (TDD — write FIRST, verify they FAIL before T012)

- [x] T009 [P] [US2] Write failing test: dark theme CSS classes present (`.player-list`, `.player-card`, `.class-badge` dark pill style, `.empty-state`) in `player/pages/player-list/player-list.component.spec.ts`
- [x] T010 [P] [US2] Write failing test: all CRUD methods called correctly (create, edit, delete trigger use case methods) in `player/pages/player-list/player-list.component.spec.ts`

### Implementation for User Story 2

- [x] T011 [P] [US2] Create `player/pages/player-list/player-list.component.scss` — import `_auth-theme.scss`, apply dark gradient `:host`, implement all page classes (`.dashboard`, `.header`, `.player-card`, `.class-badge`, `.empty-state`, `.loading-state`, `.dialog-overlay`, `.confirm-dialog`) matching session-list pattern; `.class-badge` uses `$auth-gold` or `$auth-purple` pill style consistent with status badges
- [x] T012 [P] [US2] Rewrite `player/pages/player-list/player-list.component.html` — dark theme structure: header (back button + title + create button), card list with player cards (name + class badge, level stat, max HP stat, edit/delete buttons), empty state, loading state, error state, dark confirm dialog
- [x] T013 [US2] Update `player/pages/player-list/player-list.component.ts` — change `styleUrls` from `player-list.component.css` to `player-list.component.scss` and delete the old `.css` file
- [x] T014 [US2] Update `PlayerFormDialogComponent` HTML and CSS to dark theme if light styles found in T002 (use same dark modal pattern as session/battle dialogs)

**Checkpoint**: Run `npm test -- player-list` — all US2 tests green. Navigate to `/players` — dark theme visible, class badge styled consistently, all actions work.

---

## Phase 4: User Story 3 — Navigation Between Pages Is Seamless (Priority: P3)

**Goal**: A user moving through the full application experiences zero visual inconsistency between Session, Battle, Bestiary, and Player pages.

**Independent Test**: Walk the full navigation flow Session List → Session Detail → Bestiary → Player and verify no page uses a light background or inconsistent card style.

### Implementation for User Story 3

- [ ] T015 [US3] Manually walk navigation flow: Session List → Session Detail → Bestiary → Player — note any remaining visual inconsistencies and create a fix list
- [x] T016 [P] [US3] Run full test suite `npm test` from `frontend-angular/` — verify 0 regressions across all components (beastery, player, session, battle, auth)
- [ ] T017 [US3] Fix any remaining visual inconsistencies identified in T015 (e.g., mismatched button padding, font inconsistency, mobile layout gaps)

**Checkpoint**: All pages share the dark RPG visual theme end-to-end. Full test suite green.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Responsive validation and quickstart checklist sign-off.

- [ ] T018 [P] Verify both pages render correctly at 375px (mobile) and 768px (tablet) — no horizontal overflow, touch targets ≥44px, readable text contrast
- [ ] T019 [P] Verify both pages render correctly at 1440px (desktop) — correct max-width centering, no excessively wide cards
- [ ] T020 Run quickstart.md verification checklist — all 10 items checked off

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately. T001 and T002 run in parallel.
- **US1 (Phase 2)**: Depends on T001 (dialog scope for T008). T003–T006 can start immediately after Phase 1.
- **US2 (Phase 3)**: Depends on T002 (dialog scope for T014). T009–T012 can start immediately after Phase 1. **US2 is independent of US1** — can run in parallel.
- **US3 (Phase 4)**: Depends on US1 and US2 both being complete.
- **Polish (Phase 5)**: Depends on US3 completion.

### User Story Dependencies

- **US1 (P1)**: Unblocked after Phase 1 — no dependency on US2
- **US2 (P2)**: Unblocked after Phase 1 — no dependency on US1
- **US3 (P3)**: Requires US1 + US2 complete

### Within Each User Story (TDD Order)

1. Write failing tests (T003/T004 or T009/T010) — verify RED
2. HTML + SCSS in parallel (T005+T006 or T011+T012) — these are different files
3. TypeScript `styleUrls` update (T007 or T013) — depends on SCSS file existing
4. Dialog component update (T008 or T014) — depends on audit result from Phase 1
5. Verify tests GREEN

---

## Parallel Example: User Story 1

```text
# After Phase 1 completes, launch in parallel:
Task A: "Write failing dark-theme tests in beastery-list.component.spec.ts"  (T003)
Task B: "Write failing CRUD regression tests in beastery-list.component.spec.ts"  (T004)

# After tests are written and failing, launch in parallel:
Task A: "Create beastery-list.component.scss"  (T005)
Task B: "Rewrite beastery-list.component.html"  (T006)

# Then sequentially:
Task: "Update styleUrls in beastery-list.component.ts"  (T007 — depends on T005)
Task: "Update CreatureFormDialogComponent"  (T008 — depends on T001 audit)
```

## Parallel Example: User Story 2 (runs in parallel with US1)

```text
# After Phase 1 completes, launch in parallel with US1:
Task A: "Write failing dark-theme tests in player-list.component.spec.ts"  (T009)
Task B: "Write failing CRUD regression tests in player-list.component.spec.ts"  (T010)

# After tests are written and failing, launch in parallel:
Task A: "Create player-list.component.scss"  (T011)
Task B: "Rewrite player-list.component.html"  (T012)

# Then sequentially:
Task: "Update styleUrls in player-list.component.ts"  (T013)
Task: "Update PlayerFormDialogComponent"  (T014)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Audit dialogs (T001, T002)
2. Complete Phase 2: Bestiary redesign (T003–T008)
3. **STOP and VALIDATE**: Dark Bestiary page works, tests green
4. Demonstrate to stakeholders: Bestiary now matches Session/Battle pages

### Incremental Delivery

1. Phase 1 (Setup) → Scope confirmed
2. Phase 2 (US1) → Bestiary redesigned and tested → **Demo-ready**
3. Phase 3 (US2) → Player redesigned and tested → **Demo-ready**
4. Phase 4 (US3) → Cross-page flow validated → **Feature complete**
5. Phase 5 (Polish) → Responsive sign-off → **PR ready**

### Parallel Team Strategy

With two developers:
- After Phase 1 completes:
  - Developer A: US1 (Bestiary) — T003 → T004 → T005+T006 → T007 → T008
  - Developer B: US2 (Player) — T009 → T010 → T011+T012 → T013 → T014
- Join at US3 (T015–T017)

---

## Notes

- [P] tasks = different files, no inter-task dependencies
- TDD: tests (T003, T004, T009, T010) must be written and confirmed FAILING before implementation starts
- T007 and T013 delete old `.css` files — these deletions are safe since `.scss` replacements are created first in T005/T011
- T008 and T014 are conditional — only do work if T001/T002 audits find light theme styles in dialog components
- Reference for all HTML/SCSS work: `session/pages/session-list/session-list.component.{html,scss}`
- Run `npm test` from `frontend-angular/` directory

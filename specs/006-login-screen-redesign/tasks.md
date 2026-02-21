# Tasks: Login Screen Redesign

**Input**: Design documents from `/specs/006-login-screen-redesign/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Tests are included per the project constitution (TDD required). Existing tests will be updated to match new UI labels; new tests added for password toggle.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create shared theme foundation used by all auth screens

- [x] T001 Create shared SCSS theme partial with CSS custom properties (colors, typography, mixins) in `frontend-angular/src/app/features/auth/shared/_auth-theme.scss`

**Checkpoint**: Shared theme variables available for import by login and register styles

---

## Phase 2: User Story 1 - RPG-Themed Login Screen (Priority: P1) 🎯 MVP

**Goal**: Redesign the login screen to match the dark RPG-themed mockup with castle logo, thematic labels, golden button, and all visual elements from `specs/design/login_screen.png`

**Independent Test**: Navigate to `/login`, verify dark theme, castle logo, "DUNGEON MASTER" title, "GRANDMASTER ID" and "SECRET SIGIL" labels, golden "Enter the Sanctum" button. Enter credentials and log in successfully.

### Tests for User Story 1

> **NOTE: Update existing tests FIRST to match new UI labels, ensure they FAIL before template changes**

- [x] T002 [US1] Update login test label queries and button text assertions in `frontend-angular/src/app/features/auth/login/login.spec.ts`: Change `getByLabelText(/username/i)` → `/grandmaster id/i`, `getByLabelText(/password/i)` → `/secret sigil/i`, `getByRole('button', { name: /login/i })` → `/enter the sanctum/i`, `getByRole('link', { name: /register here/i })` → query for "Create New Campaign" link, loading text "Logging in..." → "Entering the Sanctum..."
- [x] T003 [US1] Add password visibility toggle tests in `frontend-angular/src/app/features/auth/login/login.spec.ts`: Test eye icon renders, clicking toggles input type from password to text, clicking again toggles back to password

### Implementation for User Story 1

- [x] T004 [US1] Add `passwordVisible` signal and `togglePasswordVisibility()` method to login component in `frontend-angular/src/app/features/auth/login/login.ts`
- [x] T005 [US1] Redesign login template in `frontend-angular/src/app/features/auth/login/login.html`: Add castle logo SVG in purple diamond, "DUNGEON MASTER" title + "Campaign Management Suite" subtitle, rename labels to "GRANDMASTER ID" (with @ icon prefix, placeholder "scroll-keeper@realm.com") and "SECRET SIGIL" (with key icon prefix), add "FORGOTTEN?" link next to password label, add eye icon visibility toggle bound to `passwordVisible` signal, change button to golden "Enter the Sanctum" with lock icon, add "OR JOIN THE GUILD" divider with horizontal lines, add outlined "Create New Campaign" button linking to `/register`
- [x] T006 [US1] Rewrite login styles in `frontend-angular/src/app/features/auth/login/login.scss`: Import `_auth-theme.scss`, apply dark background, style castle logo diamond, style input fields with dark backgrounds and icon prefixes, style golden submit button, style divider and outlined register button, style "FORGOTTEN?" link, style error messages for dark theme, add responsive breakpoints (320px, 768px, 1920px)

**Checkpoint**: Login screen matches mockup. All login tests pass. User can log in successfully with new UI.

---

## Phase 3: User Story 2 - Navigate to Registration from Login (Priority: P2)

**Goal**: Ensure the "OR JOIN THE GUILD" divider and "Create New Campaign" button on the login screen navigate to the registration page

**Independent Test**: Load `/login`, click "Create New Campaign" button, verify navigation to `/register`

> Note: The UI elements for this story (divider + button) are created in T005 as part of the login template. This phase validates the navigation behavior works correctly.

### Tests for User Story 2

- [x] T007 [US2] Add navigation test in `frontend-angular/src/app/features/auth/login/login.spec.ts`: Verify "Create New Campaign" link/button has `routerLink="/register"` or `href="/register"`, verify "OR JOIN THE GUILD" divider text is displayed

### Implementation for User Story 2

- [x] T008 [US2] Verify "Create New Campaign" button in login template uses `routerLink="/register"` in `frontend-angular/src/app/features/auth/login/login.html` (created in T005, validate and fix if needed)

**Checkpoint**: Clicking "Create New Campaign" navigates to `/register`. Divider text visible.

---

## Phase 4: User Story 3 - Registration Screen Theming (Priority: P3)

**Goal**: Apply the same dark RPG theme to the registration screen for visual consistency

**Independent Test**: Navigate to `/register`, verify dark background, purple accents, golden button, themed input styling matching the login screen

### Tests for User Story 3

- [x] T009 [US3] Update register test label queries and button text assertions in `frontend-angular/src/app/features/auth/register/register.spec.ts`: Update label queries for themed field names if changing (or keep existing names with dark theme styling), update button text "Register" → themed equivalent (e.g., "Join the Guild"), update link text "Login here" → themed equivalent, verify all existing validation tests still work

### Implementation for User Story 3

- [x] T010 [P] [US3] Redesign register template in `frontend-angular/src/app/features/auth/register/register.html`: Add castle logo or simplified header matching login theme, apply themed labels with icon prefixes for username, email, password, confirm password fields, change button to golden themed style, update footer link to login page with themed text
- [x] T011 [P] [US3] Rewrite register styles in `frontend-angular/src/app/features/auth/register/register.scss`: Import `_auth-theme.scss`, apply same dark background, input styling, button styling, typography, and responsive breakpoints as login screen

**Checkpoint**: Registration screen uses same dark RPG theme as login. All register tests pass. Form validation unchanged.

---

## Phase 5: User Story 4 - Password Visibility Toggle (Priority: P4)

**Goal**: Password visibility toggle with eye icon in the Secret Sigil field

**Independent Test**: Type in password field, click eye icon, verify password becomes visible. Click again, verify masked.

> Note: The component logic (T004), template binding (T005), and tests (T003) for password toggle are implemented in User Story 1. This phase validates the complete user experience.

- [x] T012 [US4] End-to-end validation of password visibility toggle in `frontend-angular/src/app/features/auth/login/login.spec.ts`: Verify eye icon changes appearance when toggled (eye-open vs eye-closed), verify keyboard accessibility (can tab to and activate the toggle button)

**Checkpoint**: Password toggle works correctly with visual feedback.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup

- [x] T013 [P] Verify WCAG 2.1 AA color contrast ratios for all text/background combinations in both login and register screens
- [x] T014 [P] Run full test suite (`npm test` in `frontend-angular/`) and verify all tests pass
- [x] T015 Visual comparison of login screen against `specs/design/login_screen.png` mockup - verify logo, labels, colors, buttons, layout match
- [x] T016 Run quickstart.md verification checklist from `specs/006-login-screen-redesign/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **US1 (Phase 2)**: Depends on Phase 1 (shared theme)
- **US2 (Phase 3)**: Depends on Phase 2 (login template with divider/button)
- **US3 (Phase 4)**: Depends on Phase 1 (shared theme). Can run in parallel with US1.
- **US4 (Phase 5)**: Depends on Phase 2 (password toggle implemented in login)
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on T001 (shared theme). Core deliverable.
- **User Story 2 (P2)**: Depends on US1 completion (divider/button created in login template).
- **User Story 3 (P3)**: Depends on T001 (shared theme). Independent from US1 - can run in parallel.
- **User Story 4 (P4)**: Depends on US1 completion (toggle logic and template created there).

### Within Each User Story

- Tests updated FIRST (to fail against current implementation)
- Template and style changes implement the new design
- Verify tests pass after implementation

### Parallel Opportunities

- T010 and T011 (US3 register template + styles) can run in parallel
- US1 and US3 can run in parallel after Phase 1 (different components, different files)
- T013 and T014 (Polish phase) can run in parallel

---

## Parallel Example: User Story 1 + User Story 3

```bash
# After Phase 1 (shared theme) is complete:

# Developer A: User Story 1 (login redesign)
Task: "T002 - Update login test labels"
Task: "T003 - Add password toggle tests"
Task: "T004 - Add passwordVisible signal to login.ts"
Task: "T005 - Redesign login template"
Task: "T006 - Rewrite login styles"

# Developer B: User Story 3 (register redesign) - IN PARALLEL
Task: "T009 - Update register test labels"
Task: "T010 - Redesign register template"
Task: "T011 - Rewrite register styles"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Create shared theme (T001)
2. Complete Phase 2: Login screen redesign (T002-T006)
3. **STOP and VALIDATE**: Login screen matches mockup, all tests pass
4. This alone delivers the core visual redesign

### Incremental Delivery

1. T001 → Shared theme ready
2. T002-T006 → Login redesign complete (MVP!) → Validate
3. T007-T008 → Registration navigation verified → Validate
4. T009-T011 → Register screen themed → Validate
5. T012 → Password toggle polished → Validate
6. T013-T016 → Polish and final verification

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- This is a frontend-only feature - no backend changes needed
- All existing authentication logic (use cases, ports, adapters) remains untouched
- Existing tests need label/selector updates but validation logic assertions stay the same
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently

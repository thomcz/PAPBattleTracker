# Tasks: Dashboard Redesign

**Input**: Design documents from `/specs/007-dashboard-redesign/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Tests are included per the project constitution (TDD required). Existing tests will be updated for the new dashboard; new tests added for bottom nav and battle cards.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Externalize home component files and create shared component scaffolding

- [x] T001 Extract inline template from `frontend-angular/src/app/home/home.ts` to external `frontend-angular/src/app/home/home.html` and inline styles to external `frontend-angular/src/app/home/home.scss`. Update component decorator to use `templateUrl` and `styleUrl` instead of `template` and `styles`. Verify component still renders.
- [x] T002 Create `frontend-angular/src/app/shared/components/bottom-nav/` directory structure with empty scaffold files: `bottom-nav.component.ts`, `bottom-nav.component.html`, `bottom-nav.component.scss`, `bottom-nav.component.spec.ts`

**Checkpoint**: Home component uses external template/styles. Bottom nav directory scaffolded.

---

## Phase 2: User Story 4 - Bottom Navigation Bar (Priority: P4 but foundational) 🎯 FOUNDATIONAL

**Goal**: Create the persistent bottom navigation bar that appears on all authenticated pages. This is implemented first because it modifies the app shell (`app.html`/`app.ts`) which is a prerequisite for the dashboard layout (content needs `padding-bottom` to account for the fixed bottom bar).

**Independent Test**: Navigate to `/home`, verify bottom bar visible with 4 tabs (Battles, Library, Monsters, Players). Click each tab, verify navigation. Verify bar hidden on `/login`.

### Tests for User Story 4

> **NOTE: Write tests FIRST, ensure they FAIL before implementation**

- [x] T003 [US4] Write bottom nav component tests in `frontend-angular/src/app/shared/components/bottom-nav/bottom-nav.component.spec.ts`: Test renders 4 tabs with correct labels (Battles, Library, Monsters, Players), test each tab has correct routerLink (`/home`, `/battles`, `/beastery`, `/players`), test active tab highlighting via RouterLinkActive, test all tabs have SVG icons, test touch target minimum size (44px)

### Implementation for User Story 4

- [x] T004 [US4] Implement `BottomNavComponent` in `frontend-angular/src/app/shared/components/bottom-nav/bottom-nav.component.ts`: Standalone component importing `RouterLink` and `RouterLinkActive`, define 4 nav items array with label, route, and icon identifier
- [x] T005 [US4] Create bottom nav template in `frontend-angular/src/app/shared/components/bottom-nav/bottom-nav.component.html`: Fixed bottom bar with 4 tabs, each with inline SVG icon and label, `routerLink` for navigation, `routerLinkActive` for active state highlighting
- [x] T006 [US4] Style bottom nav in `frontend-angular/src/app/shared/components/bottom-nav/bottom-nav.component.scss`: Import `_auth-theme.scss`, dark background matching app theme, fixed position at bottom, flexbox layout with equal tab widths, active tab purple highlight (`$auth-purple`), inactive tab muted text (`$auth-text-light`), minimum 44px touch targets, z-index above content
- [x] T007 [US4] Integrate bottom nav into app shell: Modify `frontend-angular/src/app/app.ts` to import `BottomNavComponent` and `LoginUseCase`, add `isAuthenticated` computed signal. Modify `frontend-angular/src/app/app.html` to add `@if (isAuthenticated()) { <app-bottom-nav /> }` after `<router-outlet />`. Add `padding-bottom` to `frontend-angular/src/app/app.scss` for authenticated pages to prevent content being hidden behind fixed bottom bar.

**Checkpoint**: Bottom nav visible on all authenticated pages. Hidden on login/register. All 4 tabs navigate correctly. Active tab highlighted.

---

## Phase 3: User Story 1 - Dark RPG Dashboard Theme (Priority: P1) 🎯 MVP

**Goal**: Redesign the dashboard with the dark RPG theme matching login/register screens. Header with "Active Sessions", user avatar, logout.

**Independent Test**: Navigate to `/home` after login, verify dark background, purple/gold color scheme, "Active Sessions" header with user avatar showing first letter, logout button works.

### Tests for User Story 1

> **NOTE: Update existing tests FIRST to match new UI, ensure they FAIL before template changes**

- [x] T008 [US1] Update home component tests in `frontend-angular/src/app/home/home.spec.ts`: Update test to verify "Active Sessions" heading renders, test user avatar shows first letter of username, test logout button exists and calls `LogoutUseCase.execute()`, test dark theme container class is present, remove old tests for card-grid navigation (Battles/Players/Beastery/Profile cards)

### Implementation for User Story 1

- [x] T009 [US1] Redesign dashboard template in `frontend-angular/src/app/home/home.html`: Replace current navbar and card grid with dark-themed layout: top header bar with "Active Sessions" title, user avatar circle (first letter of username from `loginUseCase.currentUser()`), logout icon/button. Add "Current Battles" section heading. Remove old quick-actions card grid.
- [x] T010 [US1] Rewrite dashboard styles in `frontend-angular/src/app/home/home.scss`: Import `_auth-theme.scss` using `@use`, apply dark background (`$auth-bg`), style header bar with flex layout, style avatar circle with purple background (`$auth-purple`) and white text, style "Active Sessions" title with `$auth-text-white`, style "Current Battles" heading with serif font, add responsive breakpoints (320px, 768px, 1920px)
- [x] T011 [US1] Update `frontend-angular/src/app/home/home.ts`: Remove inline `template` and `styles` properties (already externalized in T001), ensure `templateUrl: './home.html'` and `styleUrl: './home.scss'` are set, keep existing `LogoutUseCase` and `LoginUseCase` injections

**Checkpoint**: Dashboard has dark RPG theme. Header shows "Active Sessions" with avatar and logout. Old card grid removed. All US1 tests pass.

---

## Phase 4: User Story 2 - Battle List with Cards (Priority: P2)

**Goal**: Display battles as visually rich dark-themed cards with name, creature count, last activity (relative time), and "Resume Session" button. Show empty state when no battles exist.

**Independent Test**: Navigate to `/home`, verify battle cards show with battle name, player count, relative time, and "Resume Session" button. Click "Resume Session" to navigate to `/battles/:id`. With no battles, see empty state.

### Tests for User Story 2

- [x] T012 [US2] Add battle card tests in `frontend-angular/src/app/home/home.spec.ts`: Test battle cards render when battles exist (mock `BattlePort.listBattles()`), test each card shows battle name, test each card shows creature count, test each card shows "Resume Session" button, test "Resume Session" navigates to `/battles/:id`, test empty state message shows when no battles, test loading state while fetching, test error state with retry button when fetch fails

### Implementation for User Story 2

- [x] T013 [US2] Add battle data loading to `frontend-angular/src/app/home/home.ts`: Inject `BattlePort`, add `battles = signal<Battle[]>([])`, `loading = signal<boolean>(true)`, `error = signal<string | null>(null)` signals. Add `loadBattles()` method calling `BattlePort.listBattles()`. Call `loadBattles()` in constructor or `ngOnInit`. Add `retryLoad()` method for error recovery. Import `Router` for navigation.
- [x] T014 [US2] Create relative time helper function in `frontend-angular/src/app/home/home.ts` (or a small utility): `getRelativeTime(dateString: string): string` that converts ISO timestamp to human-readable relative time (e.g., "2 hours ago", "3 days ago", "just now")
- [x] T015 [US2] Add battle cards to dashboard template in `frontend-angular/src/app/home/home.html`: Add `@if (loading())` loading spinner/skeleton, `@if (error())` error message with retry button, `@if (battles().length === 0 && !loading())` empty state with "No battles yet" message and "Create New Battle" call-to-action linking to `/battles`, `@for (battle of battles(); track battle.id)` battle cards with: decorative dark placeholder image area, battle name, creature count (e.g., "5 players"), relative last activity time, "Resume Session" button navigating to `/battles/:id`
- [x] T016 [US2] Style battle cards in `frontend-angular/src/app/home/home.scss`: Dark card background with subtle border (`$auth-input-border`), rounded corners, card image placeholder with dark gradient, battle name in `$auth-text-white`, creature count and last activity in `$auth-text-light`, "Resume Session" button using `$auth-gold` (similar to `auth-btn-primary` mixin), empty state centered text with muted styling, loading skeleton animation, responsive card layout (full width on mobile, grid on tablet/desktop)

**Checkpoint**: Battle cards display with all data. Empty state works. Resume navigates correctly. Loading/error states functional. All US2 tests pass.

---

## Phase 5: User Story 3 - Stats Overview Cards (Priority: P3)

**Goal**: Display summary stats cards at the top of the dashboard showing "In Progress" game count and "Active Players" count.

**Independent Test**: Navigate to `/home` with battles loaded, verify stats cards show correct counts matching battle data.

### Tests for User Story 3

- [x] T017 [US3] Add stats card tests in `frontend-angular/src/app/home/home.spec.ts`: Test "In Progress" card shows correct count of non-ended battles, test "Active Players" card shows total creature count across all battles, test stats show "0" when no battles exist, test stats update when battle data loads

### Implementation for User Story 3

- [x] T018 [US3] Add computed stats signals to `frontend-angular/src/app/home/home.ts`: `battleCount = computed(() => this.battles().filter(b => b.status !== 'ENDED').length)`, `totalPlayers = computed(() => this.battles().reduce((sum, b) => sum + b.creatures.length, 0))`
- [x] T019 [US3] Add stats cards to dashboard template in `frontend-angular/src/app/home/home.html`: Two stat cards between header and battle list, "In Progress" card with dice/game icon and `{{ battleCount() }} Games`, "Active Players" card with group icon and `{{ totalPlayers() }}` count
- [x] T020 [US3] Style stats cards in `frontend-angular/src/app/home/home.scss`: Horizontal flexbox layout with gap, dark card backgrounds with purple-tinted border, stat number in large bold `$auth-gold` text, label in uppercase small `$auth-text`, icon accent in `$auth-purple`, responsive (side by side on all sizes, shrink padding on mobile)

**Checkpoint**: Stats cards show correct counts. Zero state works. All US3 tests pass.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup

- [x] T021 [P] Verify WCAG 2.1 AA color contrast ratios for all text/background combinations in dashboard and bottom nav
- [x] T022 [P] Run full test suite (`npx ng test` in `frontend-angular/`) and verify all tests pass
- [x] T023 Visual comparison of dashboard against `specs/design/dashboard_screen.png` mockup - verify header, stats, battle cards, bottom nav, colors, layout match
- [x] T024 Run quickstart.md verification checklist from `specs/007-dashboard-redesign/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **US4 Bottom Nav (Phase 2)**: Depends on Phase 1 (scaffold created). Implemented first because it modifies the app shell.
- **US1 Dark Theme (Phase 3)**: Depends on Phase 2 (app shell updated with bottom nav, content padding applied)
- **US2 Battle Cards (Phase 4)**: Depends on Phase 3 (dashboard template redesigned with dark theme)
- **US3 Stats Cards (Phase 5)**: Depends on Phase 4 (battle data loading logic exists from US2)
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 4 (P4 - Bottom Nav)**: Foundational. Modifies app shell. Must complete first.
- **User Story 1 (P1 - Dark Theme)**: Depends on US4 (app shell has bottom nav padding). Core visual redesign.
- **User Story 2 (P2 - Battle Cards)**: Depends on US1 (dark-themed dashboard template to add cards to).
- **User Story 3 (P3 - Stats Cards)**: Depends on US2 (battle data loading logic needed for computed stats).

### Within Each User Story

- Tests updated/written FIRST (to fail against current implementation)
- Template and style changes implement the new design
- Verify tests pass after implementation

### Parallel Opportunities

- T021 and T022 (Polish phase) can run in parallel
- T004, T005, T006 (bottom nav component files) could be developed together but T005/T006 depend on T004's structure

---

## Implementation Strategy

### MVP First (User Story 4 + User Story 1)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Bottom nav (T003-T007)
3. Complete Phase 3: Dark theme dashboard (T008-T011)
4. **STOP and VALIDATE**: Dashboard has dark theme, bottom nav works on all pages
5. This alone delivers the core visual redesign

### Incremental Delivery

1. T001-T002 → Setup ready
2. T003-T007 → Bottom nav on all pages → Validate
3. T008-T011 → Dark RPG dashboard theme (MVP!) → Validate
4. T012-T016 → Battle cards with data → Validate
5. T017-T020 → Stats overview cards → Validate
6. T021-T024 → Polish and final verification

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- This is a frontend-only feature - no backend changes needed
- User Story 4 (bottom nav) is P4 in spec priority but implemented FIRST because it's foundational (modifies app shell)
- All existing authentication logic remains untouched
- Existing home tests need significant rewrite due to complete dashboard redesign
- The `_auth-theme.scss` is imported but NOT modified
- Use `npx ng test` to run tests (NOT `npx vitest run` directly)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently

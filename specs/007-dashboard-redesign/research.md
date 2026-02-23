# Research: Dashboard Redesign

**Feature**: 007-dashboard-redesign
**Date**: 2026-02-21

## R-001: Theme Reuse Strategy

**Decision**: Import `_auth-theme.scss` from `features/auth/shared/` using relative `@use` paths. Do not move or duplicate the theme file.

**Rationale**: The `_auth-theme.scss` partial already contains all color variables (`$auth-bg`, `$auth-purple`, `$auth-gold`, etc.) and mixins (`auth-btn-primary`, `auth-input`, etc.) needed for the dark RPG theme. Both home and bottom-nav components can import it with `@use` at different relative paths. Moving the file to a global location would require updating all existing imports in login/register SCSS, adding risk for no benefit.

**Alternatives considered**:
- Move `_auth-theme.scss` to `src/styles/` as a global partial: Would require updating login.scss and register.scss imports. Adds migration risk. Better done as a separate refactoring task.
- Duplicate theme variables in new components: Violates DRY. Any color change would need updates in multiple places.
- CSS custom properties at `:root` level: Good long-term approach but would require migrating existing SCSS variable usage. Overkill for this feature.

## R-002: Bottom Navigation Component Architecture

**Decision**: Create a standalone `BottomNavComponent` in `shared/components/bottom-nav/`. Include it in `app.html` conditionally using `LoginUseCase.isAuthenticated()` signal.

**Rationale**:
- The bottom nav must appear on ALL authenticated pages (clarification from spec).
- Placing it at the app shell level (`app.html`) is the only way to achieve this without modifying every page component.
- Using `@if (isAuthenticated())` hides it on login/register pages automatically.
- The component uses `RouterLink` and `RouterLinkActive` for navigation and active tab highlighting — standard Angular patterns.

**Alternatives considered**:
- Layout wrapper component: An `AuthenticatedLayoutComponent` wrapping `<router-outlet>` inside it. More complex routing setup (child routes), breaks existing route structure. Not worth the restructuring.
- Include bottom nav in each authenticated component: Violates DRY, error-prone, harder to maintain.

## R-003: Dashboard Data Loading Pattern

**Decision**: Inject `BattlePort` into `HomeComponent`. Call `listBattles()` on init, store results in a signal. Derive stats via `computed()` signals.

**Rationale**:
- `BattlePort.listBattles()` returns `Observable<Battle[]>` with full battle data including creatures array.
- Battle count = `battles().length`
- Player count = sum of `battle.creatures.length` across all battles
- This avoids any new API endpoint and follows the hexagonal pattern (component → use case/port → adapter).
- Loading/error states managed with signals, consistent with existing patterns (BattleListComponent).

**Alternatives considered**:
- Create a dedicated `DashboardUseCase`: Overkill. The dashboard just reads battle list data. No new business logic needed.
- Use the existing `BattleListComponent` logic: The list component has different UI requirements (table view, create dialog). Better to keep dashboard logic separate.

## R-004: Home Component Template Externalization

**Decision**: Extract inline template and styles from `home.ts` into `home.html` and `home.scss` files.

**Rationale**: The current home component has ~60 lines of inline template and ~100 lines of inline styles. The redesign will significantly increase template complexity (header, stats cards, battle cards, empty state). External files are more maintainable and consistent with the login/register pattern (which use external files).

**Alternatives considered**:
- Keep inline: Would result in a 300+ line component file. Violates constitution's 300-line file limit.

## R-005: Bottom Nav Icons

**Decision**: Use inline SVG for the 4 tab icons (grid/battles, book/library, sword/monsters, users/players), consistent with the login redesign approach (R-001 from 006-login-screen-redesign research).

**Rationale**: The project already established inline SVG as the icon approach for the login redesign. Consistency matters. The 4 icons are simple enough that inline SVG adds minimal template size (~4-8 lines each).

**Alternatives considered**:
- Material Icons: Available via Angular Material but would need `MatIconModule` import and doesn't match the custom RPG aesthetic.
- Unicode/emoji: Inconsistent rendering across platforms. Not suitable for navigation.

## R-006: Relative Time Display for "Last Activity"

**Decision**: Implement a simple relative time helper function (e.g., "2 hours ago", "3 days ago") without external dependencies.

**Rationale**: The dashboard needs to show "Last Activity" in human-readable relative format. A simple function comparing `lastModified` timestamp to `Date.now()` covers the needed cases (seconds, minutes, hours, days, months). No need for a library like `date-fns` or `moment` for this single use case.

**Alternatives considered**:
- `date-fns/formatDistanceToNow`: External dependency for one function. Overkill.
- Angular `DatePipe`: Only formats absolute dates, not relative time.
- `Intl.RelativeTimeFormat`: Browser API that could work but has more complex usage for auto-selecting the right unit.

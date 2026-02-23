# Quickstart: Dashboard Redesign

**Feature**: 007-dashboard-redesign
**Date**: 2026-02-21

## Prerequisites

- Node.js and npm installed
- Angular CLI available
- Backend running at `http://localhost:8080` (for battle data)

## Getting Started

```bash
# Switch to feature branch
git checkout 007-dashboard-redesign

# Install dependencies (if needed)
cd frontend-angular
npm install

# Start dev server
npm start
# → http://localhost:4200/home (redirects to login if not authenticated)
```

## Files to Create

1. `frontend-angular/src/app/shared/components/bottom-nav/bottom-nav.component.ts` - Bottom navigation bar component
2. `frontend-angular/src/app/shared/components/bottom-nav/bottom-nav.component.html` - Bottom nav template
3. `frontend-angular/src/app/shared/components/bottom-nav/bottom-nav.component.scss` - Bottom nav dark theme styles
4. `frontend-angular/src/app/shared/components/bottom-nav/bottom-nav.component.spec.ts` - Bottom nav tests
5. `frontend-angular/src/app/home/home.html` - External dashboard template (extracted from inline)
6. `frontend-angular/src/app/home/home.scss` - External dashboard styles (extracted from inline)

## Files to Modify

7. `frontend-angular/src/app/app.ts` - Import BottomNavComponent, add isAuthenticated check
8. `frontend-angular/src/app/app.html` - Add bottom nav to app shell with auth conditional
9. `frontend-angular/src/app/app.scss` - Add layout styles for bottom nav spacing
10. `frontend-angular/src/app/home/home.ts` - Redesign dashboard: inject BattlePort, add signals, switch to external template/styles
11. `frontend-angular/src/app/home/home.spec.ts` - Update tests for new dashboard (battle cards, stats, header, empty state)

## Implementation Order

1. **Create bottom nav component** - Standalone component with 4 tabs, inline SVG icons, RouterLink navigation, active tab highlighting
2. **Integrate bottom nav into app shell** - Add to `app.html` with auth conditional, add padding-bottom to main content
3. **Externalize home component** - Move inline template/styles to external files
4. **Redesign dashboard template** - Dark theme header, stats cards, battle cards, empty state
5. **Redesign dashboard styles** - Import `_auth-theme.scss`, dark RPG styling
6. **Add dashboard logic** - Inject BattlePort, load battles, computed stats, relative time helper
7. **Update tests** - Bottom nav tests, dashboard tests (rendering, stats, navigation, empty state)
8. **Visual verification** - Compare against mockup at `specs/design/dashboard_screen.png`

## Running Tests

```bash
cd frontend-angular

# Run all tests
npx ng test

# Run only dashboard tests
npx ng test --include 'src/app/home/**'

# Run only bottom nav tests
npx ng test --include 'src/app/shared/**'
```

## Key Design References

- **Mockup**: `specs/design/dashboard_screen.png`
- **Color palette**: Reuses `_auth-theme.scss` from `features/auth/shared/`
- **Research decisions**: See `research.md`
- **Existing battle model**: `core/domain/models/battle.model.ts`

## Verification Checklist

- [ ] Dashboard uses dark RPG theme matching login/register screens
- [ ] Top header shows "Active Sessions", user avatar (first letter), and logout
- [ ] Stats cards show "In Progress: N Games" and "Active Players: N"
- [ ] Battle cards display name, creature count, last activity, and "Resume Session" button
- [ ] Clicking "Resume Session" navigates to `/battles/:id`
- [ ] Empty state shown when no battles exist
- [ ] Bottom navigation bar visible on all authenticated pages
- [ ] Bottom nav has 4 tabs: Battles, Library, Monsters, Players
- [ ] Active tab highlighted with purple accent
- [ ] Each tab navigates to correct route
- [ ] Bottom nav hidden on login/register pages
- [ ] All existing tests pass
- [ ] New tests cover dashboard rendering, stats, navigation, bottom bar
- [ ] Responsive layout works on mobile (320px), tablet (768px), desktop (1920px)
- [ ] WCAG 2.1 AA color contrast compliance

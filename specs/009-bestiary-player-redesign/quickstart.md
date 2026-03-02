# Quickstart: Bestiary & Player Creation Redesign

**Branch**: `009-bestiary-player-redesign`
**Scope**: Angular frontend only — no backend required

## Prerequisites

- Node.js 18+
- `npm` or compatible package manager

## Setup

```bash
cd frontend-angular
npm install
```

## Development

```bash
# Start dev server (http://localhost:4200)
npm start

# Navigate to the pages under redesign:
# http://localhost:4200/beastery   ← Bestiary page
# http://localhost:4200/players    ← Player page

# Reference pages (already redesigned — use these as visual guides):
# http://localhost:4200/sessions   ← Session list (primary reference)
# http://localhost:4200/battles    ← Battle list (secondary reference)
```

## Running Tests

```bash
cd frontend-angular

# Run all tests once
npm test

# Run tests in watch mode (if configured)
npm test -- --watch

# Run tests for specific components
npm test -- --reporter=verbose beastery-list
npm test -- --reporter=verbose player-list
```

**Coverage thresholds** (per constitution):
- Adapter/component layer: ≥80%

## Design Reference Files

These files define the visual design system — read them before implementing:

```
frontend-angular/src/app/features/auth/shared/_auth-theme.scss
  → All color variables, typography, and mixins

frontend-angular/src/app/features/session/pages/session-list/
  → session-list.component.html  (structural reference)
  → session-list.component.scss  (SCSS reference — import pattern, class patterns)

frontend-angular/src/app/features/battle/pages/battle-list/
  → battle-list.component.html   (card list reference)
  → battle-list.component.scss
```

## Files to Change

| File | Action |
|------|--------|
| `beastery/pages/beastery-list/beastery-list.component.html` | Replace with dark theme HTML |
| `beastery/pages/beastery-list/beastery-list.component.css` | Delete |
| `beastery/pages/beastery-list/beastery-list.component.scss` | Create with dark theme SCSS |
| `beastery/pages/beastery-list/beastery-list.component.ts` | Update `styleUrls` extension |
| `player/pages/player-list/player-list.component.html` | Replace with dark theme HTML |
| `player/pages/player-list/player-list.component.css` | Delete |
| `player/pages/player-list/player-list.component.scss` | Create with dark theme SCSS |
| `player/pages/player-list/player-list.component.ts` | Update `styleUrls` extension |
| `beastery/pages/beastery-list/beastery-list.component.spec.ts` | Create/update tests |
| `player/pages/player-list/player-list.component.spec.ts` | Create/update tests |

Also check and update child dialog components if they use light styles:
- `beastery/.../creature-form-dialog/` — update if light theme found
- `player/.../player-form-dialog/` — update if light theme found

## SCSS Import Pattern

Every SCSS file in this feature must start with:

```scss
@use '../../../auth/shared/auth-theme' as *;
// Adjust path depth as needed for the component's location
```

The `:host` block must apply the dark background to the full page:

```scss
:host {
  display: block;
  min-height: 100vh;
  background: linear-gradient(180deg, $auth-bg-secondary 0%, $auth-bg 100%);
  color: $auth-text;
  font-family: $auth-font-body;
}
```

## Verification Checklist

After implementation, manually verify:

- [ ] Navigate Session List → Bestiary: no visual jarring
- [ ] Navigate Battle List → Player: no visual jarring
- [ ] Bestiary: cards display with dark background and colored border
- [ ] Bestiary: empty state matches session/battle empty state style
- [ ] Bestiary: create/edit dialog uses dark modal style
- [ ] Bestiary: delete confirmation uses dark dialog style
- [ ] Player: same checks as Bestiary above
- [ ] Player: class badge uses same pill style as status badges on other pages
- [ ] Both pages: readable and functional at 375px (mobile)
- [ ] Both pages: no horizontal scrolling at any viewport
- [ ] All tests pass: `npm test`

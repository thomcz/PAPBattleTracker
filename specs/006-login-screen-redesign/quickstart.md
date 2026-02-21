# Quickstart: Login Screen Redesign

**Feature**: 006-login-screen-redesign
**Date**: 2026-02-21

## Prerequisites

- Node.js and npm installed
- Angular CLI available
- Backend running at `http://localhost:8080` (for end-to-end testing)

## Getting Started

```bash
# Switch to feature branch
git checkout 006-login-screen-redesign

# Install dependencies (if needed)
cd frontend-angular
npm install

# Start dev server
npm start
# → http://localhost:4200/login
```

## Files to Modify

### New Files
1. `frontend-angular/src/app/features/auth/shared/_auth-theme.scss` - Shared dark RPG theme variables and mixins

### Modified Files
2. `frontend-angular/src/app/features/auth/login/login.html` - Redesigned login template
3. `frontend-angular/src/app/features/auth/login/login.scss` - Dark RPG theme styles
4. `frontend-angular/src/app/features/auth/login/login.ts` - Add `passwordVisible` signal and toggle method
5. `frontend-angular/src/app/features/auth/login/login.spec.ts` - Updated tests for new labels + password toggle tests
6. `frontend-angular/src/app/features/auth/register/register.html` - Redesigned register template
7. `frontend-angular/src/app/features/auth/register/register.scss` - Dark RPG theme styles
8. `frontend-angular/src/app/features/auth/register/register.spec.ts` - Updated tests for new labels

## Implementation Order

1. **Create shared theme** (`_auth-theme.scss`) - Define all CSS variables and shared mixins
2. **Redesign login screen** - Template, styles, password toggle logic
3. **Update login tests** - Fix label queries, add toggle tests
4. **Redesign register screen** - Template and styles (consistent with login)
5. **Update register tests** - Fix label queries
6. **Visual verification** - Compare against mockup at `specs/design/login_screen.png`

## Running Tests

```bash
cd frontend-angular

# Run all tests
npm test

# Run only auth tests
npx vitest run --reporter=verbose src/app/features/auth/
```

## Key Design References

- **Mockup**: `specs/design/login_screen.png`
- **Color palette**: See `data-model.md` (CSS custom properties table)
- **Research decisions**: See `research.md`

## Verification Checklist

- [ ] Login screen matches mockup (dark theme, gold button, thematic labels)
- [ ] Register screen uses same dark theme
- [ ] Password visibility toggle works (eye icon)
- [ ] "FORGOTTEN?" link displayed (non-functional placeholder)
- [ ] "OR JOIN THE GUILD" divider visible on login screen
- [ ] "Create New Campaign" button navigates to /register
- [ ] All existing login tests pass (with updated label queries)
- [ ] All existing register tests pass (with updated label queries)
- [ ] Form validation still works (required, minlength, email, password match)
- [ ] Authentication flow unchanged (login → JWT → redirect to home)
- [ ] Responsive layout works on mobile (320px), tablet (768px), desktop (1920px)

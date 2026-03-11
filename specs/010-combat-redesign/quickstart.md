# Quickstart: Combat Screen Redesign (010)

## What's changing

The existing `BattleDetailComponent` (one monolithic page) is split into four focused screens:

| Route | Screen | Status trigger |
|-------|--------|---------------|
| `battles/:id` | Combat Prepare | `NOT_STARTED` |
| `battles/:id/initiative` | Initiative Setup | Transitional |
| `battles/:id/combat` | Active Combat | `ACTIVE` or `PAUSED` |
| `battles/:id/result` | Combat Result | `ENDED` |

## Prerequisites

Both backend and frontend must be running:

```bash
# Terminal 1 — Backend
cd backend
./gradlew bootRun              # http://localhost:8080

# Terminal 2 — Frontend
cd frontend-angular
npm start                      # http://localhost:4200
```

## New backend endpoints to test

```bash
# Heal a creature (battle must be ACTIVE)
curl -X POST http://localhost:8080/api/battles/{id}/heal \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"creatureId": "<creature-id>", "healing": 10}'

# Apply a status effect
curl -X POST http://localhost:8080/api/battles/{id}/creatures/{creatureId}/effects \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"effect": "Poisoned", "action": "ADD"}'

# Remove a status effect
curl -X POST http://localhost:8080/api/battles/{id}/creatures/{creatureId}/effects \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"effect": "Poisoned", "action": "REMOVE"}'
```

## Frontend component map

```
frontend-angular/src/app/features/battle/
├── pages/
│   ├── combat-prepare/          # battle-detail replacement
│   │   └── combat-prepare.component.{ts,html,scss,spec.ts}
│   ├── combat-initiative/       # initiative setup screen
│   │   └── combat-initiative.component.{ts,html,scss,spec.ts}
│   ├── combat-active/           # turn-based combat
│   │   └── combat-active.component.{ts,html,scss,spec.ts}
│   └── combat-result/           # victory/defeat screen
│       └── combat-result.component.{ts,html,scss,spec.ts}
├── components/
│   ├── combatant-card/          # reusable HP/AC/status card
│   │   └── combatant-card.component.{ts,html,scss,spec.ts}
│   └── action-manager/          # damage/heal/status bottom panel
│       └── action-manager.component.{ts,html,scss,spec.ts}
└── services/
    └── combat-contribution.service.{ts,spec.ts}
```

## Running tests

```bash
# Frontend unit + component tests
cd frontend-angular
npm test

# Backend tests
cd backend
./gradlew test
```

## Known state guards

- `battles/:id` automatically redirects to `battles/:id/combat` if battle status is `ACTIVE`
- `battles/:id/initiative` is only accessible from Prepare screen (not deep-linkable mid-combat)
- `battles/:id/result` is only shown after `endCombat()` succeeds

## Design reference

All new screens use `_auth-theme.scss`:
```scss
@use '../../../auth/shared/auth-theme' as *;
// Then use $auth-bg, $auth-gold, $auth-purple, etc.
```

See `battle-list.component.scss` as the canonical style reference.

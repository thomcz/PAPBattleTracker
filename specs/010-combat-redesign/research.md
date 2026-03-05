# Research: Combat Screen Redesign

**Feature**: 010-combat-redesign
**Date**: 2026-03-03

---

## Decision 1: Screen Split Strategy — Child Routes vs. View State

**Decision**: Use Angular child routes under `battles/:id` to split combat into four distinct pages.

**Rationale**: Child routes give each phase a bookmarkable URL, clean separation of concerns, and align with Angular's lazy-loading pattern already used in `app.routes.ts`. View-state toggles (a single component that shows/hides sections) would create a monolithic component violating the hexagonal architecture principle that each slice should be independently testable.

**Route structure**:
```
battles/:id             → CombatPrepareComponent   (default)
battles/:id/initiative  → CombatInitiativeComponent
battles/:id/combat      → CombatActiveComponent
battles/:id/result      → CombatResultComponent
```

**Alternatives considered**:
- Single component with signal-based view states: Rejected — creates god component, violates single-responsibility, harder to test independently
- Separate top-level routes (`/battles/:id`, `/battles/:id/initiative`, etc.): Equivalent to child routes but child routes are cleaner as they share the URL namespace under the battle ID

---

## Decision 2: Action Manager — Bottom Sheet vs. Slide-Up Panel

**Decision**: Implement the Action Manager as a custom SCSS slide-up panel component (not Angular Material bottom sheet).

**Rationale**: The project already uses Angular Material (MatDialog, MatSnackBar, MatButton, etc.) in existing battle components, but the design shows a full-screen bottom sheet with custom styling. A CSS-animated slide-up overlay (`position: fixed; bottom: 0`) gives full visual control with minimal overhead, avoids Android-specific Material bottom sheet behaviors, and can match the dark RPG theme from `_auth-theme.scss` exactly.

**Alternatives considered**:
- `MatBottomSheet` from @angular/material: Available but imposes Material animations and limited theming flexibility
- Angular CDK `Overlay`: Powerful but adds CDK dependency complexity; the panel is simple enough for a pure CSS solution

---

## Decision 3: Healing — New Backend Endpoint vs. Negative Damage

**Decision**: Add a new `POST /api/battles/{id}/heal` backend endpoint mirroring the existing `applyDamage` endpoint.

**Rationale**: Using negative damage values would corrupt the event log (a `DamageTaken` event with amount -10 is semantically wrong in event sourcing). A dedicated heal endpoint enables a `HealingApplied` event, keeping the event store semantically clean. This aligns with the existing pattern (`applyDamage` → `DamageTaken` event).

**Backend work required**: New `ApplyHealingUseCase`, `HealingApplied` domain event, controller endpoint, frontend adapter method `applyHealing()`.

**Alternatives considered**:
- Negative damage numbers: Rejected — breaks event sourcing semantics and requires frontend to negate the value
- Extend `applyDamage` with a `type: DAMAGE | HEAL` field: Valid but conflates two different operations; separate endpoints are cleaner

---

## Decision 4: Status Effects — Backend Endpoint vs. Local Frontend State

**Decision**: Add `POST /api/battles/{id}/creatures/{creatureId}/effects` backend endpoint to apply/clear status effects. The `Creature` model already has `effects: string[]`.

**Rationale**: Status effects need to persist across page refreshes (e.g., if the user navigates away mid-combat). Since the backend already stores `effects: string[]` on Creature, a dedicated endpoint creates a `StatusEffectApplied` / `StatusEffectRemoved` event in the event store, providing full audit trail. The frontend always reads from the backend state.

**Backend work required**: New use case, event types, controller endpoint. Frontend adapter method `applyStatusEffect()`.

**Alternatives considered**:
- Frontend-only local state: Rejected — state is lost on navigation or refresh, breaking SC-007
- Extend `updateCreature` to include effects: Would work but conflates attribute editing with status tracking; dedicated endpoint is cleaner for event sourcing

---

## Decision 5: Dex Modifier — Add to Creature Model vs. Separate Data Source

**Decision**: Add optional `dexModifier: number` field to the `Creature` model (frontend and backend).

**Rationale**: The initiative setup screen shows dex modifier as a hint when entering initiative. This data comes from the creature definition. Making it nullable (`Int?` in Kotlin / `number | undefined` in TypeScript) maintains backward compatibility. When adding a creature, the DM can optionally set the dex modifier; if absent, the initiative field simply has no auto-roll hint.

**Backend work required**: Add `dexModifier` field to `CreateCreatureRequest`, `UpdateCreatureRequest`, `CreatureResponse`, and the domain `Creature` model.

**Alternatives considered**:
- Pull from bestiary creature data at initiative time: More complex, requires bestiary integration; overkill for now
- Calculate from STR/DEX/CON stats: Not tracked in the current model; out of scope

---

## Decision 6: Combat Contribution Tracking — Local Service vs. Backend

**Decision**: Track combat contribution (damage dealt, healing done, crits, buffs) in a frontend Angular service for the session duration.

**Rationale**: The result screen shows per-player contribution stats. Since the backend already logs all events in the combat log, a complete solution would replay the log to compute stats — but that is complex. A local Angular service that accumulates stats as the DM applies actions is sufficient for the MVP and delivers the required SC-001 through SC-007. The service is injected into the CombatActiveComponent and the CombatResultComponent.

**Alternatives considered**:
- Derive from combat log API: More accurate but requires parsing event log; deferred to future enhancement
- Backend aggregation endpoint: Would require new backend work beyond the scope of a UI redesign; deferred

---

## Decision 7: Component Reuse — New `CombatantCard` vs. Extending Existing `CreatureList`

**Decision**: Create a new reusable `CombatantCard` component used across all four combat screens, replacing/complementing the existing `CreatureListComponent`.

**Rationale**: The existing `CreatureListComponent` uses Angular Material (MatCard, MatButton, MatIcon) and CSS that doesn't match the dark RPG theme. The new card must show HP bars with color gradients, initiative badges, AC, status effect indicators, and a "CURRENT" highlight — none of which exist in the current component. Building a new `CombatantCard` aligned to `_auth-theme.scss` is cleaner than retrofitting the existing Material-based component.

**Decision**: Keep the existing `CreatureListComponent` for the prepare screen (add/remove creature actions) but adapt its styling. Create a new `CombatantCard` for the initiative and active combat screens where the richer display is needed.

---

## Decision 8: Quick Roll Dice

**Decision**: Implement quick roll as pure frontend logic using `Math.random()`.

**Rationale**: Dice rolls for the Action Manager (d6, d8, d12, d20) are standard random number generation. No backend integration is needed. The roll result populates the damage/healing amount input field.

**Implementation**: `Math.floor(Math.random() * sides) + 1` where sides is 6, 8, 12, or 20.

---

## Confirmed Technical Facts (from codebase exploration)

- **Angular version**: 21.0.2 (with Material + CDK 21.1.4 — CDK overlay available if needed)
- **`@angular/cdk`** is already installed — `CdkOverlayModule` available for Action Manager if desired
- **Creature domain model** already has `heal()`, `addEffect()`, `removeEffect()`, `clearEffects()` methods in Kotlin backend — domain logic exists, just needs API exposure
- **Creature.statusEffects** exists as `List<String>` in the backend domain model
- **No child routes** currently in `app.routes.ts` — this feature introduces the first nested route structure
- **Frontend Creature model** has `effects: string[]` — aligns with backend `statusEffects`
- **battle-detail.component.css** uses non-themed CSS (no `_auth-theme.scss`) — confirms full visual rework is needed
- **No `dexModifier`** field anywhere in backend or frontend models — must be added

---

## Summary of Backend Changes Required

| Change | Endpoint | Priority |
|--------|----------|----------|
| Apply healing | `POST /api/battles/{id}/heal` | Required (FR-015) |
| Apply status effect | `POST /api/battles/{id}/creatures/{creatureId}/effects` | Required (FR-016) |
| Add dexModifier to Creature | All creature endpoints | Required (FR-007, FR-008) |

## Summary of Frontend Changes Required

| Change | Type | Notes |
|--------|------|-------|
| Split `BattleDetailComponent` into 4 pages | Refactor | Child routes |
| `CombatPrepareComponent` | New page | Replaces battle-detail |
| `CombatInitiativeComponent` | New page | Initiative setup |
| `CombatActiveComponent` | New page | Turn-based combat |
| `CombatResultComponent` | New page | Victory/defeat screen |
| `ActionManagerComponent` | New component | Bottom sheet panel |
| `CombatantCardComponent` | New component | Reusable combatant card |
| `CombatContributionService` | New service | Local stat tracking |
| Extend `BattlePort` | Port update | Add `applyHealing`, `applyStatusEffect` |
| Extend `BattleApiAdapter` | Adapter update | Implement new port methods |
| Update `app.routes.ts` | Routing | Add child routes under `battles/:id` |
| Apply `_auth-theme.scss` to all new screens | Styling | Dark RPG visual consistency |

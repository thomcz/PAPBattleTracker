# Data Model: Bestiary & Player Creation Redesign

**Phase**: 1 — Design
**Date**: 2026-02-27
**Branch**: `009-bestiary-player-redesign`

## Overview

This feature is a **pure visual redesign**. No new entities are introduced and no existing entity schemas change. The data model documentation here captures the existing entities as they flow through the presentation layer, to clarify what each page must display and what constraints exist on the data.

---

## Existing Entity: Creature (Bestiary)

Used by `BeasteryListComponent` and `CreatureFormDialogComponent`.

| Field | Type | Display Label | Constraints |
|-------|------|---------------|-------------|
| `id` | string/UUID | (internal) | Required, unique |
| `name` | string | "Name" | Required, non-empty |
| `hitPoints` | number | "HP" | Required, integer ≥ 0 |
| `armorClass` | number | "AC" | Required, integer ≥ 0 |

**State transitions**: None (no status field). Creature exists or is deleted.

**Display rules**:
- Name may be long — must truncate or wrap gracefully in dark card
- HP and AC displayed as stat values (large number + small label)
- Duplicate action creates a copy with a new ID

---

## Existing Entity: Player

Used by `PlayerListComponent` and `PlayerFormDialogComponent`.

| Field | Type | Display Label | Constraints |
|-------|------|---------------|-------------|
| `id` | string/UUID | (internal) | Required, unique |
| `name` | string | "Name" | Required, non-empty |
| `characterClass` | string | "Class" | Required, displayed as badge |
| `level` | number | "Level" | Required, integer ≥ 1 |
| `maxHp` | number | "Max HP" | Required, integer ≥ 1 |

**State transitions**: None. Player exists or is deleted.

**Display rules**:
- `characterClass` rendered as a pill badge — badge color must match status badge styling on other redesigned pages
- `level` and `maxHp` displayed as stat values

---

## UI State Model (per page)

Both components manage identical UI state shapes via Angular signals. No changes to this model.

| Signal | Type | Purpose |
|--------|------|---------|
| `showFormDialog` | `Signal<boolean>` | Controls create/edit dialog visibility |
| `editingCreature` / `editingPlayer` | `Signal<Entity \| null>` | Passes entity to form dialog (null = create mode) |
| `deleteConfirmCreature` / `deleteConfirmPlayer` | `Signal<Entity \| null>` | Triggers delete confirmation dialog |

**Loading/error state** is held inside the injected use case (`BeasteryListUseCase`, `PlayerListUseCase`) and exposed as signals — no change needed.

---

## No New Entities

This feature introduces no new data entities, API payloads, or persistence changes. The backend is not involved.

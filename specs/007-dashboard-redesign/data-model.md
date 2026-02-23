# Data Model: Dashboard Redesign

**Feature**: 007-dashboard-redesign
**Date**: 2026-02-21

## Overview

This feature is primarily UI-focused. No new domain entities, database changes, or API modifications are needed. The dashboard reads from the existing `BattlePort.listBattles()` which returns `Battle[]` data.

## Existing Models (Unchanged)

### Battle
- `id`: string (unique identifier)
- `name`: string (battle name)
- `status`: CombatStatus (NOT_STARTED | ACTIVE | PAUSED | ENDED)
- `creatures`: Creature[] (participants in the battle)
- `currentTurn`: number (index of current creature in turn order)
- `round`: number (current combat round)
- `currentActor`: Creature (optional, the creature whose turn it is)
- `createdAt`: string (ISO timestamp)
- `lastModified`: string (ISO timestamp)

### Creature
- `id`: string (unique identifier)
- `name`: string
- `type`: CreatureType (PLAYER | MONSTER)
- `currentHp`: number
- `maxHp`: number
- `initiative`: number
- `armorClass`: number
- `isDefeated`: boolean
- `effects`: string[] (status effects)

### BattleSummary
- `id`: string
- `name`: string
- `status`: CombatStatus
- `createdAt`: string
- `lastModified`: string

## Component State (New)

### HomeComponent - New State

| Property | Type | Default | Purpose |
|----------|------|---------|---------|
| `battles` | `Signal<Battle[]>` | `[]` | List of user's battles fetched from API |
| `loading` | `Signal<boolean>` | `true` | Loading state while fetching battles |
| `error` | `Signal<string \| null>` | `null` | Error message if fetch fails |
| `battleCount` | `Computed<number>` | derived | Number of battles (for stats card) |
| `totalPlayers` | `Computed<number>` | derived | Sum of creatures across all battles (for stats card) |

### BottomNavComponent - State

| Property | Type | Default | Purpose |
|----------|------|---------|---------|
| N/A | N/A | N/A | Stateless component. Active tab determined by `RouterLinkActive` directive. |

## UI Theme (CSS)

Reuses the existing `_auth-theme.scss` variables. Key variables used by dashboard:

| Variable | Value | Dashboard Usage |
|----------|-------|-----------------|
| `$auth-bg` | `#1a1a2e` | Page and card backgrounds |
| `$auth-bg-secondary` | `#16213e` | Gradient, card hover |
| `$auth-purple` | `#6b46c1` | Active tab highlight, avatar background, stat card accents |
| `$auth-purple-light` | `#9b7dd4` | Hover states |
| `$auth-gold` | `#d4a843` | "Resume Session" button, stat numbers |
| `$auth-gold-hover` | `#e0b84d` | Button hover |
| `$auth-text` | `#c0c0c0` | Labels, body text |
| `$auth-text-white` | `#f0f0f0` | Headings, battle names |
| `$auth-text-light` | `#888` | Secondary text (last activity) |
| `$auth-input-border` | `rgba(255,255,255,0.15)` | Card borders, dividers |
| `$auth-error` | `#ff6b6b` | Error messages |

## Derived Data (Computed from Battle[])

| Metric | Computation | Display |
|--------|-------------|---------|
| In Progress count | `battles.filter(b => b.status !== 'ENDED').length` | "In Progress: N Games" |
| Active Players count | `battles.reduce((sum, b) => sum + b.creatures.length, 0)` | "Active Players: N" |
| Last Activity | `battle.lastModified` → relative time string | "2 hours ago" |
| Creature/Player count per battle | `battle.creatures.length` | "N players" on each card |

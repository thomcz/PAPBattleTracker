# Data Model: Login Screen Redesign

**Feature**: 006-login-screen-redesign
**Date**: 2026-02-21

## Overview

This feature is UI-only. No new domain entities, database changes, or API modifications are needed. The existing data models remain unchanged.

## Existing Models (Unchanged)

### LoginRequest
- `userName`: string (required, min 3 characters)
- `password`: string (required, min 6 characters)

### RegisterRequest
- `userName`: string (required, min 3 characters)
- `email`: string (required, valid email format)
- `password`: string (required, min 6 characters)

### AuthResponse
- `token`: string (JWT)
- `userName`: string
- `email`: string

## Component State Changes

### Login Component - New State

| Property | Type | Default | Purpose |
|----------|------|---------|---------|
| `passwordVisible` | `Signal<boolean>` | `false` | Toggles password field between `type="password"` and `type="text"` |

### Register Component - No State Changes

All existing form state, validation, and signals remain unchanged.

## UI Theme Model (CSS Custom Properties)

The dark RPG theme is defined as CSS custom properties in `_auth-theme.scss`:

| Variable | Value | Usage |
|----------|-------|-------|
| `--auth-bg` | `#1a1a2e` | Page background |
| `--auth-bg-secondary` | `#16213e` | Gradient top |
| `--auth-purple` | `#6b46c1` | Diamond logo, accents |
| `--auth-purple-light` | `#9b7dd4` | Hover states, links |
| `--auth-gold` | `#d4a843` | Primary button |
| `--auth-gold-hover` | `#e0b84d` | Primary button hover |
| `--auth-gold-border` | `#b8922f` | Primary button border |
| `--auth-text` | `#c0c0c0` | Labels, body text |
| `--auth-text-light` | `#808080` | Placeholder text |
| `--auth-input-bg` | `rgba(255,255,255,0.08)` | Input backgrounds |
| `--auth-input-border` | `rgba(255,255,255,0.15)` | Input borders |
| `--auth-input-focus-border` | `rgba(107,70,193,0.6)` | Input focus border |
| `--auth-error` | `#ff6b6b` | Error messages |
| `--auth-divider` | `rgba(255,255,255,0.15)` | Horizontal rule color |

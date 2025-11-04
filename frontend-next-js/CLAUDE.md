# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PAPBattleTracker is a Next.js 15 battle tracking application for tabletop RPGs. It allows users to manage combat encounters by tracking creatures (players and monsters), their HP, initiative order, armor class, and status effects.

## Development Commands

```bash
npm run dev          # Start development server at http://localhost:3000
npm run build        # Build production bundle
npm run start        # Start production server
npm run lint         # Run ESLint
npm test             # Run all Jest tests
npm run ci-build     # Run tests then build (CI pipeline)
```

### Running Individual Tests

```bash
npm test -- path/to/test.test.tsx                    # Run a specific test file
npm test -- --testNamePattern="test name pattern"    # Run tests matching pattern
```

## Architecture

### Core Data Flow

The application uses React state management with localStorage persistence. All battle state (creatures, combat status, turn order, logs) is automatically saved to localStorage and restored on mount.

**Main State Container**: `BattleTracker.tsx` (src/app/components/BattleTracker.tsx)
- Central state management for the entire application
- Handles all combat logic, creature management, and logging
- Persists state to localStorage under key `'battleTrackerState'`
- Coordinates between child components: `CreatureList`, `CombatControls`, `AttackDialog`, `CreatureDialog`

**Key Data Types**: `src/app/types/battles.ts`
- `Creature`: Represents players and monsters with HP, initiative, AC, and optional effects
- `LogEntry`: Combat log entries with timestamp and round number

**State Service**: `src/app/services/battleStateService.ts`
- Handles import/export of battle state as JSON files
- Used for saving and loading battle configurations

### Component Structure

```
BattleTracker (main container)
├── NavigationBar (import/export controls)
├── CombatControls (start/pause/finish combat, next turn)
├── CreatureDialog (add new creatures)
├── CreatureList (display and manage creatures)
│   └── Individual creature cards with HP/initiative/AC controls
└── AttackDialog (handle attacks between creatures)
```

### Combat Flow

1. **Setup Phase**: Add creatures with initiative, HP, and AC
2. **Combat Start**: Creatures are sorted by initiative (highest first)
3. **Turn Management**: Current turn indicator moves through creatures sequentially
4. **Round Tracking**: When last creature finishes, round increments
5. **Combat End**: Option to finish (removes monsters) or pause (keeps all creatures)

### State Management Pattern

All state mutations flow through the `BattleTracker` component and propagate down to children via props. Child components are primarily presentational and fire callbacks to modify state.

Key state includes:
- `creatures`: Array of all creatures in battle (sorted by initiative)
- `isCombatActive`: Whether combat is currently running
- `currentTurn`: Index of creature whose turn it is
- `round`: Current round number
- `combatLog`: Array of log entries for battle history

## Testing Conventions

**Important**: Use aria-labels as the primary accessor in tests. If a component lacks an aria-label, add one before writing the test (see instruction.md).

Example from existing tests:
```tsx
const removeButton = screen.getByLabelText('removeCreatureButton');
const initiativeInput = screen.getByLabelText('editInitiative');
```

Test files are co-located with components:
- `src/app/components/BattleTracker/*.test.tsx`

Test utilities and factories:
- `src/app/test/factories/creatureFactory.ts` - Factory for creating test creature objects

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: lucide-react
- **Testing**: Jest + React Testing Library + @testing-library/user-event
- **State Persistence**: localStorage (client-side only)

/**
 * Battle domain model representing a complete combat encounter.
 *
 * This matches the backend Battle aggregate structure.
 * In the frontend, we maintain this as a reactive model using Angular signals.
 */
export interface Battle {
  id: string;
  name: string;
  status: CombatStatus;
  creatures: Creature[];
  currentTurn: number;
  round: number;
  combatLog: LogEntry[];
  createdAt: string;
  lastModified: string;
}

/**
 * Combat status enum matching backend CombatStatus.
 */
export enum CombatStatus {
  NOT_STARTED = 'NOT_STARTED',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ENDED = 'ENDED'
}

/**
 * Creature interface - will be fully defined in creature.model.ts.
 * Imported here to avoid circular dependencies.
 */
export interface Creature {
  id: string;
  name: string;
  type: CreatureType;
  currentHP: number;
  maxHP: number;
  initiative: number;
  armorClass: number;
  isDefeated: boolean;
  effects: string[];
}

/**
 * Creature type enum.
 */
export enum CreatureType {
  PLAYER = 'PLAYER',
  MONSTER = 'MONSTER'
}

/**
 * Log entry interface - will be fully defined in combat-log.model.ts.
 */
export interface LogEntry {
  id: string;
  round: number;
  timestamp: string;
  text: string;
}

/**
 * Summary version of battle for list views (without full nested data).
 */
export interface BattleSummary {
  id: string;
  name: string;
  status: CombatStatus;
  createdAt: string;
  lastModified: string;
}

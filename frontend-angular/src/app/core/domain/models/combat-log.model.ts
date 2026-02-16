/**
 * Combat log entry domain model representing a recorded combat action.
 *
 * This matches the backend LogEntry structure.
 */
export interface LogEntry {
  id: string;
  round: number;
  timestamp: string;
  text: string;
}

/**
 * Combat log holds chronological entries of all combat actions.
 */
export interface CombatLog {
  entries: LogEntry[];
}

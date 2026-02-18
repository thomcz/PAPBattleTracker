/**
 * Creature domain model representing a combatant (player or monster).
 *
 * This matches the backend Creature entity structure.
 */
export interface Creature {
  id: string;
  name: string;
  type: CreatureType;
  currentHp: number;
  maxHp: number;
  initiative: number;
  armorClass: number;
  isDefeated: boolean;
  effects: string[];
}

/**
 * Creature type distinguishes between players and monsters.
 * - PLAYER creatures persist when combat ends
 * - MONSTER creatures are removed when combat ends
 */
export enum CreatureType {
  PLAYER = 'PLAYER',
  MONSTER = 'MONSTER'
}

/**
 * Request payload for adding a creature to a battle.
 */
export interface AddCreatureRequest {
  name: string;
  type: CreatureType;
  maxHp: number;
  currentHp: number;
  initiative: number;
  armorClass: number;
}

/**
 * Request payload for updating creature attributes.
 */
export interface UpdateCreatureRequest {
  name?: string;
  maxHP?: number;
  currentHP?: number;
  initiative?: number;
  armorClass?: number;
}

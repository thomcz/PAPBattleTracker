export interface Creature {
    armorClass: number;
    id: number;
    name: string;
    initiative: number;
    currentHP: number;
    maxHP: number;
    type: 'monster' | 'player';
}

export interface LogEntry {
    id: number;
    timestamp: string;
    round: number;
    text: string;
}

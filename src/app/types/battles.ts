export interface Creature {
    id: number;
    name: string;
    initiative: number;
    currentHP: number;
    maxHP: number;
}

export interface LogEntry {
    id: number;
    timestamp: string;
    round: number;
    text: string;
}
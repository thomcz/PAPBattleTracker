import { Creature, LogEntry } from "@/app/types/battles";

interface BattleState {
    creatures: Creature[];
    isCombatActive: boolean;
    currentTurn: number;
    round: number;
    combatLog: LogEntry[];
}

export const importBattleState = async (file: File): Promise<BattleState> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const state = JSON.parse(e.target?.result as string);
                resolve(state);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsText(file);
    });
};

export const exportBattleState = (state: BattleState): void => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `battle-state-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

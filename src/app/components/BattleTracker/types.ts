import { Creature, LogEntry } from "@/app/types/battles";

export interface CombatControlsProps {
    creatures: Creature[];
    isCombatActive: boolean;
    round: number;
    startCombat: () => void;
    nextTurn: () => void;
    pauseCombat: () => void;
}

export interface CreatureFormProps {
    addCreature: (e: React.FormEvent) => void;
    newName: string;
    setNewName: (name: string) => void;
    newInitiative: string;
    setNewInitiative: (initiative: string) => void;
    newHP: string;
    setNewHP: (hp: string) => void;
}

export interface CreatureListProps {
    creatures: Creature[];
    currentTurn: number;
    isCombatActive: boolean;
    adjustHP: (id: number, amount: number) => void;
    initiateAttack: (targetId: number) => void;
    moveCreature: (index: number, direction: number) => void;
    removeCreature: (id: number) => void;
}

export interface CombatLogProps {
    combatLog: LogEntry[];
}

export interface AttackDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    targetCreature?: Creature;
    onAttack: (damage: number) => void;
}

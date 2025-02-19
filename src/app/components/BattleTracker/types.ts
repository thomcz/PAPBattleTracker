import {Creature} from "@/app/types/battles";

export interface CombatControlsProps {
    creatures: Creature[];
    isCombatActive: boolean;
    round: number;
    startCombat: () => void;
    pauseCombat: () => void;
    finishCombat: () => void;
    nextTurn: () => void;
}

export interface CreatureFormProps {
    addCreature: (e: React.FormEvent) => void;
    newName: string;
    setNewName: (name: string) => void;
    newInitiative: string;
    setNewInitiative: (initiative: string) => void;
    newHP: string;
    setNewHP: (hp: string) => void;
    newAC: string;
    setNewAC: (ac: string) => void;
    creatureType: 'monster' | 'player';
    setCreatureType: (type: 'monster' | 'player') => void;
}

export interface CreatureListProps {
    creatures: Creature[];
    currentTurn: number;
    isCombatActive: boolean;
    adjustHP: (id: number, amount: number) => void;
    initiateAttack: (targetId: number) => void;
    removeCreature: (id: number) => void;
    updateInitiative: (id: number, initiative: number) => void;
    updateArmorClass: (id: number, armorClass: number) => void;
    updateEffects: (id: number, effectToRemove: string) => void;
}


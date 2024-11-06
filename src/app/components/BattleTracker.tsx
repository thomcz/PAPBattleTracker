"use client";
import React, {useCallback, useState} from 'react';
import {Creature, LogEntry} from "@/app/types/battles";
import {Download, PlusCircle, Upload} from 'lucide-react';
import {exportBattleState, importBattleState} from '@/app/services/battleStateService';
import CombatControls from './BattleTracker/CombatControls';
import CreatureList from './BattleTracker/CreatureList';
import AttackDialog from './BattleTracker/AttackDialog';
import CreatureDialog from './BattleTracker/CreatureDialog';

const BattleTracker: React.FC = () => {
    const [creatures, setCreatures] = useState<Creature[]>([]);
    const [creatureDialogOpen, setCreatureDialogOpen] = useState(false);
    const [isCombatActive, setIsCombatActive] = useState<boolean>(false);
    const [currentTurn, setCurrentTurn] = useState<number>(0);
    const [round, setRound] = useState<number>(1);
    const [attackDialogOpen, setAttackDialogOpen] = useState(false);
    const [targetId, setTargetId] = useState<number | null>(null);
    const [combatLog, setCombatLog] = useState<LogEntry[]>([]);

    // Rest of your component code remains the same, just add type annotations where needed
    const addLogEntry = (entry: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setCombatLog(prev => [{
            id: Date.now(),
            timestamp,
            round: round,
            text: entry
        }, ...prev]);
    };
    const addCreature = ({name, initiative, hp, ac, type}: {
        name: string;
        initiative: string;
        hp: string;
        ac: string;
        type: 'monster' | 'player';
    }) => {
        setCreatures([
            ...creatures,
            {
                id: Date.now(),
                name,
                initiative: parseInt(initiative),
                currentHP: parseInt(hp),
                maxHP: parseInt(hp),
                armorClass: parseInt(ac),
                type
            }
        ].sort((a, b) => b.initiative - a.initiative));
        addLogEntry(`${name} joined the battle with ${hp} HP and initiative ${initiative}`);
    };

    const removeCreature = (id: number) => {
        const creature = creatures.find(c => c.id === id);
        if (creature) {
            addLogEntry(`${creature.name} was removed from battle`);
        }
        const index = creatures.findIndex(c => c.id === id);
        if (index <= currentTurn) {
            setCurrentTurn(prev => Math.max(0, prev - 1));
        }
        setCreatures(creatures.filter(creature => creature.id !== id));
    };

    const adjustHP = (id: number, amount: number, isAttack = false) => {
        const creature = creatures.find(c => c.id === id);
        if (!creature) {
            return;
        }
        const newHP = Math.min(Math.max(0, creature.currentHP + amount), creature.maxHP);
        if (!isAttack && amount !== 0) {
            addLogEntry(`${creature.name}'s HP ${amount > 0 ? 'increased' : 'decreased'} by ${Math.abs(amount)} (${newHP}/${creature.maxHP} HP)`);
        }
        setCreatures(creatures.map(c =>
            c.id === id ? {...c, currentHP: newHP} : c
        ));
    };


    const startCombat = () => {
        setIsCombatActive(true);
        setCurrentTurn(0);
        setRound(1);
        addLogEntry('Combat started');
    };

    const nextTurn = () => {
        if (currentTurn >= creatures.length - 1) {
            setCurrentTurn(0);
            setRound(round + 1);
            addLogEntry(`Round ${round + 1} begins`);
        } else {
            setCurrentTurn(currentTurn + 1);
            addLogEntry(`${creatures[currentTurn + 1].name}'s turn begins`);
        }
    };

    const pauseCombat = () => {
        setIsCombatActive(false);
        addLogEntry('Combat paused');
    };

    const finishCombat = () => {
        setIsCombatActive(false);
        setCurrentTurn(0);
        setRound(1);
        addLogEntry('Combat finished - removing monsters');
        setCreatures(prev => prev.filter(creature => creature.type === 'player'));
    };

    const updateInitiative = (id: number, initiative: number) => {
        const creature = creatures.find(c => c.id === id);
        if (!creature) return;

        setCreatures(prev => {
            const updated = prev.map(c =>
                c.id === id ? {...c, initiative} : c
            );
            return updated.sort((a, b) => b.initiative - a.initiative);
        });
        addLogEntry(`${creature.name}'s initiative updated to ${initiative}`);
    };

    const updateArmorClass = (id: number, armorClass: number) => {
        const creature = creatures.find(c => c.id === id);
        if (!creature) return;

        setCreatures(prev =>
            prev.map(c => c.id === id ? {...c, armorClass} : c)
        );
        addLogEntry(`${creature.name}'s armor class updated to ${armorClass}`);
    };

    const initiateAttack = useCallback((id: number) => {
        setTargetId(id);
        setAttackDialogOpen(true);
    }, []);

    const handleAttack = useCallback((damage: number, effect?: string) => {
        if (targetId === null) return;

        const target = creatures.find(c => c.id === targetId);
        const attacker = creatures[currentTurn];

        if (!target || !attacker) return;

        adjustHP(targetId, -damage, true);
        setCreatures(prev => prev.map(c => {
            if (c.id === targetId && effect) {
                return {
                    ...c,
                    effects: [...(c.effects || []), effect]
                };
            }
            return c;
        }));
        const logMessage = effect 
            ? `${attacker.name} attacked ${target.name} for ${damage} damage and applied "${effect}"`
            : `${attacker.name} attacked ${target.name} for ${damage} damage`;
        addLogEntry(logMessage);
        setTargetId(null);
        setAttackDialogOpen(false);
    }, [targetId, creatures, currentTurn, adjustHP, addLogEntry]);

    const importState = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const state = await importBattleState(file);
            setCreatures(state.creatures);
            setIsCombatActive(state.isCombatActive);
            setCurrentTurn(state.currentTurn);
            setRound(state.round);
            setCombatLog(state.combatLog);
            addLogEntry('Battle state imported successfully');
        } catch (error) {
            console.error('Error importing state:', error);
            addLogEntry('Error importing battle state');
        }

        // Reset the input
        event.target.value = '';
    };

    const updateEffects = useCallback((id: number, effectToRemove: string) => {
        setCreatures(prev => prev.map(c => {
            if (c.id === id) {
                return {
                    ...c,
                    effects: (c.effects || []).filter(e => e !== effectToRemove)
                };
            }
            return c;
        }));
        const creature = creatures.find(c => c.id === id);
        if (creature) {
            addLogEntry(`Removed effect "${effectToRemove}" from ${creature.name}`);
        }
    }, [creatures, addLogEntry]);

    const exportState = () => {
        exportBattleState({
            creatures,
            isCombatActive,
            currentTurn,
            round,
            combatLog
        });
    };


    return (
        <div className="p-4 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Battle Tracker</h1>
                <div className="flex gap-2">
                    <input
                        type="file"
                        accept=".json"
                        onChange={importState}
                        className="hidden"
                        id="import-state"
                        aria-label="importStateInput"
                    />
                    <label
                        htmlFor="import-state"
                        className="bg-purple-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-purple-600 cursor-pointer"
                        aria-label="importStateButton"
                    >
                        <Upload className="w-5 h-5"/>
                        Import State
                    </label>
                    <button
                        onClick={exportState}
                        className="bg-purple-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-purple-600"
                        aria-label="exportStateButton"
                    >
                        <Download className="w-5 h-5"/>
                        Export State
                    </button>
                    <CombatControls
                        creatures={creatures}
                        isCombatActive={isCombatActive}
                        round={round}
                        startCombat={startCombat}
                        nextTurn={nextTurn}
                        pauseCombat={pauseCombat}
                        finishCombat={finishCombat}
                    />
                </div>
            </div>

            <button
                onClick={() => setCreatureDialogOpen(true)}
                className="mb-6 bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-600"
                aria-label="openCreatureDialogButton"
            >
                <PlusCircle className="w-5 h-5"/>
                Add Creature
            </button>

            <CreatureDialog
                isOpen={creatureDialogOpen}
                onClose={() => setCreatureDialogOpen(false)}
                onAdd={addCreature}
            />

            <CreatureList
                creatures={creatures}
                currentTurn={currentTurn}
                isCombatActive={isCombatActive}
                adjustHP={adjustHP}
                initiateAttack={initiateAttack}
                removeCreature={removeCreature}
                updateInitiative={updateInitiative}
                updateArmorClass={updateArmorClass}
                updateEffects={updateEffects}
            />

            <AttackDialog
                isOpen={attackDialogOpen}
                onClose={() => {
                    setAttackDialogOpen(false);
                    setTargetId(null);
                }}
                onAttack={handleAttack}
                targetName={creatures.find(c => c.id === targetId)?.name || ''}
            />
        </div>
    );
};

export default BattleTracker;

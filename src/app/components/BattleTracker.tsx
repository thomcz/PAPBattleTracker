"use client";
import React, { useState } from 'react';
import { Creature, LogEntry } from "@/app/types/battles";
import CombatControls from './BattleTracker/CombatControls';
import CreatureForm from './BattleTracker/CreatureForm';
import CreatureList from './BattleTracker/CreatureList';
import CombatLog from './BattleTracker/CombatLog';
import AttackDialog from './BattleTracker/AttackDialog';

const BattleTracker: React.FC = () => {
    const [creatures, setCreatures] = useState<Creature[]>([]);
    const [newName, setNewName] = useState<string>('');
    const [newInitiative, setNewInitiative] = useState<string>('');
    const [newHP, setNewHP] = useState<string>('');
    const [newAC, setNewAC] = useState<string>('');
    const [creatureType, setCreatureType] = useState<'monster' | 'player'>('monster');
    const [isCombatActive, setIsCombatActive] = useState<boolean>(false);
    const [currentTurn, setCurrentTurn] = useState<number>(0);
    const [round, setRound] = useState<number>(1);
    const [attackDialogOpen, setAttackDialogOpen] = useState<boolean>(false);
    const [targetId, setTargetId] = useState<number>(0);
    const [damageAmount, setDamageAmount] = useState<string>('');
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const addCreature = (e: any) => {
        e.preventDefault();
        if (newName && newInitiative && newHP && newAC) {
            setCreatures([
                ...creatures,
                {
                    id: Date.now(),
                    name: newName,
                    initiative: parseInt(newInitiative),
                    currentHP: parseInt(newHP),
                    maxHP: parseInt(newHP),
                    armorClass: parseInt(newAC),
                    type: creatureType
                }
            ].sort((a, b) => b.initiative - a.initiative));
            addLogEntry(`${newName} joined the battle with ${newHP} HP and initiative ${newInitiative}`);
            setNewName('');
            setNewInitiative('');
            setNewHP('');
            setNewAC('');
        }
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

    const moveCreature = (index: number, direction: number) => {
        const newCreatures = [...creatures];
        const temp = newCreatures[index];
        newCreatures[index] = newCreatures[index + direction];
        newCreatures[index + direction] = temp;

        addLogEntry(`${temp.name} moved ${direction > 0 ? 'down' : 'up'} in initiative order`);

        setCreatures(newCreatures);

        if (isCombatActive) {
            if (index === currentTurn) {
                setCurrentTurn(currentTurn + direction);
            } else if (index + direction === currentTurn) {
                setCurrentTurn(currentTurn - direction);
            }
        }
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

    const initiateAttack = (targetId: number) => {
        setTargetId(targetId);
        setAttackDialogOpen(true);
        setDamageAmount('');
    };

    const executeAttack = () => {
        const damage = parseInt(damageAmount);
        if (!isNaN(damage) && damage >= 0) {
            const attacker = creatures[currentTurn];
            const target = creatures.find(c => c.id === targetId);
            if (!target) {
                return;
            }
            const oldHP = target.currentHP;
            adjustHP(targetId, -damage, true);
            const newHP = Math.max(0, oldHP - damage);

            addLogEntry(`${attacker.name} attacked ${target.name} for ${damage} damage (${newHP}/${target.maxHP} HP)`);
            if (newHP === 0) {
                addLogEntry(`${target.name} was defeated!`);
            }

            setAttackDialogOpen(false);
            setTargetId(0);
            setDamageAmount('');
        }
    };

    return (
        <div className="p-4 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Battle Tracker</h1>
                <div className="flex gap-2">
                    <CombatControls
                        creatures={creatures}
                        isCombatActive={isCombatActive}
                        round={round}
                        startCombat={startCombat}
                        nextTurn={nextTurn}
                        pauseCombat={pauseCombat}
                        finishCombat={finishCombat}
                    />
                    <CombatLog combatLog={combatLog} />
                </div>
            </div>

            <CreatureForm
                addCreature={addCreature}
                newName={newName}
                setNewName={setNewName}
                newInitiative={newInitiative}
                setNewInitiative={setNewInitiative}
                newHP={newHP}
                setNewHP={setNewHP}
                newAC={newAC}
                setNewAC={setNewAC}
                creatureType={creatureType}
                setCreatureType={setCreatureType}
            />

            <CreatureList
                creatures={creatures}
                currentTurn={currentTurn}
                isCombatActive={isCombatActive}
                adjustHP={adjustHP}
                initiateAttack={initiateAttack}
                moveCreature={moveCreature}
                removeCreature={removeCreature}
                updateInitiative={updateInitiative}
                updateArmorClass={updateArmorClass}
            />

            <AttackDialog
                isOpen={attackDialogOpen}
                setIsOpen={setAttackDialogOpen}
                targetCreature={creatures.find(c => c.id === targetId)}
                onAttack={executeAttack}
            />
        </div>
    );
};

export default BattleTracker;

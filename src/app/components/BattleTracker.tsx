"use client";
import React, {useState} from 'react';
import {
    ArrowDownCircle,
    ArrowUpCircle,
    Heart,
    Pause,
    Play,
    PlusCircle,
    RotateCw,
    ScrollText,
    Sword,
    Trash2
} from 'lucide-react';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/app/components/ui/dialog";
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from "@/app/components/ui/sheet";
import {Creature, LogEntry} from "@/app/types/battles";

const BattleTracker: React.FC = () => {
    const [creatures, setCreatures] = useState<Creature[]>([]);
    const [newName, setNewName] = useState<string>('');
    const [newInitiative, setNewInitiative] = useState<string>('');
    const [newHP, setNewHP] = useState<string>('');
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
        if (newName && newInitiative && newHP) {
            setCreatures([
                ...creatures,
                {
                    id: Date.now(),
                    name: newName,
                    initiative: parseInt(newInitiative),
                    currentHP: parseInt(newHP),
                    maxHP: parseInt(newHP)
                }
            ].sort((a, b) => b.initiative - a.initiative));
            addLogEntry(`${newName} joined the battle with ${newHP} HP and initiative ${newInitiative}`);
            setNewName('');
            setNewInitiative('');
            setNewHP('');
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
                    {creatures.length > 0 && (
                        <>
                            {!isCombatActive ? (
                                <button
                                    onClick={startCombat}
                                    className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-600"
                                >
                                    <Play className="w-5 h-5"/>
                                    Start Combat
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <span className="px-4 py-2 bg-gray-100 rounded">Round {round}</span>
                                    <button
                                        onClick={nextTurn}
                                        className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-600"
                                    >
                                        <RotateCw className="w-5 h-5"/>
                                        Next Turn
                                    </button>
                                    <button
                                        onClick={pauseCombat}
                                        className="bg-yellow-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-yellow-600"
                                    >
                                        <Pause className="w-5 h-5"/>
                                        Pause
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                    <Sheet>
                        <SheetTrigger
                            className="bg-gray-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-600">
                            <ScrollText className="w-5 h-5"/>
                            Combat Log
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Combat Log</SheetTitle>
                            </SheetHeader>
                            <div className="mt-4 space-y-2">
                                {combatLog.map(entry => (
                                    <div key={entry.id} className="text-sm border-b pb-2">
                    <span className="text-gray-500 text-xs">
                      [{entry.timestamp} - Round {entry.round}]
                    </span>
                                        <div>{entry.text}</div>
                                    </div>
                                ))}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            <form onSubmit={addCreature} className="mb-6 flex gap-2 flex-wrap">
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Creature name"
                    className="border p-2 rounded"
                    aria-label="creatureNameInput"
                />
                <input
                    type="number"
                    value={newInitiative}
                    onChange={(e) => setNewInitiative(e.target.value)}
                    placeholder="Initiative"
                    className="border p-2 rounded w-24"
                />
                <input
                    type="number"
                    value={newHP}
                    onChange={(e) => setNewHP(e.target.value)}
                    placeholder="HP"
                    className="border p-2 rounded w-24"
                />
                <button
                    type="submit"
                    className="bg-green-500 text-white p-2 rounded flex items-center gap-2 hover:bg-green-600"
                >
                    <PlusCircle className="w-5 h-5"/>
                    Add
                </button>
            </form>

            <div className="space-y-2">
                {creatures.map((creature, index) => (
                    <div
                        key={creature.id}
                        className={`border p-4 rounded flex items-center gap-4 transition-colors ${
                            isCombatActive && index === currentTurn
                                ? 'bg-yellow-100 border-yellow-400'
                                : 'bg-white'
                        }`}
                    >
                        <div className="flex-1">
                            <div className="font-bold">{creature.name}</div>
                            <div className="text-sm text-gray-600">
                                Initiative: {creature.initiative}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Heart className="text-red-500 w-5 h-5"/>
                            <button
                                onClick={() => adjustHP(creature.id, -1)}
                                className="px-2 py-1 bg-red-100 rounded hover:bg-red-200"
                            >
                                -
                            </button>
                            <span className="w-16 text-center">
                {creature.currentHP}/{creature.maxHP}
              </span>
                            <button
                                onClick={() => adjustHP(creature.id, 1)}
                                className="px-2 py-1 bg-green-100 rounded hover:bg-green-200"
                            >
                                +
                            </button>
                        </div>

                        <div className="flex gap-2">
                            {isCombatActive && index === currentTurn ? (
                                <button
                                    onClick={() => initiateAttack(creature.id)}
                                    className="p-1 text-red-500 hover:text-red-600 disabled:opacity-50"
                                    disabled={index === currentTurn}
                                >
                                    <Sword className="w-5 h-5"/>
                                </button>
                            ) : (
                                isCombatActive && (
                                    <button
                                        onClick={() => initiateAttack(creature.id)}
                                        className="p-1 hover:text-red-600"
                                    >
                                        <Sword className="w-5 h-5"/>
                                    </button>
                                )
                            )}
                            {index > 0 && (
                                <button
                                    onClick={() => moveCreature(index, -1)}
                                    className="p-1 hover:text-blue-600"
                                >
                                    <ArrowUpCircle className="w-5 h-5"/>
                                </button>
                            )}
                            {index < creatures.length - 1 && (
                                <button
                                    onClick={() => moveCreature(index, 1)}
                                    className="p-1 hover:text-blue-600"
                                >
                                    <ArrowDownCircle className="w-5 h-5"/>
                                </button>
                            )}
                            <button
                                onClick={() => removeCreature(creature.id)}
                                className="p-1 text-red-500 hover:text-red-600"
                            >
                                <Trash2 className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={attackDialogOpen} onOpenChange={setAttackDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Attack {creatures.find(c => c.id === targetId)?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="p-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Enter damage amount:
                            </label>
                            <input
                                type="number"
                                value={damageAmount}
                                onChange={(e) => setDamageAmount(e.target.value)}
                                className="border p-2 rounded w-full"
                                min="0"
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setAttackDialogOpen(false)}
                                className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeAttack}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Attack
                            </button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BattleTracker;
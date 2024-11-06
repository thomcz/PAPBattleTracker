import React from 'react';
import {Heart, Shield, Sword, Trash2, User} from 'lucide-react';
import {CreatureListProps} from './types';

const CreatureList: React.FC<CreatureListProps & {
    updateEffects: (id: number, effectToRemove: string) => void;
}> = ({
    creatures,
    currentTurn,
    isCombatActive,
    adjustHP,
    initiateAttack,
    removeCreature,
    updateInitiative,
    updateArmorClass,
    updateEffects
}) => {
    return (
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
                        <div className="font-bold flex items-center gap-2">
                            {creature.name}
                            {creature.type === 'player' && <User className="w-4 h-4" aria-label="Player Character"/>}
                            {creature.effects?.map((effect, index) => (
                                <span
                                    key={index}
                                    className="text-sm bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full cursor-pointer"
                                    onClick={() => updateEffects(creature.id, effect)}
                                    aria-label={`effect-${effect}`}
                                >
                                    {effect}
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                                Initiative:
                                <input
                                    type="number"
                                    value={creature.initiative}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        if (!isNaN(value)) {
                                            updateInitiative(creature.id, value);
                                        }
                                    }}
                                    className="w-16 border rounded px-1"
                                    aria-label="editInitiative"
                                />
                            </div>
                            <div className="flex items-center gap-1">
                                <Shield className="w-4 h-4" aria-label="Armor Class"/>
                                <input
                                    type="number"
                                    value={creature.armorClass}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        if (!isNaN(value)) {
                                            updateArmorClass(creature.id, value);
                                        }
                                    }}
                                    className="w-16 border rounded px-1"
                                    aria-label="editArmorClass"
                                />
                            </div>
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
                        {isCombatActive && (
                            <button
                                aria-label="attackButton"
                                onClick={() => initiateAttack(creature.id)}
                                className={`p-1 ${
                                    index === currentTurn
                                        ? 'text-red-500 hover:text-red-600 disabled:opacity-50'
                                        : 'hover:text-red-600'
                                }`}
                                disabled={index === currentTurn}
                            >
                                <Sword className="w-5 h-5" data-testid="sword"/>
                            </button>
                        )}
                        <button
                            aria-label="removeCreatureButton"
                            onClick={() => removeCreature(creature.id)}
                            className="p-1 text-red-500 hover:text-red-600"
                        >
                            <Trash2 className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CreatureList;

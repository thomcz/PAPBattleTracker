import React from 'react';
import { Heart, Sword, ArrowUpCircle, ArrowDownCircle, Trash2 } from 'lucide-react';
import { CreatureListProps } from './types';

const CreatureList: React.FC<CreatureListProps> = ({
    creatures,
    currentTurn,
    isCombatActive,
    adjustHP,
    initiateAttack,
    moveCreature,
    removeCreature
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
                        {isCombatActive && (
                            <button
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

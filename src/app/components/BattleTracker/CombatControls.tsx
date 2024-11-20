import React from 'react';
import {Pause, Play, StopCircle} from 'lucide-react';
import {CombatControlsProps} from './types';

const CombatControls: React.FC<CombatControlsProps> = ({
                                                           creatures,
                                                           isCombatActive,
                                                           round,
                                                           startCombat,
                                                           pauseCombat,
                                                           finishCombat,
                                                           nextTurn
                                                       }) => {
    if (creatures.length === 0) return null;

    if (!isCombatActive) {
        return (
            <button
                onClick={startCombat}
                className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-600"
                aria-label="startCombatButton"
            >
                <Play className="w-5 h-5"/>
                Start Combat
            </button>
        );
    }

    return (
        <div className="flex justify-between w-full">
            <div className="flex gap-2">
                <span className="px-4 py-2 bg-gray-100 rounded">Round {round}</span>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={nextTurn}
                    className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-600"
                    aria-label="skipTurnButton"
                >
                    <Play className="w-5 h-5"/>
                </button>
                <button
                    onClick={pauseCombat}
                    className="bg-yellow-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-yellow-600"
                    aria-label="pauseCombatButton"
                >
                    <Pause className="w-5 h-5"/>
                </button>
                <button
                    onClick={finishCombat}
                    className="bg-red-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-red-600"
                    aria-label="finishCombatButton"
                >
                    <StopCircle className="w-5 h-5"/>
                </button>
            </div>
        </div>
    );
};

export default CombatControls;

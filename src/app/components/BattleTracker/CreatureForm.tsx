import React from 'react';
import { PlusCircle } from 'lucide-react';
import { CreatureFormProps } from './types';

const CreatureForm: React.FC<CreatureFormProps> = ({
    addCreature,
    newName,
    setNewName,
    newInitiative,
    setNewInitiative,
    newHP,
    setNewHP,
    newAC,
    setNewAC,
    creatureType,
    setCreatureType
}) => {
    return (
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
            <input
                type="number"
                value={newAC}
                onChange={(e) => setNewAC(e.target.value)}
                placeholder="AC"
                className="border p-2 rounded w-24"
                aria-label="armorClassInput"
            />
            <select
                value={creatureType}
                onChange={(e) => setCreatureType(e.target.value as 'monster' | 'player')}
                className="border p-2 rounded"
                aria-label="creatureTypeSelect"
            >
                <option value="monster">Monster</option>
                <option value="player">Player</option>
            </select>
            <button
                type="submit"
                className="bg-green-500 text-white p-2 rounded flex items-center gap-2 hover:bg-green-600"
            >
                <PlusCircle className="w-5 h-5"/>
                Add
            </button>
        </form>
    );
};

export default CreatureForm;

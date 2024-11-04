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
    setNewHP
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

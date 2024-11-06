import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';

interface CreatureDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (creature: {
        name: string;
        initiative: string;
        hp: string;
        ac: string;
        type: 'monster' | 'player';
    }) => void;
}

const CreatureDialog: React.FC<CreatureDialogProps> = ({
    isOpen,
    onClose,
    onAdd,
}) => {
    const [name, setName] = useState('');
    const [initiative, setInitiative] = useState('');
    const [hp, setHp] = useState('');
    const [ac, setAc] = useState('');
    const [type, setType] = useState<'monster' | 'player'>('monster');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && initiative && hp && ac) {
            onAdd({ name, initiative, hp, ac, type });
            setName('');
            setInitiative('');
            setHp('');
            setAc('');
            setType('monster');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg w-96">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Add New Creature</h2>
                    <button 
                        onClick={onClose}
                        className="p-1 hover:text-gray-600"
                        aria-label="closeCreatureDialog"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Creature name"
                            className="w-full border p-2 rounded"
                            aria-label="creatureNameInput"
                        />
                    </div>
                    <div>
                        <input
                            type="number"
                            value={initiative}
                            onChange={(e) => setInitiative(e.target.value)}
                            placeholder="Initiative"
                            className="w-full border p-2 rounded"
                            aria-label="initiativeInput"
                        />
                    </div>
                    <div>
                        <input
                            type="number"
                            value={hp}
                            onChange={(e) => setHp(e.target.value)}
                            placeholder="HP"
                            className="w-full border p-2 rounded"
                            aria-label="hpInput"
                        />
                    </div>
                    <div>
                        <input
                            type="number"
                            value={ac}
                            onChange={(e) => setAc(e.target.value)}
                            placeholder="AC"
                            className="w-full border p-2 rounded"
                            aria-label="armorClassInput"
                        />
                    </div>
                    <div>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as 'monster' | 'player')}
                            className="w-full border p-2 rounded"
                            aria-label="creatureTypeSelect"
                        >
                            <option value="monster">Monster</option>
                            <option value="player">Player</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center justify-center gap-2"
                        aria-label="addCreatureButton"
                    >
                        <PlusCircle className="w-5 h-5"/>
                        Add Creature
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreatureDialog;

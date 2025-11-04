import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AttackDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAttack: (damage: number, effect?: string) => void;
    targetName: string;
}

const AttackDialog: React.FC<AttackDialogProps> = ({
    isOpen,
    onClose,
    onAttack,
    targetName,
}) => {
    const [damage, setDamage] = useState<string>('');
    const [effect, setEffect] = useState<string>('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const damageValue = parseInt(damage);
        if (!isNaN(damageValue)) {
            onAttack(damageValue, effect || undefined);
            setDamage('');
            setEffect('');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg w-96">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Attack {targetName}</h2>
                    <button 
                        onClick={onClose}
                        className="p-1 hover:text-gray-600"
                        aria-label="closeAttackDialog"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Damage Amount
                        </label>
                        <input
                            type="number"
                            value={damage}
                            onChange={(e) => setDamage(e.target.value)}
                            className="mt-1 block w-full border rounded-md shadow-sm p-2"
                            placeholder="Enter damage"
                            aria-label="damageInput"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Effect (Optional)
                        </label>
                        <input
                            type="text"
                            value={effect}
                            onChange={(e) => setEffect(e.target.value)}
                            className="mt-1 block w-full border rounded-md shadow-sm p-2"
                            placeholder="Enter effect"
                            aria-label="effectInput"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        aria-label="confirmAttackButton"
                    >
                        Attack
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AttackDialog;

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { AttackDialogProps } from './types';

const AttackDialog: React.FC<AttackDialogProps> = ({
    isOpen,
    setIsOpen,
    targetCreature,
    onAttack
}) => {
    const [damageAmount, setDamageAmount] = useState<string>('');

    const handleAttack = () => {
        const damage = parseInt(damageAmount);
        if (!isNaN(damage) && damage >= 0) {
            onAttack(damage);
            setDamageAmount('');
            setIsOpen(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Attack {targetCreature?.name}</DialogTitle>
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
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAttack}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Attack
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AttackDialog;

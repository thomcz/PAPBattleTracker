import React from 'react';
import { ScrollText } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/app/components/ui/sheet";
import { CombatLogProps } from './types';

const CombatLog: React.FC<CombatLogProps> = ({ combatLog }) => {
    return (
        <Sheet>
            <SheetTrigger className="bg-gray-500 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-gray-600">
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
    );
};

export default CombatLog;

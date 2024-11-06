import React from 'react';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreatureList from './CreatureList';
import '@testing-library/jest-dom';
import {Creature} from "@/app/types/battles";

describe('CreatureList Component', () => {
    const user = userEvent.setup();
    const mockAdjustHP = jest.fn();
    const mockInitiateAttack = jest.fn();
    const mockRemoveCreature = jest.fn();
    const mockUpdateInitiative = jest.fn();
    const mockUpdateArmorClass = jest.fn();
    const mockUpdateEffects = jest.fn();

    const props = {
        currentTurn: 0,
        isCombatActive: true,
        adjustHP: mockAdjustHP,
        initiateAttack: mockInitiateAttack,
        removeCreature: mockRemoveCreature,
        updateInitiative: mockUpdateInitiative,
        updateArmorClass: mockUpdateArmorClass,
        updateEffects: mockUpdateEffects
    }
    const multiCreatureProps = {
        creatures: [
            {
                id: 1,
                name: 'Goblin',
                initiative: 10,
                armorClass: 15,
                currentHP: 30,
                maxHP: 30,
                effects: ['Poisoned']
            } as Creature,
            {id: 2, name: 'Orc', initiative: 12, armorClass: 13, currentHP: 0, maxHP: 30} as Creature
        ],
        ...props
    };

    const singleCreatureProps = {
        creatures: [
            {
                id: 1,
                name: 'Goblin',
                initiative: 10,
                armorClass: 15,
                currentHP: 30,
                maxHP: 30
            } as Creature
        ],
        ...props
    }

    it('renders creatures with correct details', () => {
        render(<CreatureList {...multiCreatureProps} />);
        expect(screen.getByText('Goblin')).toBeInTheDocument();
        expect(screen.getByText('Orc')).toBeInTheDocument();
        expect(screen.getByText('30/30')).toBeInTheDocument();
        expect(screen.getByText('0/30')).toBeInTheDocument();
    });

    it('calls adjustHP when HP buttons are clicked', async () => {
        render(<CreatureList {...singleCreatureProps} />);
        const decreaseButton = screen.getAllByRole('button', {name: '-'})[0];
        const increaseButton = screen.getAllByRole('button', {name: '+'})[0];

        await user.click(decreaseButton);
        expect(mockAdjustHP).toHaveBeenCalledWith(1, -1);

        await user.click(increaseButton);
        expect(mockAdjustHP).toHaveBeenCalledWith(1, 1);
    });

    it('renders heart icon near hp when HP is above 0', async () => {
        render(<CreatureList {...singleCreatureProps} />);

        expect(document.querySelector('.lucide-heart')).toBeInTheDocument();
    });

    it('changes icon to skull when HP drops to 0', async () => {
        const zeroHPSingleCreatureProps = {
            ...singleCreatureProps,
            creatures: [
                {
                    ...singleCreatureProps.creatures[0],
                    currentHP: 0
                }
            ]
        };

        render(<CreatureList {...zeroHPSingleCreatureProps} />);

        expect(document.querySelector('.lucide-skull')).toBeInTheDocument();
    });

    it('calls removeCreature when remove button is clicked', async () => {
        render(<CreatureList {...singleCreatureProps} />);
        const removeButton = screen.getByLabelText('removeCreatureButton');
        await user.click(removeButton);
        expect(mockRemoveCreature).toHaveBeenCalledWith(1);
    });

    it('updates initiative and armor class on input change', async () => {
        render(<CreatureList {...singleCreatureProps} />);
        const initiativeInput = screen.getByLabelText('editInitiative');
        const armorClassInput = screen.getByLabelText('editArmorClass');

        await user.type(initiativeInput, '1');
        expect(mockUpdateInitiative).toHaveBeenCalledWith(1, 101);

        await user.clear(armorClassInput);
        await user.type(armorClassInput, '1');
        expect(mockUpdateArmorClass).toHaveBeenCalledWith(1, 151);
    });

    it('removes effect when effect is clicked', async () => {
        render(<CreatureList {...multiCreatureProps} />);
        const effect = screen.getByText('Poisoned');
        await user.click(effect);
        expect(mockUpdateEffects).toHaveBeenCalledWith(1, 'Poisoned');
    });
});

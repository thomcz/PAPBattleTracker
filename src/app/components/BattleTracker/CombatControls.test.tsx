import React from 'react';
import {render, screen} from '@testing-library/react';
import CombatControls from './CombatControls';
import '@testing-library/jest-dom';
import {Creature} from "@/app/types/battles";
import userEvent from "@testing-library/user-event";

describe('CombatControls Component', () => {
    const user = userEvent.setup()
    const mockStartCombat = jest.fn();
    const mockNextTurn = jest.fn();
    const mockPauseCombat = jest.fn();
    const mockFinishCombat = jest.fn();

    const defaultProps = {
        creatures: [{id: 1, name: 'Goblin'} as Creature],
        isCombatActive: false,
        round: 1,
        startCombat: mockStartCombat,
        nextTurn: mockNextTurn,
        pauseCombat: mockPauseCombat,
        finishCombat: mockFinishCombat,
    };

    it('renders start combat button when combat is not active', () => {
        render(<CombatControls {...defaultProps} />);
        const startButton = screen.getByLabelText('startCombatButton');
        expect(startButton).toBeInTheDocument();
    });

    it('calls startCombat when start button is clicked', async () => {
        render(<CombatControls {...defaultProps} />);
        const startButton = screen.getByLabelText('startCombatButton');
        await user.click(startButton);
        expect(mockStartCombat).toHaveBeenCalled();
    });

    it('renders combat controls when combat is active', () => {
        render(<CombatControls {...defaultProps} isCombatActive={true}/>);
        expect(screen.getByLabelText('pauseCombatButton')).toBeInTheDocument();
        expect(screen.getByLabelText('finishCombatButton')).toBeInTheDocument();
    });

    it('calls pauseCombat when pause button is clicked', async () => {
        render(<CombatControls {...defaultProps} isCombatActive={true}/>);
        const pauseButton = screen.getByLabelText('pauseCombatButton');
        await user.click(pauseButton);
        expect(mockPauseCombat).toHaveBeenCalled();
    });

    it('calls nextTurn when skip turn button is clicked', async () => {
        render(<CombatControls {...defaultProps} isCombatActive={true}/>);
        const skipButton = screen.getByLabelText('skipTurnButton');
        await user.click(skipButton);
        expect(mockNextTurn).toHaveBeenCalled();
    });

    it('calls finishCombat when finish button is clicked', async () => {
        render(<CombatControls {...defaultProps} isCombatActive={true}/>);
        const finishButton = screen.getByLabelText('finishCombatButton');
        await user.click(finishButton);
        expect(mockFinishCombat).toHaveBeenCalled();
    });
});

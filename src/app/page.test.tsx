import '@testing-library/jest-dom'
import {render, screen} from '@testing-library/react'
import Home from "@/app/page";
import userEvent from '@testing-library/user-event'

describe('Home', () => {
    const user = userEvent.setup()

    it('renders a heading', () => {
        render(<Home/>)

        const heading = screen.getByRole('heading', {name: 'Battle Tracker'})

        expect(heading).toBeInTheDocument()
    })
    it('adds a creature and checks if it appears in the list', async () => {
        render(<Home/>);

        // Simulate user input
        const nameInput = screen.getByRole('textbox', {name: /creatureNameInput/i});
        const initiativeInput = screen.getByPlaceholderText('Initiative');
        const hpInput = screen.getByPlaceholderText('HP');
        const acInput = screen.getByPlaceholderText('AC');
        const addButton = screen.getByRole('button', {name: /add/i});

        // Fill the form
        await user.type(nameInput, 'Goblin');
        await user.type(initiativeInput, '15');
        await user.type(hpInput, '30');
        await user.type(acInput, '14');

        // Simulate form submission
        await user.click(addButton);

        // Check if the creature appears in the list
        const creatureName = screen.getByText('Goblin');
        const creatureInitiative = screen.getByText('Initiative: 15');
        const creatureHP = screen.getByText('30/30');
        const creatureAC = screen.getByText('AC: 14');

        expect(creatureName).toBeInTheDocument();
        expect(creatureInitiative).toBeInTheDocument();
        expect(creatureHP).toBeInTheDocument();
        expect(creatureAC).toBeInTheDocument();
    });


    it('adds a creature and then removes it from the list', async () => {
        render(<Home/>);

        // Simulate user input
        const nameInput = screen.getByRole('textbox', {name: /creatureNameInput/i});
        const initiativeInput = screen.getByPlaceholderText('Initiative');
        const hpInput = screen.getByPlaceholderText('HP');
        const acInput = screen.getByPlaceholderText('AC');
        const addButton = screen.getByRole('button', {name: /add/i});

        // Fill the form
        await user.type(nameInput, 'Orc');
        await user.type(initiativeInput, '10');
        await user.type(hpInput, '40');
        await user.type(acInput, '16');

        // Simulate form submission
        await user.click(addButton);

        // Check if the creature appears in the list
        const creatureName = screen.getByText('Orc');
        expect(creatureName).toBeInTheDocument();

        // Remove the creature
        const removeButton = screen.getByRole('button', {name: /removeCreatureButton/i});
        await user.click(removeButton);

        // Check if the creature is removed from the list
        expect(screen.queryByText('Orc')).not.toBeInTheDocument();
    });

    it('adds two creatures and reduces health of one', async () => {
        render(<Home/>);

        // Add first creature
        const nameInput = screen.getByRole('textbox', {name: /creatureNameInput/i});
        const initiativeInput = screen.getByPlaceholderText('Initiative');
        const hpInput = screen.getByPlaceholderText('HP');
        const addButton = screen.getByRole('button', {name: /add/i});
        const acInput = screen.getByPlaceholderText('AC');

        await user.type(nameInput, 'Dragon');
        await user.type(initiativeInput, '20');
        await user.type(hpInput, '100');
        await user.type(acInput, '19');
        await user.type(acInput, '19');
        await user.click(addButton);

        // Add second creature
        await user.type(nameInput, 'Knight');
        await user.type(initiativeInput, '15');
        await user.type(hpInput, '50');
        await user.type(acInput, '18');
        await user.type(acInput, '18');
        await user.click(addButton);

        // Find the decrease HP button for Knight
        const decreaseButtons = screen.getAllByRole('button', {name: '-'});

        // Click decrease button 5 times
        for (let i = 0; i < 5; i++) {
            await user.click(decreaseButtons[1]); // Second creature's decrease button
        }

        // Verify Knight's HP is reduced by 5
        const knightHP = screen.getByText('45/50');
        expect(knightHP).toBeInTheDocument();
    });

    it('verifies combat flow with two creatures', async () => {
        render(<Home/>);
        const user = userEvent.setup();

        // Add first creature (higher initiative)
        const nameInput = screen.getByRole('textbox', {name: /creatureNameInput/i});
        const initiativeInput = screen.getByPlaceholderText('Initiative');
        const hpInput = screen.getByPlaceholderText('HP');
        const addButton = screen.getByRole('button', {name: /add/i});
        const acInput = screen.getByPlaceholderText('AC');

        await user.type(nameInput, 'Dragon');
        await user.type(initiativeInput, '20');
        await user.type(hpInput, '100');
        await user.type(acInput, '20');
        await user.click(addButton);

        // Add second creature (lower initiative)
        await user.type(nameInput, 'Knight');
        await user.type(initiativeInput, '15');
        await user.type(hpInput, '50');
        await user.type(acInput, '20');
        await user.click(addButton);

        // Start combat
        const startButton = screen.getByRole('button', {name: /startCombatButton/i});
        await user.click(startButton);

        // Verify Round 1 and first creature (Dragon) is highlighted
        expect(screen.getByText('Round 1')).toBeInTheDocument();
        const dragonDiv = screen.getByText('Dragon').closest('div');

        expect(dragonDiv?.parentElement?.parentElement).toHaveClass('bg-yellow-100');

        // Next turn - verify Knight is highlighted
        const nextTurnButton = screen.getByRole('button', {name: /nextTurnButton/i});
        await user.click(nextTurnButton);
        const knightDiv = screen.getByText('Knight').closest('div');
        expect(knightDiv?.parentElement?.parentElement).toHaveClass('bg-yellow-100');

        // Next turn again - verify Round 2 started and Dragon is highlighted
        await user.click(nextTurnButton);
        expect(screen.getByText('Round 2')).toBeInTheDocument();
        expect(dragonDiv?.parentElement?.parentElement).toHaveClass('bg-yellow-100');

        // Pause combat
        const pauseButton = screen.getByRole('button', {name: /pauseCombatButton/i});
        await user.click(pauseButton);

        // Verify combat controls are replaced with start button
        expect(screen.queryByRole('button', {name: /pauseCombatButton/i})).not.toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /nextTurnButton/i})).not.toBeInTheDocument();
        expect(screen.getByRole('button', {name: /startCombatButton/i})).toBeInTheDocument();
    });
});

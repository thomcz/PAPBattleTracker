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
        const addButton = screen.getByRole('button', {name: /add/i});

        // Fill the form
        await user.type(nameInput, 'Goblin');
        await user.type(initiativeInput, '15');
        await user.type(hpInput, '30');

        // Simulate form submission
        await user.click(addButton);

        // Check if the creature appears in the list
        const creatureName = screen.getByText('Goblin');
        const creatureInitiative = screen.getByText('Initiative: 15');
        const creatureHP = screen.getByText('30/30');

        expect(creatureName).toBeInTheDocument();
        expect(creatureInitiative).toBeInTheDocument();
        expect(creatureHP).toBeInTheDocument();
    });


    it('adds a creature and then removes it from the list', async () => {
        render(<Home/>);

        // Simulate user input
        const nameInput = screen.getByRole('textbox', {name: /creatureNameInput/i});
        const initiativeInput = screen.getByPlaceholderText('Initiative');
        const hpInput = screen.getByPlaceholderText('HP');
        const addButton = screen.getByRole('button', {name: /add/i});

        // Fill the form
        await user.type(nameInput, 'Orc');
        await user.type(initiativeInput, '10');
        await user.type(hpInput, '40');

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

        await user.type(nameInput, 'Dragon');
        await user.type(initiativeInput, '20');
        await user.type(hpInput, '100');
        await user.click(addButton);

        // Add second creature
        await user.type(nameInput, 'Knight');
        await user.type(initiativeInput, '15');
        await user.type(hpInput, '50');
        await user.click(addButton);

        // Find the decrease HP button for Knight
        const decreaseButtons = screen.getAllByRole('button', { name: '-' });
        
        // Click decrease button 5 times
        for(let i = 0; i < 5; i++) {
            await user.click(decreaseButtons[1]); // Second creature's decrease button
        }

        // Verify Knight's HP is reduced by 5
        const knightHP = screen.getByText('45/50');
        expect(knightHP).toBeInTheDocument();
    });
});

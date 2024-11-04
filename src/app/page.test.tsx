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

});
